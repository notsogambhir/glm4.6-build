import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';

const updateStatusSchema = z.object({
  status: z.enum(['FUTURE', 'ACTIVE', 'COMPLETED']),
});

// Handle POST requests with method override for PATCH compatibility
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== API ROUTE: POST /api/courses/[id]/status (Method Override) ===');
    
    const { id } = await params;
    
    // Check if this is a method override request
    const methodOverride = request.headers.get('x-http-method-override');
    if (methodOverride !== 'PATCH') {
      return NextResponse.json(
        { error: 'Method override required. Use x-http-method-override: PATCH header' },
        { status: 405 }
      );
    }
    
    console.log('Method override detected, treating as PATCH request');
    
    // Delegate to PATCH handler
    return await PATCH(request, { params });
    
  } catch (error) {
    console.error('Error in POST method override:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process method override request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== API ROUTE: PATCH /api/courses/[id]/status ===');
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const { id } = await params;
    
    // Authentication check
    const authHeader = request.headers.get('authorization');
    const token = request.cookies.get('auth-token')?.value;
    
    console.log(`Course status update attempt for course ID: ${id}`);
    console.log(`Token present: ${!!token}`);
    console.log(`Auth header present: ${!!authHeader}`);
    console.log(`Token value: ${token ? token.substring(0, 20) + '...' : 'null'}`);
    console.log(`All cookies:`, Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 20) + '...'])));

    if (!token) {
      console.log('No authentication token found in cookies');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    
    if (!user) {
      console.log('Token verification failed - invalid token');
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    console.log('Token verification successful - user:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Check if user has permission to update course status
    if (user.role !== 'PROGRAM_COORDINATOR' && user.role !== 'ADMIN') {
      console.log(`Access denied for user role: ${user.role} (required: PROGRAM_COORDINATOR or ADMIN)`);
      return NextResponse.json(
        { error: 'Insufficient permissions', requiredRole: 'PROGRAM_COORDINATOR or ADMIN', userRole: user.role },
        { status: 403 }
      );
    }

    console.log(`Authentication successful - updating course status for course ID: ${id} by user: ${user.name} (${user.role})`);
    
    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);
    
    console.log(`New status: ${status}`);

    // Check if course exists and get current status
    const course = await db.course.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!course) {
      console.log(`Course not found: ${id}`);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    console.log(`Found course: ${course.code}, current status: ${course.status}`);
    console.log(`Course belongs to program: ${course.batch.program.name}, batch: ${course.batch.name}`);

    // Update course status
    const updatedCourse = await db.course.update({
      where: { id },
      data: { status },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
        _count: {
          select: {
            courseOutcomes: true,
            assessments: true,
            enrollments: true,
          },
        },
      },
    });

    console.log(`Updated course status to: ${updatedCourse.status}`);

    // AUTOMATIC ENROLLMENT LOGIC
    // If course is changing from FUTURE to ACTIVE, enroll eligible students
    if (course.status === 'FUTURE' && status === 'ACTIVE') {
      console.log(`Course activation detected - executing automatic enrollment logic`);
      
      // Step A: Identify the Context
      const programId = course.batch.programId;
      const batchId = course.batchId;
      const courseId = id;
      
      console.log(`Enrollment context - Program: ${programId}, Batch: ${batchId}, Course: ${courseId}`);

      // Step B: Query the Master Student List
      // Find all students who meet ALL criteria:
      // 1. Their programId matches the course's program ID
      // 2. They belong to the current batch
      // 3. Their status is 'Active'
      const eligibleStudents = await db.user.findMany({
        where: {
          programId: programId,
          batchId: batchId,
          role: 'STUDENT',
          isActive: true,
        },
      });

      console.log(`Found ${eligibleStudents.length} eligible students for enrollment`);

      if (eligibleStudents.length > 0) {
        // Step C: Create the Roster
        // Prepare enrollment data for each eligible student
        const enrollmentData = eligibleStudents.map(student => ({
          courseId: courseId,
          studentId: student.id,
          semester: course.semester,
        }));

        console.log(`Preparing to enroll students:`, eligibleStudents.map(s => ({ 
          id: s.email, 
          name: s.name 
        })));

        // Step D: Prevent Duplicates
        // Create enrollments with duplicate prevention
        const enrollmentResult = await db.enrollment.createMany({
          data: enrollmentData,
        });

        console.log(`Successfully enrolled ${enrollmentResult.count} new students in course ${course.code}`);
        
        // Log details of enrolled students
        if (enrollmentResult.count > 0) {
          console.log(`Enrolled students:`, eligibleStudents.map(s => ({
            email: s.email,
            name: s.name,
            program: course.batch.program.name,
            batch: course.batch.name,
            course: course.code,
            semester: course.semester
          })));
        }
      } else {
        console.log(`No eligible students found for enrollment in program ${course.batch.program.name}, batch ${course.batch.name}`);
        console.log(`This could mean:`);
        console.log(`1. No students have been added to this program/batch combination`);
        console.log(`2. All students in this batch are currently marked as 'Inactive'`);
      }
    }

    // Course completion logic
    if (course.status === 'ACTIVE' && status === 'COMPLETED') {
      console.log(`Course ${course.code} marked as completed`);
      // You could add logic here to:
      // - Finalize grades
      // - Generate reports
      // - Archive course data
      // - Send notifications to stakeholders
    }

    console.log(`Successfully updated course ${course.code} to status: ${status}`);
    
    return NextResponse.json({
      ...updatedCourse,
      message: status === 'ACTIVE' && course.status === 'FUTURE' 
        ? `Course activated and automatic enrollment completed` 
        : `Course status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating course status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: 'Failed to update course status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}