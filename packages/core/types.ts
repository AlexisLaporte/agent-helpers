// Base customization type
export type CustomizationType = 'skill' | 'command' | 'agent' | 'output-style';

// Source of customization
export type CustomizationSource = 'base' | 'org' | 'local';

// Common interface for all customizations
export interface BaseCustomization {
  name: string;
  description: string;
  path: string;
  content: string;
  type: CustomizationType;
  isLocal?: boolean;
  isPersonal?: boolean; // True if file ends with .personal.md or is in personal/ directory
  isTemplate?: boolean; // True if from repository (not local)
  source?: CustomizationSource; // Source of the customization

  // For local customizations - comparison with library
  isModified?: boolean;      // True if local file differs from library version
  hasUpdate?: boolean;       // True if library version is newer
  libraryHash?: string;      // Hash of library version for comparison
  installedFrom?: string;    // Name of library item this was installed from

  // For library customizations - check if installed locally
  isInstalled?: boolean;     // True if this library item exists in local ~/.claude/
}

// Skill-specific
export interface Skill extends BaseCustomization {
  type: 'skill';
}

export interface SkillMetadata {
  name: string;
  description: string;
}

// Command-specific
export interface Command extends BaseCustomization {
  type: 'command';
  allowedTools?: string;
  argumentHint?: string;
  model?: string;
}

export interface CommandMetadata {
  name: string;
  description: string;
  allowedTools?: string;
  argumentHint?: string;
  model?: string;
}

// Agent-specific
export interface Agent extends BaseCustomization {
  type: 'agent';
  tools?: string[];
  model?: string;
  prompt: string;
}

export interface AgentMetadata {
  name: string;
  description: string;
  tools?: string[];
  model?: string;
}

// Output Style-specific
export interface OutputStyle extends BaseCustomization {
  type: 'output-style';
  instructions: string;
}

export interface OutputStyleMetadata {
  name: string;
  description: string;
}

// Hook-specific (from settings.json)
export interface Hook {
  matcher?: string;
  type: 'command';
  command: string;
  timeout?: number;
}

export interface HookEvent {
  eventName: string;
  hooks: Hook[];
}

export interface Settings {
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  hooks?: {
    [eventName: string]: Array<{
      matcher?: string;
      hooks: Hook[];
    }>;
  };
  enabledPlugins?: {
    [key: string]: boolean;
  };
  alwaysThinkingEnabled?: boolean;
}

// Union type for all customizations
export type Customization = Skill | Command | Agent | OutputStyle;

// Project discovery
export interface ClaudeProject {
  name: string;
  path: string;
  claudePath: string;
  lastModified: Date;
  hasSettings: boolean;
  hasStatusline: boolean;
  customizationCounts: {
    skills: number;
    commands: number;
    agents: number;
    outputStyles: number;
    hooks: number;
  };
}

// Duplicates analysis
export interface CustomizationWithProject extends BaseCustomization {
  projectName: string;
  projectPath: string;
  claudePath: string;
  contentHash: string;
}

export interface ContentGroup {
  hash: string;
  instances: CustomizationWithProject[];
}

export interface DuplicatesByName {
  name: string;
  type: CustomizationType;
  instances: CustomizationWithProject[];
  contentGroups: ContentGroup[];
}

export interface DuplicatesByContent {
  hash: string;
  type: CustomizationType;
  instances: CustomizationWithProject[];
  uniqueNames: string[];
}

export interface DuplicatesAnalysis {
  byName: DuplicatesByName[];
  byContent: DuplicatesByContent[];
  stats: {
    totalProjects: number;
    totalFiles: number;
    duplicateNames: number;
    duplicateContent: number;
  };
}

// Library sources
export type LibrarySourceType = 'bundled' | 'git' | 'gist' | 'local';

export interface LibrarySource {
  id: string;
  name: string;
  type: LibrarySourceType;
  url?: string;          // For git/gist
  path?: string;         // For local
  branch?: string;       // For git (default: main/master)
  token?: string;        // For private git repos
  enabled: boolean;
  lastSync?: string;     // ISO date
  stats?: {
    skills: number;
    commands: number;
    agents: number;
    outputStyles: number;
  };
}

export interface LibraryManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  repository?: string;
  homepage?: string;
  license?: string;
  compatibility?: {
    agentHelpers?: string;
  };
  contents?: {
    skills?: string[];
    commands?: string[];
    agents?: string[];
    outputStyles?: string[];
  };
}

export interface CustomizationWithSource extends BaseCustomization {
  sourceId: string;
  sourceName: string;
  sourceType: LibrarySourceType;
}

