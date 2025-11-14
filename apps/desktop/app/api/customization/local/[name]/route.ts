import { NextRequest, NextResponse } from 'next/server';
import {
  getSkill,
  getCommand,
  getAgent,
  getOutputStyle,
  checkLocalModified,
} from '@/lib/customization-manager';
import { CustomizationType } from '@agent-helpers/core/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');

    // Try each type in order
    const types: CustomizationType[] = ['skill', 'command', 'agent', 'output-style'];

    for (const type of types) {
      let customization;

      switch (type) {
        case 'skill':
          customization = await getSkill(name, true, project || undefined);
          break;
        case 'command':
          customization = await getCommand(name, true, project || undefined);
          break;
        case 'agent':
          customization = await getAgent(name, true, project || undefined);
          break;
        case 'output-style':
          customization = await getOutputStyle(name, true, project || undefined);
          break;
      }

      if (customization) {
        // Check if exists in library
        let libraryCustomization;
        switch (type) {
          case 'skill':
            libraryCustomization = await getSkill(name, false);
            break;
          case 'command':
            libraryCustomization = await getCommand(name, false);
            break;
          case 'agent':
            libraryCustomization = await getAgent(name, false);
            break;
          case 'output-style':
            libraryCustomization = await getOutputStyle(name, false);
            break;
        }

        const inLibrary = !!libraryCustomization;

        // Check if modified (only if in library)
        const isModified = inLibrary ? await checkLocalModified(type, name) : false;

        return NextResponse.json({
          ...customization,
          type,
          inLibrary,
          isModified,
        });
      }
    }

    return NextResponse.json(
      { error: 'Customization not found locally' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error loading customization:', error);
    return NextResponse.json(
      { error: 'Failed to load customization' },
      { status: 500 }
    );
  }
}
