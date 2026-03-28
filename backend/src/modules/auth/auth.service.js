const prisma = require('../../config/db')
const { hashPassword, comparePassword } = require('../../utils/hash')
const { generateToken } = require('../../utils/jwt')

const registerUser = async ({ name, email, phone, password, role }) => {
  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) {
    const err = new Error('Email already registered')
    err.statusCode = 409
    throw err
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone } })
  if (existingPhone) {
    const err = new Error('Phone number already registered')
    err.statusCode = 409
    throw err
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      profilePhoto: true,
      createdAt: true,
    },
  })

  const token = generateToken({ id: user.id, role: user.role })

  return { user, token }
}

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  if (!user) {
    const err = new Error('Invalid email or password')
    err.statusCode = 401
    throw err
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Contact support.')
    err.statusCode = 403
    throw err
  }

  const isMatch = await comparePassword(password, user.passwordHash)
  if (!isMatch) {
    const err = new Error('Invalid email or password')
    err.statusCode = 401
    throw err
  }

  const token = generateToken({ id: user.id, role: user.role })

  const { passwordHash, ...userWithoutPassword } = user

  return { user: userWithoutPassword, token }
}

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      profilePhoto: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  return user
}

const updateProfile = async (userId, { name, phone }) => {
  if (phone) {
    const existingPhone = await prisma.user.findFirst({
      where: { phone, NOT: { id: userId } },
    })
    if (existingPhone) {
      const err = new Error('Phone number already in use')
      err.statusCode = 409
      throw err
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name: name.trim() }),
      ...(phone && { phone: phone.trim() }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      profilePhoto: true,
      updatedAt: true,
    },
  })

  return user
}

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  const isMatch = await comparePassword(currentPassword, user.passwordHash)
  if (!isMatch) {
    const err = new Error('Current password is incorrect')
    err.statusCode = 400
    throw err
  }

  if (newPassword.length < 6) {
    const err = new Error('New password must be at least 6 characters')
    err.statusCode = 400
    throw err
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  })

  return { message: 'Password changed successfully' }
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
}