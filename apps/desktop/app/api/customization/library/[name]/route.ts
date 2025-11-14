import { NextRequest, NextResponse } from 'next/server';
import {
  getSkill,
  getCommand,
  getAgent,
  getOutputStyle,
  checkLocalExists,
} from '@/lib/customization-manager';
import { CustomizationType } from '@agent-helpers/core/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // Try each type in order
    const types: CustomizationType[] = ['skill', 'command', 'agent', 'output-style'];

    for (const type of types) {
      let customization;

      switch (type) {
        case 'skill':
          customization = await getSkill(name, false);
          break;
        case 'command':
          customization = await getCommand(name, false);
          break;
        case 'agent':
          customization = await getAgent(name, false);
          break;
        case 'output-style':
          customization = await getOutputStyle(name, false);
          break;
      }

      if (customization) {
        // Check if installed locally
        const isInstalled = await checkLocalExists(type, name);

        return NextResponse.json({
          ...customization,
          type,
          isInstalled,
        });
      }
    }

    return NextResponse.json(
      { error: 'Customization not found in library' },
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
