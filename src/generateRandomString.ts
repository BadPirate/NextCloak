import crypto from 'crypto'

const generateRandomString = (length: number) => crypto.randomBytes(length).toString('hex')

export default generateRandomString
