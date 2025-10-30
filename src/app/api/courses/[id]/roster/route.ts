import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/courses/[id]/roster - Get the class roster for a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get the current roster (enrolled students)
    const enrolledStudents = await db.enrollment.findMany({
      where: {
        courseId: courseId,
        isActive: true,
      },
      include: {
        student: {
          include: {
            program: {
              select: {
                name: true,
                code: true,
              },
            },
            batch: {
              select: {
                name: true,
                startYear: true,
                endYear: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          name: 'asc', // Order by student name
        },
      },
    });

    // Format the response
    const roster = enrolledStudents.map(enrollment => ({
      enrollmentId: enrollment.id,
      student: {
        id: enrollment.student.id,
        email: enrollment.student.email,
        name: enrollment.student.name,
        role: enrollment.student.role,
        isActive: enrollment.student.isActive,
        program: enrollment.student.program,
        batch: enrollment.student.batch,
      },
      semester: enrollment.semester,
      enrolledAt: enrollment.createdAt,
    }));

    // Get summary statistics
    const summary = {
      totalEnrolled: enrolledStudents.length,
      activeStudents: enrolledStudents.filter(e => e.student.isActive).length,
      inactiveStudents: enrolledStudents.filter(e => !e.student.isActive).length,
      courseInfo: {
        code: course.code,
        name: course.name,
        semester: course.semester,
        status: course.status,
        program: course.batch.program.name,
        batch: course.batch.name,
      },
    };

    return NextResponse.json({
      roster,
      summary,
    });

  } catch (error) {
    console.error('Error fetching course roster:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course roster' },
      { status: 500 }
    );
  }
}