import { NextResponse } from 'next/server';
import { discoverProjects } from '@agent-helpers/core/project-discovery';

// GET - List all discovered projects
export async function GET() {
  try {
    const projects = await discoverProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to discover projects:', error);
    return NextResponse.json(
      { error: 'Failed to discover projects' },
      { status: 500 }
    );
  }
}
