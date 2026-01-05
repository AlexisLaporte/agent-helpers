export const TEMPLATES = {
  'CLAUDE.md': {
    global: `# Instructions globales

## Code
- document in code, not in technical .md
- un fichier de code ne devrait jamais faire plus de 500 lignes

## Documentation
- quand tu écris un document, sois direct et succinct

## Développement
- ne lance/coupe jamais de serveur (sauf si demandé)
- ne fais jamais git push (sauf si demandé)
`,
    project: `# Instructions projet

## Contexte
-

## Conventions
-

## Notes
-
`
  },

  'settings.local.json': `{
  "permissions": {
    "allow": [],
    "deny": []
  }
}
`,

  'sessions.json': `[]
`,

  'skill.md': `---
name: Mon Skill
description: Description courte du skill
---

# Utilisation

Décris comment utiliser ce skill.

## Exemples

\`\`\`
/mon-skill argument
\`\`\`
`,

  'command.md': `---
description: Description courte de la commande
---

# Commande

Instructions pour exécuter cette commande.
`
}

export type TemplateKey = keyof typeof TEMPLATES

export function getTemplate(filename: string, isGlobal: boolean): string {
  if (filename === 'CLAUDE.md') {
    return isGlobal ? TEMPLATES['CLAUDE.md'].global : TEMPLATES['CLAUDE.md'].project
  }

  if (filename === 'settings.local.json') {
    return TEMPLATES['settings.local.json']
  }

  if (filename === 'sessions.json') {
    return TEMPLATES['sessions.json']
  }

  if (filename.endsWith('.md') && filename !== 'CLAUDE.md') {
    // Could be a skill or command
    return TEMPLATES['skill.md']
  }

  return ''
}

export function getTemplateForPath(path: string, isGlobal: boolean): string {
  const filename = path.split('/').pop() || ''
  return getTemplate(filename, isGlobal)
}
