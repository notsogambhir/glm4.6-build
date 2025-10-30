import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const departmentId = searchParams.get('departmentId');
    const programId = searchParams.get('programId');

    // Build where clause based on user role and filters
    let whereClause: any = {};

    if (role) {
      whereClause.role = role;
    }

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    if (programId) {
      whereClause.programId = programId;
    }

    // Apply role-based filtering
    switch (user.role) {
      case 'ADMIN':
      case 'UNIVERSITY':
        // Can see all users
        break;
        
      case 'DEPARTMENT':
        // Can only see users from their department
        whereClause.departmentId = user.departmentId;
        break;
        
      case 'PROGRAM_COORDINATOR':
        // Can only see users from their program
        whereClause.programId = user.programId;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
    }

    const users = await db.user.findMany({
      where: whereClause,
      include: {
        department: {
          select: {
            name: true,
            code: true
          }
        },
        program: {
          select: {
            name: true,
            code: true
          }
        },
        batch: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}