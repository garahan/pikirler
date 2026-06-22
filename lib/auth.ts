import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin'

export function createToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return false

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)

    return decoded && decoded.isAdmin === true
  } catch (error) {
    return false
  }
}

export function createAdminToken(): string {
  return createToken({ isAdmin: true, createdAt: new Date() })
}