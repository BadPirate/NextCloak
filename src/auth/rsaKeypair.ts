const privateKey = Buffer.from(process.env.RSA_PRIVATE_KEY as string, 'base64').toString('utf-8')
const publicKey = Buffer.from(process.env.RSA_PUBLIC_KEY as string, 'base64').toString('utf-8')

const rsaKeypair = { privateKey, publicKey }

export default rsaKeypair
