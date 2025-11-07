import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';
import { canCreateCourse } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Fetch course with detailed information
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        batch: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        courseOutcomes: {
          where: { isActive: true },
          orderBy: { code: 'asc' }
        },
        assessments: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' }
        },
        enrollments: {
          where: { isActive: true },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true
              }
            }
          }
        },
        _count: {
          select: {
            courseOutcomes: {
              where: { isActive: true }
            },
            assessments: {
              where: { isActive: true }
            },
            enrollments: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Format the response
    const formattedCourse = {
      id: course.id,
      code: course.code,
      name: course.name,
      semester: course.semester,
      description: course.description,
      status: course.status,
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      programName: course.batch.program.name,
      batchName: course.batch.name,
      stats: {
        students: course._count.enrollments,
        assessments: course._count.assessments,
        cos: course._count.courseOutcomes
      },
      courseOutcomes: course.courseOutcomes,
      assessments: course.assessments,
      enrollments: course.enrollments
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const body = await request.json();
    const { status } = body;
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Validate status
    if (!['FUTURE', 'ACTIVE', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be FUTURE, ACTIVE, or COMPLETED' 
      }, { status: 400 });
    }

    // Update course status
    const course = await db.course.update({
      where: { id: courseId },
      data: { status }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(
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
        error: 'Insufficient permissions. Only admin, university, department, and program coordinator roles can delete courses.' 
      }, { status: 403 });
    }

    console.log('=== DELETING COURSE ===');
    console.log('Course ID:', courseId);
    console.log('User:', { id: user.id, role: user.role, name: user.name });

    // Check if course exists and get its details
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        batch: {
          include: {
            program: true
          }
        },
        _count: {
          select: {
            courseOutcomes: true,
            assessments: true,
            enrollments: true,
            coPOMappings: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Additional permission check for program coordinators
    if (user.role === 'PROGRAM_COORDINATOR' && course.batch.programId !== user.programId) {
      return NextResponse.json({ 
        error: 'You can only delete courses from your assigned program' 
      }, { status: 403 });
    }

    console.log('Course found:', course.code, course.name);
    console.log('Related records:', course._count);

    // Delete related records in order to respect foreign key constraints
    
    // 1. Delete CO-PO Mappings first (as they reference COs)
    await db.cOPOMapping.deleteMany({
      where: {
        courseId: courseId
      }
    });
    console.log('Deleted CO-PO mappings');

    // 2. Delete Questions (as they reference Assessments and COs)
    const assessments = await db.assessment.findMany({
      where: { courseId: courseId }
    });
    
    for (const assessment of assessments) {
      await db.question.deleteMany({
        where: { assessmentId: assessment.id }
      });
    }
    console.log('Deleted questions for all assessments');

    // 3. Delete Assessments
    await db.assessment.deleteMany({
      where: { courseId: courseId }
    });
    console.log('Deleted assessments');

    // 4. Delete COs (after questions and mappings are deleted)
    await db.cO.deleteMany({
      where: { courseId: courseId }
    });
    console.log('Deleted COs');

    // 5. Delete Enrollments
    await db.enrollment.deleteMany({
      where: { courseId: courseId }
    });
    console.log('Deleted enrollments');

    // 6. Finally delete the course
    await db.course.delete({
      where: { id: courseId }
    });
    console.log('Deleted course successfully');

    return NextResponse.json({ 
      message: 'Course deleted successfully',
      deletedCourse: {
        code: course.code,
        name: course.name
      }
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ 
      error: 'Failed to delete course',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}