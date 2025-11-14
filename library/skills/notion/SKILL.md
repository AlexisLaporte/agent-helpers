---
name: Notion
description: Notion workspace integration. Use when user wants to read/write Notion pages, search databases, create tasks, or sync content with Notion.
source: base
---

# Notion

Integrate with Notion workspaces to read and write content.

## When to Use

Use this skill when the user wants to:
- Read or search Notion pages
- Create or update pages and databases
- Query Notion databases
- Sync content to/from Notion
- Create tasks or notes in Notion
- Search across workspace

## Setup

### 1. Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name and select workspace
4. Copy the "Internal Integration Token"

### 2. Share Pages with Integration

For each page/database you want to access:
1. Open the page in Notion
2. Click "Share" (top right)
3. Invite your integration

### 3. Store API Key

```bash
export NOTION_API_KEY="secret_xxxxx"
```

Or in `.env`:
```
NOTION_API_KEY=secret_xxxxx
```

## Installation

```bash
npm install @notionhq/client
```

Or Python:
```bash
pip install notion-client
```

## JavaScript Usage

```javascript
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Search pages
const response = await notion.search({
  query: 'Meeting Notes',
  filter: { property: 'object', value: 'page' }
});

// Get page
const page = await notion.pages.retrieve({ page_id: 'PAGE_ID' });

// Create page
const newPage = await notion.pages.create({
  parent: { database_id: 'DATABASE_ID' },
  properties: {
    Name: { title: [{ text: { content: 'New Page' } }] }
  }
});

// Update page
await notion.pages.update({
  page_id: 'PAGE_ID',
  properties: {
    Status: { select: { name: 'Done' } }
  }
});
```

## Common Patterns

### Query Database

```javascript
const response = await notion.databases.query({
  database_id: 'DATABASE_ID',
  filter: {
    property: 'Status',
    select: { equals: 'In Progress' }
  },
  sorts: [
    { property: 'Created', direction: 'descending' }
  ]
});

for (const page of response.results) {
  console.log(page.properties.Name.title[0].text.content);
}
```

### Read Page Content

```javascript
const blockId = 'PAGE_ID';
const response = await notion.blocks.children.list({ block_id: blockId });

for (const block of response.results) {
  if (block.type === 'paragraph') {
    const text = block.paragraph.rich_text[0]?.plain_text;
    console.log(text);
  }
}
```

### Create Page with Content

```javascript
const page = await notion.pages.create({
  parent: { page_id: 'PARENT_PAGE_ID' },
  properties: {
    title: { title: [{ text: { content: 'Meeting Notes' } }] }
  },
  children: [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Agenda' } }]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: 'Item 1' } }]
      }
    }
  ]
});
```

### Append Blocks

```javascript
await notion.blocks.children.append({
  block_id: 'PAGE_ID',
  children: [
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: 'New paragraph' } }]
      }
    }
  ]
});
```

## Python Usage

```python
from notion_client import Client

notion = Client(auth=os.environ["NOTION_API_KEY"])

# Query database
results = notion.databases.query(
    database_id="DATABASE_ID",
    filter={"property": "Status", "select": {"equals": "Done"}}
)

# Create page
new_page = notion.pages.create(
    parent={"database_id": "DATABASE_ID"},
    properties={
        "Name": {"title": [{"text": {"content": "New Task"}}]},
        "Status": {"select": {"name": "To Do"}}
    }
)
```

## Database Properties

Common property types:

```javascript
properties: {
  // Text
  Name: { title: [{ text: { content: 'Title' } }] },

  // Rich text
  Description: { rich_text: [{ text: { content: 'Text' } }] },

  // Number
  Count: { number: 42 },

  // Select
  Status: { select: { name: 'In Progress' } },

  // Multi-select
  Tags: { multi_select: [{ name: 'urgent' }, { name: 'bug' }] },

  // Date
  DueDate: { date: { start: '2024-01-15' } },

  // Checkbox
  Done: { checkbox: true },

  // URL
  Link: { url: 'https://example.com' },

  // Email
  Email: { email: 'user@example.com' },

  // Phone
  Phone: { phone_number: '+1234567890' }
}
```

## Block Types

```javascript
// Paragraph
{ type: 'paragraph', paragraph: { rich_text: [{ text: { content: 'Text' } }] } }

// Heading
{ type: 'heading_1', heading_1: { rich_text: [{ text: { content: 'Title' } }] } }

// Bulleted list
{ type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ text: { content: 'Item' } }] } }

// Code
{ type: 'code', code: { rich_text: [{ text: { content: 'code' } }], language: 'javascript' } }

// Divider
{ type: 'divider', divider: {} }

// To-do
{ type: 'to_do', to_do: { rich_text: [{ text: { content: 'Task' } }], checked: false } }
```

## Common Issues

**Unauthorized**: Integration not shared with page
```
Solution: Share page with integration via Share menu
```

**Rate limiting**: Too many requests
```javascript
// Add delays between requests
await new Promise(resolve => setTimeout(resolve, 300));
```

**Page not found**: Wrong ID or no access
```
Solution: Verify page_id and sharing permissions
```

## Best Practices

- Cache database structure to reduce API calls
- Use pagination for large result sets
- Handle rate limits with exponential backoff
- Validate property types before writing
- Use search sparingly (it's slow)
- Batch operations when possible
- Store IDs in config, not hardcoded

## Example: Sync Tasks

```javascript
async function syncTasks(tasks) {
  const database_id = 'YOUR_DATABASE_ID';

  for (const task of tasks) {
    await notion.pages.create({
      parent: { database_id },
      properties: {
        Name: { title: [{ text: { content: task.title } }] },
        Status: { select: { name: task.status } },
        DueDate: { date: { start: task.dueDate } }
      }
    });

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
```

## Resources

- Notion API: https://developers.notion.com
- JS SDK: https://github.com/makenotion/notion-sdk-js
- Python SDK: https://github.com/ramnes/notion-sdk-py
- API Reference: https://developers.notion.com/reference
