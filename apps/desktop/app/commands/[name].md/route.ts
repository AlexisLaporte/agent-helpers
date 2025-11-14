import { NextRequest } from 'next/server';
import { getCommand } from '@agent-helpers/core/customization-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // Remove .md extension if present
    const commandName = name.replace(/\.md$/, '');

    // Try repo first, then local
    const command = await getCommand(commandName, false) || await getCommand(commandName, true);

    if (!command) {
      return new Response('Command not found', { status: 404 });
    }

    // Return raw content as plain text
    return new Response(command.content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${commandName}.md"`,
      },
    });
  } catch (error) {
    console.error('Error fetching raw command:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
