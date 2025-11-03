import { NextResponse } from 'next/server';
import { discoverProjects } from '@/lib/project-discovery';
import {
  listLocalSkills,
  listLocalCommands,
  listLocalAgents,
  listLocalOutputStyles,
  calculateHash,
} from '@/lib/customization-manager';
import type {
  CustomizationWithProject,
  DuplicatesByName,
  DuplicatesByContent,
  DuplicatesAnalysis,
  Customization,
  CustomizationType,
} from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectFilter = searchParams.get('project');

    const allProjects = await discoverProjects();
    const projects = projectFilter
      ? allProjects.filter((p) => p.claudePath === projectFilter)
      : allProjects;

    // Load all customizations from all projects
    const allCustomizations: CustomizationWithProject[] = [];

    for (const project of projects) {
      const claudePath = project.claudePath;

      // Load all types of customizations
      const [skills, commands, agents, outputStyles] = await Promise.all([
        listLocalSkills(claudePath).catch(() => []),
        listLocalCommands(claudePath).catch(() => []),
        listLocalAgents(claudePath).catch(() => []),
        listLocalOutputStyles(claudePath).catch(() => []),
      ]);

      // Combine all customizations with project info
      const customizations: Customization[] = [
        ...skills,
        ...commands,
        ...agents,
        ...outputStyles,
      ];

      for (const custom of customizations) {
        const contentHash = calculateHash(custom.content);

        allCustomizations.push({
          ...custom,
          projectName: project.name,
          projectPath: project.path,
          claudePath: project.claudePath,
          contentHash,
        });
      }
    }

    // Group by name
    const byNameMap = new Map<string, CustomizationWithProject[]>();
    for (const custom of allCustomizations) {
      const key = `${custom.type}:${custom.name}`;
      if (!byNameMap.has(key)) {
        byNameMap.set(key, []);
      }
      byNameMap.get(key)!.push(custom);
    }

    // Filter to only duplicates by name (more than 1 instance)
    const duplicatesByName: DuplicatesByName[] = [];
    for (const [key, instances] of byNameMap.entries()) {
      if (instances.length > 1) {
        // Group by content hash within this name group
        const contentGroupMap = new Map<string, CustomizationWithProject[]>();
        for (const instance of instances) {
          if (!contentGroupMap.has(instance.contentHash)) {
            contentGroupMap.set(instance.contentHash, []);
          }
          contentGroupMap.get(instance.contentHash)!.push(instance);
        }

        const contentGroups = Array.from(contentGroupMap.entries()).map(
          ([hash, instances]) => ({ hash, instances })
        );

        duplicatesByName.push({
          name: instances[0].name,
          type: instances[0].type,
          instances,
          contentGroups,
        });
      }
    }

    // Group by content hash
    const byContentMap = new Map<string, CustomizationWithProject[]>();
    for (const custom of allCustomizations) {
      const key = `${custom.type}:${custom.contentHash}`;
      if (!byContentMap.has(key)) {
        byContentMap.set(key, []);
      }
      byContentMap.get(key)!.push(custom);
    }

    // Filter to only duplicates by content (more than 1 instance)
    const duplicatesByContent: DuplicatesByContent[] = [];
    for (const [key, instances] of byContentMap.entries()) {
      if (instances.length > 1) {
        const uniqueNames = [...new Set(instances.map((i) => i.name))];

        duplicatesByContent.push({
          hash: instances[0].contentHash,
          type: instances[0].type,
          instances,
          uniqueNames,
        });
      }
    }

    const analysis: DuplicatesAnalysis = {
      byName: duplicatesByName,
      byContent: duplicatesByContent,
      stats: {
        totalProjects: projects.length,
        totalFiles: allCustomizations.length,
        duplicateNames: duplicatesByName.length,
        duplicateContent: duplicatesByContent.length,
      },
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Failed to analyze duplicates:', error);
    return NextResponse.json(
      { error: 'Failed to analyze duplicates' },
      { status: 500 }
    );
  }
}
