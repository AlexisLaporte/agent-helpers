import { NextRequest } from 'next/server';
import { getOutputStyle } from '@agent-helpers/core/customization-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // Remove .md extension if present
    const styleName = name.replace(/\.md$/, '');

    // Try repo first, then local
    const style = await getOutputStyle(styleName, false) || await getOutputStyle(styleName, true);

    if (!style) {
      return new Response('Output style not found', { status: 404 });
    }

    // Return raw content as plain text
    return new Response(style.content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${styleName}.md"`,
      },
    });
  } catch (error) {
    console.error('Error fetching raw output style:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
