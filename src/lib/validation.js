/**
 * Validates a full name.
 * Rules: non-empty, min 2 chars, max 80, only letters/spaces/hyphens/apostrophes
 */
export function validateName(value) {
  const v = value.trim()
  if (!v) return 'Name is required.'
  if (v.length < 2) return 'Name must be at least 2 characters.'
  if (v.length > 80) return 'Name must be under 80 characters.'
  if (!/^[a-zA-Z\s'\-\.]+$/.test(v)) return 'Name can only contain letters, spaces, hyphens, or apostrophes.'
  return null
}

/**
 * Validates an email address.
 */
export function validateEmail(value) {
  const v = value.trim()
  if (!v) return 'Email is required.'
  // RFC-5322 simplified
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter a valid email address.'
  if (v.length > 254) return 'Email is too long.'
  return null
}

/**
 * Validates a local phone number given a dial code.
 * Strips formatting chars, checks digit count roughly per region.
 */
export function validatePhone(local, dialCode) {
  const cleaned = local.replace(/[\s\-().+]/g, '')
  if (!cleaned) return 'Phone number is required.'
  if (!/^\d+$/.test(cleaned)) return 'Phone number must contain digits only.'

  // Min/max digit counts by dial code (local part only)
  const limits = {
    '+91':  { min: 10, max: 10 },
    '+1':   { min: 10, max: 10 },
    '+44':  { min: 10, max: 11 },
    '+61':  { min: 9,  max: 9  },
    '+971': { min: 9,  max: 9  },
    '+65':  { min: 8,  max: 8  },
    '+49':  { min: 10, max: 12 },
  }

  const rule = limits[dialCode]
  if (rule) {
    if (cleaned.length < rule.min) return `Phone must be ${rule.min} digits for this country code.`
    if (cleaned.length > rule.max) return `Phone must be at most ${rule.max} digits for this country code.`
  } else {
    if (cleaned.length < 6 || cleaned.length > 15) return 'Please enter a valid phone number.'
  }

  return null
}

/**
 * Returns E.164 formatted number from local + dial code.
 */
export function toE164(local, dialCode) {
  const cleaned = local.replace(/[\s\-().+]/g, '')
  return `${dialCode}${cleaned}`
}
