import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!CLOUD || !KEY || !SECRET) return NextResponse.json({ error: 'cloudinary_not_configured' }, { status: 500 });

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'no_file' }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'too_large' }, { status: 400 });

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'pikirler';
    // params signed must be alphabetical
    const toSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(toSign + SECRET).digest('hex');

    const upload = new FormData();
    upload.append('file', file);
    upload.append('api_key', KEY);
    upload.append('timestamp', String(timestamp));
    upload.append('folder', folder);
    upload.append('signature', signature);

    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: upload });
    const data = await r.json();
    if (!data.secure_url) {
      console.error('[upload] cloudinary', data);
      return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
    }
    return NextResponse.json({ url: data.secure_url });
  } catch (e) {
    console.error('[upload]', e);
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  }
}
