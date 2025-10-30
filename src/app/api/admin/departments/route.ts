import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    const departments = await db.department.findMany({
      where: collegeId ? { collegeId } : {},
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            programs: true,
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, code, collegeId, description } = await request.json();

    if (!name || !code || !collegeId) {
      return NextResponse.json(
        { error: 'Name, code, and college are required' },
        { status: 400 }
      );
    }

    // Check if college exists
    const college = await db.college.findUnique({
      where: { id: collegeId }
    });

    if (!college) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      );
    }

    // Check if department with same name or code already exists in this college
    const existingDepartment = await db.department.findFirst({
      where: {
        collegeId,
        OR: [
          { name: name },
          { code: code }
        ]
      }
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department with this name or code already exists in this college' },
        { status: 409 }
      );
    }

    const department = await db.department.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        collegeId,
        description: description?.trim() || null
      },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}