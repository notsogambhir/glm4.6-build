import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ZAI } from 'z-ai-web-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    
    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    const courses = await db.course.findMany({
      where: {
        batchId: batchId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, credits, semester, batchId, description } = body;

    if (!code || !name || !batchId) {
      return NextResponse.json({ 
        error: 'Course code, name, and batch ID are required' 
      }, { status: 400 });
    }

    // Check if course code already exists in this batch
    const existingCourse = await db.course.findFirst({
      where: {
        code,
        batchId
      }
    });

    if (existingCourse) {
      return NextResponse.json({ 
        error: 'Course with this code already exists in this batch' 
      }, { status: 409 });
    }

    // Verify batch exists
    const batch = await db.batch.findUnique({
      where: { id: batchId }
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Create new course with FUTURE status by default
    const course = await db.course.create({
      data: {
        code,
        name,
        credits: credits || 0,
        semester: semester || '',
        description: description || '',
        status: 'FUTURE',
        batchId
      }
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}