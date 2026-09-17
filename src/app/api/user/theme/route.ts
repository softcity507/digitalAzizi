import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST: Save theme preference in cookies and database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { theme } = body;

    if (theme !== 'dark' && theme !== 'light') {
      return NextResponse.json({ error: 'Invalid theme value. Expected "dark" or "light"' }, { status: 400 });
    }

    // 1. Set cookie for server-side rendering
    const cookieStore = await cookies();
    cookieStore.set('theme', theme, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });

    // 2. Database Integration Placeholder:
    // When your DB/ORM (e.g. Prisma, Mongoose, Supabase) is connected and user session is active:
    // const session = await getSession();
    // if (session?.user?.id) {
    //   await db.user.update({
    //     where: { id: session.user.id },
    //     data: { theme },
    //   });
    // }

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error('Error saving user theme:', error);
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}

// GET: Retrieve current theme preference
export async function GET() {
  try {
    const cookieStore = await cookies();
    const theme = cookieStore.get('theme')?.value || 'dark';

    // When DB is connected:
    // const session = await getSession();
    // if (session?.user?.id) {
    //   const user = await db.user.findUnique({ where: { id: session.user.id } });
    //   if (user?.theme) return NextResponse.json({ theme: user.theme });
    // }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('Error getting user theme:', error);
    return NextResponse.json({ theme: 'dark' }, { status: 500 });
  }
}
