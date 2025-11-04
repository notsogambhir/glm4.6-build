import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';

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

    // Get authenticated user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    // Fetch enrolled students for the course
    const enrollments = await db.enrollment.findMany({
      where: {
        courseId: courseId,
        isActive: true
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            role: true
          }
        }
      },
      orderBy: {
        student: {
          studentId: 'asc'
        }
      }
    });

    // Transform the data for the frontend
    const students = enrollments.map(enrollment => ({
      id: enrollment.student.id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      studentId: enrollment.student.studentId,
      enrollmentId: enrollment.id,
      semester: enrollment.semester,
      enrolledAt: enrollment.createdAt
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching course roster:', error);
    return NextResponse.json({ error: 'Failed to fetch course roster' }, { status: 500 });
  }
}

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

    const body = await request.json();
    const { studentIds, semester } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Student IDs are required' }, { status: 400 });
    }

    if (!semester) {
      return NextResponse.json({ error: 'Semester is required' }, { status: 400 });
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
        error: 'You can only manage enrollments for courses in your assigned program' 
      }, { status: 403 });
    }

    // Get students to enroll
    const students = await db.user.findMany({
      where: {
        id: { in: studentIds },
        role: 'STUDENT',
        isActive: true
      }
    });

    if (students.length === 0) {
      return NextResponse.json({ error: 'No valid students found' }, { status: 404 });
    }

    // Create enrollments
    const enrollments = await Promise.all(
      students.map(async (student) => {
        // Check if already enrolled
        const existingEnrollment = await db.enrollment.findFirst({
          where: {
            courseId: courseId,
            studentId: student.id,
            isActive: true
          }
        });

        if (existingEnrollment) {
          return null; // Skip already enrolled
        }

        return await db.enrollment.create({
          data: {
            courseId: courseId,
            studentId: student.id,
            semester: semester.trim(),
            isActive: true
          }
        });
      })
    );

    const successfulEnrollments = enrollments.filter(e => e !== null);

    console.log(`Enrolled ${successfulEnrollments.length} students in course ${courseId}`);

    return NextResponse.json({
      message: `Successfully enrolled ${successfulEnrollments.length} students`,
      enrolledCount: successfulEnrollments.length,
      skippedCount: students.length - successfulEnrollments.length
    });
  } catch (error) {
    console.error('Error enrolling students:', error);
    return NextResponse.json({ error: 'Failed to enroll students' }, { status: 500 });
  }
}