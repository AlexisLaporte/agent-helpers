---
name: Figma
description: Figma design file integration. Use when user wants to access design tokens, export assets, read design specs, or automate design-to-code workflows.
source: base
---

# Figma

Integrate with Figma to access designs, export assets, and extract design tokens.

## When to Use

Use this skill when the user wants to:
- Extract design tokens (colors, typography, spacing)
- Export images and assets from Figma
- Read component specifications
- Access design file metadata
- Automate design-to-code workflows
- Sync design system to code
- Get image URLs for prototypes

## Setup

### 1. Get API Token

1. Go to Figma → Settings → Account
2. Scroll to "Personal access tokens"
3. Click "Create new token"
4. Copy token

### 2. Store Token

```bash
export FIGMA_TOKEN="figd_xxxxx"
```

Or in `.env`:
```
FIGMA_TOKEN=figd_xxxxx
```

### 3. Get File Key

From Figma file URL:
```
https://www.figma.com/file/ABC123/My-Design
                              ^^^^^^
                              File key
```

## Installation

```bash
npm install figma-js
```

Or use REST API directly:
```bash
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  https://api.figma.com/v1/files/FILE_KEY
```

## JavaScript Usage

```javascript
const Figma = require('figma-js');
const client = Figma.Client({ personalAccessToken: process.env.FIGMA_TOKEN });

// Get file
const file = await client.file('FILE_KEY');
console.log(file.data.name);
console.log(file.data.document);

// Get specific node
const node = await client.fileNodes('FILE_KEY', { ids: ['NODE_ID'] });

// Export images
const images = await client.fileImages('FILE_KEY', {
  ids: ['NODE_ID'],
  format: 'png',
  scale: 2
});
console.log(images.data.images); // { NODE_ID: 'https://...' }
```

## REST API Usage

### Get File

```bash
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  https://api.figma.com/v1/files/FILE_KEY
```

### Get Specific Nodes

```bash
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/FILE_KEY/nodes?ids=NODE_ID"
```

### Export Images

```bash
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/FILE_KEY?ids=NODE_ID&format=png&scale=2"
```

Returns:
```json
{
  "images": {
    "NODE_ID": "https://s3-alpha.figma.com/..."
  }
}
```

## Common Patterns

### Extract Colors

```javascript
function extractColors(node, colors = new Set()) {
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.type === 'SOLID') {
        const { r, g, b } = fill.color;
        const hex = rgbToHex(r, g, b);
        colors.add(hex);
      }
    }
  }

  if (node.children) {
    for (const child of node.children) {
      extractColors(child, colors);
    }
  }

  return Array.from(colors);
}

function rgbToHex(r, g, b) {
  const toHex = (c) => Math.round(c * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const file = await client.file('FILE_KEY');
const colors = extractColors(file.data.document);
console.log(colors); // ['#FF5733', '#333333', ...]
```

### Extract Typography

```javascript
function extractTypography(node, styles = []) {
  if (node.style) {
    styles.push({
      fontFamily: node.style.fontFamily,
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      lineHeight: node.style.lineHeightPx
    });
  }

  if (node.children) {
    for (const child of node.children) {
      extractTypography(child, styles);
    }
  }

  return styles;
}
```

### Download Assets

```javascript
async function downloadAssets(fileKey, nodeIds) {
  // Get image URLs
  const response = await client.fileImages(fileKey, {
    ids: nodeIds,
    format: 'png',
    scale: 2
  });

  // Download each image
  for (const [nodeId, url] of Object.entries(response.data.images)) {
    const imageResponse = await fetch(url);
    const buffer = await imageResponse.arrayBuffer();
    fs.writeFileSync(`${nodeId}.png`, Buffer.from(buffer));
  }
}
```

### Get Component Properties

