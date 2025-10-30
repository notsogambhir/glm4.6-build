import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    const whereClause = programId ? { programId } : {};
    
    const batches = await db.batch.findMany({
      where: { 
        ...whereClause,
        isActive: true 
      },
      include: {
        program: {
          include: {
            college: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            courses: true,
            students: true
          }
        }
      },
      orderBy: { startYear: 'desc' },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, programId, startYear, endYear } = body;

    if (!name || !programId || !startYear || !endYear) {
      return NextResponse.json(
        { error: 'Missing required fields: name, programId, startYear, endYear' },
        { status: 400 }
      );
    }

    // Check if batch already exists for this program
    const existingBatch = await db.batch.findFirst({
      where: {
        name,
        programId
      }
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch with this name already exists for this program' },
        { status: 409 }
      );
    }

    const batch = await db.batch.create({
      data: {
        name,
        programId,
        startYear,
        endYear
      },
      include: {
        program: {
          include: {
            college: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            courses: true,
            students: true
          }
        }
      }
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}