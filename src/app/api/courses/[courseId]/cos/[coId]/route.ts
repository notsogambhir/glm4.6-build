import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';
import { canCreateCourse } from '@/lib/permissions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; coId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { courseId, coId } = resolvedParams;

    if (!courseId || !coId) {
      return NextResponse.json({ error: 'Course ID and CO ID are required' }, { status: 400 });
    }

    // Get authenticated user and check permissions
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!canCreateCourse(user)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Only admin, university, department, and program coordinator roles can manage COs.' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { description } = body;

    if (!description || description.trim().length === 0) {
      return NextResponse.json({ error: 'CO description is required' }, { status: 400 });
    }

    // Get the CO to verify it belongs to the course
    const co = await db.cO.findFirst({
      where: {
        id: coId,
        courseId: courseId,
        isActive: true
      },
      include: {
        course: {
          include: {
            batch: {
              include: {
                program: true
              }
            }
          }
        }
      }
    });

    if (!co) {
      return NextResponse.json({ error: 'CO not found' }, { status: 404 });
    }

    // Check permissions for program coordinators
    if (user.role === 'PROGRAM_COORDINATOR' && co.course.batch.programId !== user.programId) {
      return NextResponse.json({ 
        error: 'You can only manage COs for courses in your assigned program' 
      }, { status: 403 });
    }

    // Update CO
    const updatedCO = await db.cO.update({
      where: { id: coId },
      data: {
        description: description.trim(),
        updatedAt: new Date()
      }
    });

    console.log(`Updated CO ${co.code} for course ${courseId}`);

    return NextResponse.json(updatedCO);
  } catch (error) {
    console.error('Error updating CO:', error);
    return NextResponse.json({ error: 'Failed to update CO' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; coId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { courseId, coId } = resolvedParams;

    if (!courseId || !coId) {
      return NextResponse.json({ error: 'Course ID and CO ID are required' }, { status: 400 });
    }

    // Get authenticated user and check permissions
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!canCreateCourse(user)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Only admin, university, department, and program coordinator roles can manage COs.' 
      }, { status: 403 });
    }

    // Get the CO to verify it belongs to the course
    const co = await db.cO.findFirst({
      where: {
        id: coId,
        courseId: courseId,
        isActive: true
      },
      include: {
        course: {
          include: {
            batch: {
              include: {
                program: true
              }
            }
          }
        }
      }
    });

    if (!co) {
      return NextResponse.json({ error: 'CO not found' }, { status: 404 });
    }

    // Check permissions for program coordinators
    if (user.role === 'PROGRAM_COORDINATOR' && co.course.batch.programId !== user.programId) {
      return NextResponse.json({ 
        error: 'You can only manage COs for courses in your assigned program' 
      }, { status: 403 });
    }

    // Check if CO is referenced in any mappings or questions
    const mappingCount = await db.cOPOMapping.count({
      where: { coId: coId }
    });

    const questionCount = await db.question.count({
      where: { coId: coId }
    });

    if (mappingCount > 0 || questionCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete CO that is referenced in CO-PO mappings or assessment questions' 
      }, { status: 400 });
    }

    // Soft delete CO (set isActive to false)
    await db.cO.update({
      where: { id: coId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    console.log(`Deleted CO ${co.code} for course ${courseId}`);

    return NextResponse.json({ message: 'CO deleted successfully' });
  } catch (error) {
    console.error('Error deleting CO:', error);
    return NextResponse.json({ error: 'Failed to delete CO' }, { status: 500 });
  }
}