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
    const collegeId = searchParams.get('collegeId');

    // Build where clause based on user role and filters
    let whereClause: any = {};

    if (collegeId) {
      whereClause.collegeId = collegeId;
    }

    // Apply role-based filtering
    switch (user.role) {
      case 'ADMIN':
      case 'UNIVERSITY':
        // Can see all departments
        break;
        
      case 'DEPARTMENT':
        // Can only see their own department
        whereClause.id = user.departmentId;
        break;
        
      case 'PROGRAM_COORDINATOR':
        // Can only see departments through their program
        if (user.programId) {
          const program = await db.program.findUnique({
            where: { id: user.programId },
            select: { departmentId: true }
          });
          if (program) {
            whereClause.id = program.departmentId;
          }
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
    }

    const departments = await db.department.findMany({
      where: whereClause,
      include: {
        college: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            programs: true,
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(departments);

  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}