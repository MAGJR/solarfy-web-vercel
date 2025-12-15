export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  // US phone format: (XXX) XXX-XXXX or XXX-XXX-XXXX or XXXXXXXXXX
  const phoneRegex = /^\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})$/
  return phoneRegex.test(phone.replace(/\s+/g, ' ').trim())
}

export const validateSSN = (ssn: string): boolean => {
  // Remove any dashes or spaces
  ssn = ssn.replace(/[-\s]/g, '')

  if (ssn.length !== 9) return false

  // Check for invalid SSN patterns
  const invalidPatterns = [
    '000000000', '111111111', '222222222', '333333333',
    '444444444', '555555555', '666666666', '777777777',
    '888888888', '999999999', '123456789'
  ]

  if (invalidPatterns.indexOf(ssn) !== -1) return false

  // Check area number (first 3 digits) - cannot be 000, 666, or 900-999
  const areaNumber = ssn.substring(0, 3)
  if (areaNumber === '000' || areaNumber === '666') return false
  const areaNum = parseInt(areaNumber)
  if (areaNum >= 900 && areaNum <= 999) return false

  // Check group number (middle 2 digits) - cannot be 00
  const groupNumber = ssn.substring(3, 5)
  if (groupNumber === '00') return false

  // Check serial number (last 4 digits) - cannot be 0000
  const serialNumber = ssn.substring(5, 9)
  if (serialNumber === '0000') return false

  return true
}

export const validateEIN = (ein: string): boolean => {
  // EIN format: XX-XXXXXXX
  ein = ein.replace(/[-\s]/g, '')

  if (ein.length !== 9) return false

  // Check for invalid EIN patterns
  const invalidPatterns = [
    '000000000', '111111111', '222222222', '333333333',
    '444444444', '555555555', '666666666', '777777777',
    '888888888', '999999999'
  ]

  return invalidPatterns.indexOf(ein) === -1
}

export const validateZIP = (zip: string): boolean => {
  // US ZIP format: XXXXX or XXXXX-XXXX
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zip)
}

export const validateStateCode = (state: string): boolean => {
  const stateCodes = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
  ]
  return stateCodes.indexOf(state.toUpperCase()) !== -1
}