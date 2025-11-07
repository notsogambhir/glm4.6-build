import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';
import { canCreateCourse } from '@/lib/permissions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Get authenticated user and check permissions
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!canCreateCourse(user)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Only admin, university, department, and program coordinator roles can update course status.' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['FUTURE', 'ACTIVE', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be FUTURE, ACTIVE, or COMPLETED' 
      }, { status: 400 });
    }

    // Get the course to verify permissions
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        batch: {
          include: {
            program: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check permissions for program coordinators
    if (user.role === 'PROGRAM_COORDINATOR' && course.batch.programId !== user.programId) {
      return NextResponse.json({ 
        error: 'You can only update status for courses in your assigned program' 
      }, { status: 403 });
    }

    // Update course status
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    console.log(`Updated course ${course.code} status to ${status}`);

    return NextResponse.json({
      message: `Course status updated to ${status}`,
      course: updatedCourse
    });

  } catch (error) {
    console.error('Error updating course status:', error);
    return NextResponse.json({ 
      error: 'Failed to update course status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}