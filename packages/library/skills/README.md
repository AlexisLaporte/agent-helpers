# Skills Library

Curated skills to extend Claude Code capabilities.

## Available Skills

### Productivity

**conversation-finder**
Find and resume previous Claude Code conversations by keyword, location, or date.
```bash
claude-find bluetooth --auto
```

**skill-creator**
Guide for creating custom Claude Code skills with best practices and examples.

**file-organizer**
Organize files intelligently by type, date, project, or custom patterns.
```javascript
organizeByType('./downloads', './organized');
```

**article-extractor**
Extract clean article text from web pages, removing ads and clutter.
```bash
npm install @mozilla/readability jsdom
```

### Development

**playwright**
Browser automation and end-to-end testing for web applications.
```bash
npm install -D @playwright/test
npx playwright test
```

**git-worktrees**
Work on multiple branches simultaneously with isolated working trees.
```bash
git worktree add ../project-feature feature-branch
```

### Documents

**pdf**
Comprehensive PDF toolkit: extract text, merge, split, create PDFs.
```bash
npm install pdf-lib pdf-parse
```

### Integration

**notion**
Integrate with Notion workspaces to read/write pages and databases.
```javascript
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
```

**google-drive**
Access Google Sheets and Slides for data manipulation and presentation generation.
```bash
npm install googleapis
```

**figma**
Extract design tokens, export assets, and access Figma design specifications.
```bash
npm install figma-js
```

**slack**
Send messages, create bots, and automate Slack workflows.
```javascript
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_BOT_TOKEN);
```

**youtube-transcript**
Extract transcripts and captions from YouTube videos.
```bash
npm install youtube-transcript
```

## Usage

Skills are automatically loaded by Claude Code from:
- `~/.claude/skills/` - Personal skills
- `.claude/skills/` - Project-specific skills
- `library/skills/` - Bundled skills

To install from library to your personal collection:
```bash
cp -r library/skills/SKILL_NAME ~/.claude/skills/
```

## Creating Custom Skills

See `skill-creator/SKILL.md` for detailed guide on creating your own skills.

Basic structure:
```
my-skill/
├── SKILL.md          # Documentation with frontmatter
└── [optional files]  # Scripts, configs, templates
```

## Contributing

High-quality skills are welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md).
