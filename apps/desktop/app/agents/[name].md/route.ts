import { NextRequest } from 'next/server';
import { getAgent } from '@agent-helpers/core/customization-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // Remove .md extension if present
    const agentName = name.replace(/\.md$/, '');

    // Try repo first, then local
    const agent = await getAgent(agentName, false) || await getAgent(agentName, true);

    if (!agent) {
      return new Response('Agent not found', { status: 404 });
    }

    // Return raw content as plain text
    return new Response(agent.content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${agentName}.md"`,
      },
    });
  } catch (error) {
    console.error('Error fetching raw agent:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
