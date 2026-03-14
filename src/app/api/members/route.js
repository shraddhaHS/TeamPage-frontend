import { NextResponse } from 'next/server';
import { getMembers, addMember } from '@/lib/data';

export async function GET() {
  const members = getMembers();
  return NextResponse.json(members);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Generate new ID (mocking DB auto-increment)
    const members = getMembers();
    const nextIdNum = members.length > 0 
      ? Math.max(...members.map(m => parseInt(m.id.replace('ARM-', '')))) + 1 
      : 1;
    const newId = `ARM-${String(nextIdNum).padStart(3, '0')}`;
    
    const newMember = {
      id: newId,
      name: formData.get('name'),
      role: formData.get('role'),
      bio: formData.get('bio'),
      linkedin: formData.get('linkedin') || '#',
      twitter: formData.get('twitter') || '#',
      quote: formData.get('quote') || 'Engineering the future, one system at a time.',
      photo: ''
    };

    const file = formData.get('photo');
    if (file && file.size > 0 && typeof file !== 'string') {
      // Convert file to base64 for in-memory storage (simulating file upload/CDN URL)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Photo = `data:${file.type};base64,${buffer.toString('base64')}`;
      newMember.photo = base64Photo;
    } else {
        // use default avatar if no file provided
        newMember.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(newMember.name)}&background=22262d&color=c8a96e&size=256`;
    }

    addMember(newMember);

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
