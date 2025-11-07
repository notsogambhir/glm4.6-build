import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Only Program Coordinators, Admins, and University can update POs
    if (!['PROGRAM_COORDINATOR', 'ADMIN', 'UNIVERSITY'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only Program Coordinators and above can update POs.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, description } = body;
    const resolvedParams = await params;
    const poId = resolvedParams.id;

    if (!poId) {
      return NextResponse.json({ error: 'PO ID is required' }, { status: 400 });
    }

    if (!code || !description) {
      return NextResponse.json(
        { error: 'Code and description are required' },
        { status: 400 }
      );
    }

    // Check if PO exists
    const existingPO = await db.pO.findUnique({
      where: { id: poId },
      include: { program: true }
    });

    if (!existingPO) {
      return NextResponse.json({ error: 'PO not found' }, { status: 404 });
    }

    // For Program Coordinators, verify they have access to this program
    if (user.role === 'PROGRAM_COORDINATOR' && user.programId !== existingPO.programId) {
      return NextResponse.json(
        { error: 'You can only update POs for your assigned program' },
        { status: 403 }
      );
    }

    // Check if code conflicts with another PO in the same program
    const conflictingPO = await db.pO.findFirst({
      where: {
        programId: existingPO.programId,
        code: code.toUpperCase(),
        id: { not: poId }
      }
    });

    if (conflictingPO) {
      return NextResponse.json(
        { error: 'PO with this code already exists in this program' },
        { status: 409 }
      );
    }

    const updatedPO = await db.pO.update({
      where: { id: poId },
      data: {
        code: code.toUpperCase(),
        description: description.trim()
      },
      include: {
        program: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json(updatedPO);
  } catch (error) {
    console.error('Error updating PO:', error);
    return NextResponse.json({ error: 'Failed to update PO' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Only Program Coordinators, Admins, and University can delete POs
    if (!['PROGRAM_COORDINATOR', 'ADMIN', 'UNIVERSITY'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only Program Coordinators and above can delete POs.' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const poId = resolvedParams.id;

    if (!poId) {
      return NextResponse.json({ error: 'PO ID is required' }, { status: 400 });
    }

    // Check if PO exists
    const existingPO = await db.pO.findUnique({
      where: { id: poId },
      include: { program: true }
    });

    if (!existingPO) {
      return NextResponse.json({ error: 'PO not found' }, { status: 404 });
    }

    // For Program Coordinators, verify they have access to this program
    if (user.role === 'PROGRAM_COORDINATOR' && user.programId !== existingPO.programId) {
      return NextResponse.json(
        { error: 'You can only delete POs for your assigned program' },
        { status: 403 }
      );
    }

    // Check if PO is referenced in any CO-PO mappings
    const mappingCount = await db.cOPOMapping.count({
      where: { poId }
    });

    if (mappingCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete PO that is referenced in CO-PO mappings' },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await db.pO.update({
      where: { id: poId },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'PO deleted successfully' });
  } catch (error) {
    console.error('Error deleting PO:', error);
    return NextResponse.json({ error: 'Failed to delete PO' }, { status: 500 });
  }
}