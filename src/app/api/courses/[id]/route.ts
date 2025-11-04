import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { status } = body;
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Delete course
    await db.course.delete({
      where: { id: courseId }
    });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}