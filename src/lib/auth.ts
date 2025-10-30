import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  collegeId: string | null;
  departmentId: string | null;
  programId: string | null;
  batchId: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      collegeId: user.collegeId,
      departmentId: user.departmentId,
      programId: user.programId,
      batchId: user.batchId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(email: string, password: string, collegeId?: string) {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      college: true,
      department: true,
      program: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  // Validate college for department role
  if (user.role === 'DEPARTMENT' && collegeId && user.collegeId !== collegeId) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    collegeId: user.collegeId,
    departmentId: user.departmentId,
    programId: user.programId,
    batchId: user.batchId,
  };
}