```javascript
function findComponents(node, components = []) {
  if (node.type === 'COMPONENT') {
    components.push({
      id: node.id,
      name: node.name,
      description: node.description,
      width: node.absoluteBoundingBox.width,
      height: node.absoluteBoundingBox.height
    });
  }

  if (node.children) {
    for (const child of node.children) {
      findComponents(child, components);
    }
  }

  return components;
}

const file = await client.file('FILE_KEY');
const components = findComponents(file.data.document);
```

### Export Design Tokens

```javascript
async function exportTokens(fileKey) {
  const file = await client.file(fileKey);
  const document = file.data.document;

  // Extract colors, typography, spacing
  const tokens = {
    colors: extractColors(document),
    typography: extractTypography(document),
    spacing: extractSpacing(document)
  };

  // Save as JSON
  fs.writeFileSync('design-tokens.json', JSON.stringify(tokens, null, 2));

  // Or generate CSS variables
  const css = generateCSS(tokens);
  fs.writeFileSync('design-tokens.css', css);
}

function generateCSS(tokens) {
  let css = ':root {\n';

  tokens.colors.forEach((color, i) => {
    css += `  --color-${i + 1}: ${color};\n`;
  });

  return css + '}\n';
}
```

## Python Usage

```python
import requests

FIGMA_TOKEN = os.environ['FIGMA_TOKEN']
FILE_KEY = 'YOUR_FILE_KEY'

headers = {'X-Figma-Token': FIGMA_TOKEN}

# Get file
response = requests.get(
    f'https://api.figma.com/v1/files/{FILE_KEY}',
    headers=headers
)
file_data = response.json()

# Export images
response = requests.get(
    f'https://api.figma.com/v1/images/{FILE_KEY}',
    headers=headers,
    params={'ids': 'NODE_ID', 'format': 'png', 'scale': 2}
)
images = response.json()['images']
```

## File Structure

```javascript
{
  name: "Design File",
  lastModified: "2024-01-15T10:30:00Z",
  document: {
    id: "0:0",
    name: "Document",
    type: "DOCUMENT",
    children: [
      {
        id: "1:2",
        name: "Page 1",
        type: "CANVAS",
        children: [
          {
            id: "1:3",
            name: "Frame",
            type: "FRAME",
            backgroundColor: { r: 1, g: 1, b: 1 },
            children: [...]
          }
        ]
      }
    ]
  }
}
```

## Node Types

- `DOCUMENT` - Root node
- `CANVAS` - Page
- `FRAME` - Frame/artboard
- `GROUP` - Group
- `COMPONENT` - Component definition
- `INSTANCE` - Component instance
- `RECTANGLE` - Rectangle shape
- `TEXT` - Text layer
- `VECTOR` - Vector shape

## Export Formats

Images can be exported as:
- `png` - PNG (supports scale 0.01 to 4)
- `jpg` - JPEG
- `svg` - SVG
- `pdf` - PDF

```javascript
const images = await client.fileImages('FILE_KEY', {
  ids: ['NODE_ID'],
  format: 'svg'  // or 'png', 'jpg', 'pdf'
});
```

## Best Practices

- Cache file data to reduce API calls
- Use webhooks for file updates (requires Figma API v2)
- Store file keys and node IDs in config
- Batch image exports to reduce requests
- Use scale: 1 for development, 2+ for production
- Extract styles from style guide pages
- Version control exported tokens
- Document component naming conventions

## Rate Limits

- 500 requests per minute per token
- Use backoff strategy if rate limited

```javascript
async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        throw error;
      }
    }
  }
}
```

## Common Issues

**401 Unauthorized**: Invalid token or expired
**403 Forbidden**: No access to file
**404 Not Found**: Invalid file key or node ID
**429 Rate Limited**: Too many requests

## Resources

- Figma API: https://www.figma.com/developers/api
- figma-js: https://github.com/figma/figma-api-demo
- API playground: https://www.figma.com/developers/api#playground
- Webhooks: https://www.figma.com/developers/api#webhooks
