import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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