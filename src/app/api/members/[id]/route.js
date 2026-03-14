import { NextResponse } from 'next/server';
import { updateMember, deleteMember, getMembers } from '@/lib/data';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.formData();
    
    const updatedFields = {
      name: formData.get('name'),
      role: formData.get('role'),
      bio: formData.get('bio'),
      linkedin: formData.get('linkedInUrl'),
      quote: formData.get('quote'),
      twitter: formData.get('twitter'),
    };

    const file = formData.get('photo');
    if (file && file.size > 0 && typeof file !== 'string') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Photo = `data:${file.type};base64,${buffer.toString('base64')}`;
        updatedFields.photo = base64Photo;
    }

    const member = updateMember(id, updatedFields);
    
    if (member) {
      return NextResponse.json(member);
    } else {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    deleteMember(id);
    return NextResponse.json({ success: true });
  } catch (error) {
     console.error("Error deleting member:", error);
     return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
