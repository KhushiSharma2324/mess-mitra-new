const cloudinary = require('cloudinary').v2
const multer = require('multer')
const { success, error, badRequest } = require('../../utils/response')
const prisma = require('../../config/db')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  },
})

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `messmitra/${folder}`, resource_type: 'image' },
      (err, result) => {
        if (err) reject(err)
        else resolve(result)
      }
    ).end(buffer)
  })
}

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return badRequest(res, 'No image file provided')

    const result = await uploadToCloudinary(req.file.buffer, 'profiles')

    await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePhoto: result.secure_url },
    })

    return success(res, { url: result.secure_url }, 'Profile photo uploaded')
  } catch (err) {
    return error(res, err.message, 500)
  }
}

const uploadMessPhoto = async (req, res) => {
  try {
    if (!req.file) return badRequest(res, 'No image file provided')

    const mess = await prisma.mess.findFirst({ where: { ownerId: req.user.id } })
    if (!mess) return error(res, 'Mess not found', 404)

    const result = await uploadToCloudinary(req.file.buffer, 'mess')

    await prisma.mess.update({
      where: { id: mess.id },
      data: { coverPhoto: result.secure_url },
    })

    return success(res, { url: result.secure_url }, 'Mess photo uploaded')
  } catch (err) {
    return error(res, err.message, 500)
  }
}

module.exports = { upload, uploadProfilePhoto, uploadMessPhoto }
