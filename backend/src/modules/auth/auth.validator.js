const validateRegister = (data) => {
  const errors = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters')
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required')
  }

  if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone)) {
    errors.push('Valid 10-digit Indian mobile number is required')
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters')
  }

  if (!data.role || !['STUDENT', 'OWNER', 'DELIVERY'].includes(data.role)) {
    errors.push('Role must be STUDENT, OWNER, or DELIVERY')
  }

  return errors
}

const validateLogin = (data) => {
  const errors = []

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required')
  }

  if (!data.password || data.password.length < 1) {
    errors.push('Password is required')
  }

  return errors
}

module.exports = { validateRegister, validateLogin }