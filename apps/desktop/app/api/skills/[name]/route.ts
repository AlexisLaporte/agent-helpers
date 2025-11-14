import { NextRequest, NextResponse } from 'next/server';
import { getSkill } from '@/lib/skills-manager';
import { getLocalSkillsPath } from '@agent-helpers/core/config';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // 'library' | 'local' | null

    let skill;
    let isLocal = false;
    let inLibrary = false;

    if (source === 'library') {
      // Only load from library (repo)
      skill = await getSkill(name, false);
      if (skill) {
        inLibrary = true;
        // Check if also exists locally
        const localPath = getLocalSkillsPath();
        const localSkillPath = path.join(localPath, name);
        try {
          await require('fs').promises.access(localSkillPath);
          isLocal = true;
        } catch {
          // Not in local
        }
      }
    } else if (source === 'local') {
      // Only load from local
      skill = await getSkill(name, true);
      if (skill) {
        isLocal = true;
        // Check if exists in library
        const librarySkill = await getSkill(name, false);
        if (librarySkill) {
          inLibrary = true;
        }
      }
    } else {
      // Default behavior: Try repo first, then local
      skill = await getSkill(name, false);

      // Check if exists in library (repo)
      if (skill) {
        inLibrary = true;
      }

      if (!skill) {
        skill = await getSkill(name, true);
        isLocal = true;
      }

      // If found in repo, check if also exists locally
      if (!isLocal && skill) {
        const localPath = getLocalSkillsPath();
        const localSkillPath = path.join(localPath, name);

        try {
          await require('fs').promises.access(localSkillPath);
          isLocal = true;
        } catch {
          // Not in local
        }
      }
    }

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...skill,
      isLocal,
      inLibrary,
    });
  } catch (error) {
    console.error('Error loading skill:', error);
    return NextResponse.json(
      { error: 'Failed to load skill' },
      { status: 500 }
    );
  }
}
