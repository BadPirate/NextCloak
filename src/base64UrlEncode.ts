import crypto from 'crypto'

export default function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-') // Replace '+' with '-'
    .replace(/\//g, '_') // Replace '/' with '_'
    .replace(/=+$/, '') // Remove trailing '='
}

export const base64Sha256 = (string: string) => base64UrlEncode(
  crypto.createHash('sha256').update(string, 'utf-8').digest(),
)
