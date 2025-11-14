import {
  getSkill,
  getCommand,
  getAgent,
  getOutputStyle,
} from '@agent-helpers/core/customization-manager';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; name: string }> }
) {
  const { type, name } = await params;

  try {
    let content: string | null = null;

    // Try to get from library first, then local
    switch (type) {
      case 'skills': {
        const skill = await getSkill(name, false) || await getSkill(name, true);
        content = skill?.content || null;
        break;
      }
      case 'commands': {
        const command = await getCommand(name, false) || await getCommand(name, true);
        content = command?.content || null;
        break;
      }
      case 'agents': {
        const agent = await getAgent(name, false) || await getAgent(name, true);
        content = agent?.content || null;
        break;
      }
      case 'output-styles': {
        const style = await getOutputStyle(name, false) || await getOutputStyle(name, true);
        content = style?.content || null;
        break;
      }
      default:
        return new Response('Invalid type', { status: 400 });
    }

    if (!content) {
      return new Response('File not found', { status: 404 });
    }

    // Return raw content as plain text
    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${name}.md"`,
      },
    });
  } catch (error) {
    console.error('Error fetching raw file:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
