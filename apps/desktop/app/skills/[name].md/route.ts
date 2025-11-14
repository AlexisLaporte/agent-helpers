import { NextRequest } from 'next/server';
import { getSkill } from '@agent-helpers/core/customization-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // Remove .md extension if present
    const skillName = name.replace(/\.md$/, '');

    // Try repo first, then local
    const skill = await getSkill(skillName, false) || await getSkill(skillName, true);

    if (!skill) {
      return new Response('Skill not found', { status: 404 });
    }

    // Return raw content as plain text
    return new Response(skill.content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${skillName}.md"`,
      },
    });
  } catch (error) {
    console.error('Error fetching raw skill:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
