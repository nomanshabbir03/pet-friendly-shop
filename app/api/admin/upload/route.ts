import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

const maxFileSize = 5 * 1024 * 1024;
const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const uploadFolder = 'petstar/products';

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  return { cloudName, apiKey, apiSecret };
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!(image instanceof File) || !supportedImageTypes.has(image.type)) {
      return NextResponse.json({ success: false, error: 'Please select a JPG, PNG, WebP, or GIF image.' }, { status: 400 });
    }

    if (image.size === 0 || image.size > maxFileSize) {
      return NextResponse.json({ success: false, error: 'Image must be no larger than 5 MB.' }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash('sha1')
      .update(`folder=${uploadFolder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', image);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', String(timestamp));
    cloudinaryFormData.append('folder', uploadFolder);
    cloudinaryFormData.append('signature', signature);

    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    });
    const cloudinaryData = (await cloudinaryResponse.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };

    if (!cloudinaryResponse.ok || !cloudinaryData.secure_url) {
      throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed.');
    }

    return NextResponse.json({ success: true, path: cloudinaryData.secure_url }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return NextResponse.json({ success: false, error: 'Failed to upload image.' }, { status: 500 });
  }
}
