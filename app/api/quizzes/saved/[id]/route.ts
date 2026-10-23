import { NextResponse } from 'next/server';
import { deleteSavedQuizFromSupabase } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    await deleteSavedQuizFromSupabase(id);
    return NextResponse.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error: any) {
    console.error('Delete quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz', message: error?.message },
      { status: 500 }
    );
  }
}
