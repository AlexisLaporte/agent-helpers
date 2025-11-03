/**
 * Centralized configuration for all customization types
 * This defines how each type of file/folder should be handled
 */

export interface CustomizationTypeConfig {
  type: string;                // Internal type identifier
  displayName: string;         // Human-readable name
  pluralName: string;          // Plural form for UI
  isDirectory: boolean;        // true if this type is a directory, false if it's a file
  fileExtension?: string;      // File extension (e.g., '.md', '.json', '.sh') - only for files
  mainFile?: string;           // Main file within directory (e.g., 'SKILL.md') - only for directories
  basePath: string;            // Base directory path (e.g., 'skills', 'commands', 'hooks')
  apiType: string;             // Type identifier for API routes
  editPath: (name: string) => string; // Function to generate edit URL
  allowArchive: boolean;       // Whether this type can be archived
  allowDelete: boolean;        // Whether this type can be deleted
  archivePrefix: string;       // Prefix used for archiving (usually '_')
}

export const CUSTOMIZATION_TYPES: Record<string, CustomizationTypeConfig> = {
  skill: {
    type: 'skill',
    displayName: 'Skill',
    pluralName: 'Skills',
    isDirectory: true,
    mainFile: 'SKILL.md',
    basePath: 'skills',
    apiType: 'skill',
    editPath: (name) => `/config-file/skills/${name}/SKILL.md`,
    allowArchive: true,
    allowDelete: true,
    archivePrefix: '_',
  },

  command: {
    type: 'command',
    displayName: 'Command',
    pluralName: 'Commands',
    isDirectory: false,
    fileExtension: '.md',
    basePath: 'commands',
    apiType: 'command',
    editPath: (name) => `/config-file/commands/${name}.md`,
    allowArchive: true,
    allowDelete: true,
    archivePrefix: '_',
  },

  agent: {
    type: 'agent',
    displayName: 'Agent',
    pluralName: 'Agents',
    isDirectory: false,
    fileExtension: '.md',
    basePath: 'agents',
    apiType: 'agent',
    editPath: (name) => `/config-file/agents/${name}.md`,
    allowArchive: true,
    allowDelete: true,
    archivePrefix: '_',
  },

  'output-style': {
    type: 'output-style',
    displayName: 'Output Style',
    pluralName: 'Output Styles',
    isDirectory: false,
    fileExtension: '.md',
    basePath: 'output-styles',
    apiType: 'output-style',
    editPath: (name) => `/config-file/output-styles/${name}.md`,
    allowArchive: true,
    allowDelete: true,
    archivePrefix: '_',
  },

  settings: {
    type: 'settings',
    displayName: 'Settings',
    pluralName: 'Settings',
    isDirectory: false,
    fileExtension: '.json',
    basePath: '',
    apiType: 'settings',
    editPath: () => `/config-file/settings.json`,
    allowArchive: false,  // Config files typically shouldn't be archived
    allowDelete: true,
    archivePrefix: '_',
  },

  statusline: {
    type: 'statusline',
    displayName: 'Statusline',
    pluralName: 'Statusline',
    isDirectory: false,
    fileExtension: '.sh',
    basePath: '',
    apiType: 'statusline',
    editPath: () => `/config-file/statusline.sh`,
    allowArchive: false,
    allowDelete: true,
    archivePrefix: '_',
  },

  hook: {
    type: 'hook',
    displayName: 'Hook',
    pluralName: 'Hooks',
    isDirectory: false,
    fileExtension: '.sh',  // Most hooks are shell scripts, but could be any executable
    basePath: 'hooks',
    apiType: 'hook',
    editPath: (name) => `/config-file/hooks/${name}`,
    allowArchive: true,
    allowDelete: true,
    archivePrefix: '_',
  },
};

/**
 * Get configuration for a specific type
 */
export function getTypeConfig(type: string): CustomizationTypeConfig | null {
  return CUSTOMIZATION_TYPES[type] || null;
}

/**
 * Get all supported types
 */
export function getAllTypes(): CustomizationTypeConfig[] {
  return Object.values(CUSTOMIZATION_TYPES);
}

/**
 * Validate if a type is supported
 */
export function isValidType(type: string): boolean {
  return type in CUSTOMIZATION_TYPES;
}
