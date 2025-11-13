import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { withLogging, createRequestContext, authLogger } from '@/lib/api-logger';

export const POST = withLogging(async (request: NextRequest) => {
  const { requestId, startTime } = createRequestContext(request);
  
  try {
    const { email, password, collegeId } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password, collegeId);

    if (!user) {
      authLogger('login_failed', new Error('Authentication failed'), {
        email,
        requestId,
      });
      
      return NextResponse.json(
        { error: 'Invalid credentials or college access denied' },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email || '',
      name: user.name,
      role: user.role,
      collegeId: user.collegeId || null,
      departmentId: user.departmentId || null,
      programId: user.programId || null,
      batchId: user.batchId || null,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        collegeId: user.collegeId,
        departmentId: user.departmentId,
        programId: user.programId,
      },
      token,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    throw error;
  }
});