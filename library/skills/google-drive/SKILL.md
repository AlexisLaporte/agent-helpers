---
name: Google Drive
description: Google Drive, Sheets, and Slides integration. Use when user wants to read/write spreadsheets, create presentations, access Drive files, or automate Google Workspace tasks.
source: base
---

# Google Drive

Integrate with Google Drive, Sheets, and Slides.

## When to Use

Use this skill when the user wants to:
- Read or write Google Sheets data
- Create or update presentations in Slides
- Access files from Google Drive
- Automate spreadsheet calculations
- Generate reports or dashboards
- Export data to Google Workspace
- Create slides from templates

## Setup

### 1. Enable APIs

1. Go to https://console.cloud.google.com
2. Create or select a project
3. Enable these APIs:
   - Google Drive API
   - Google Sheets API
   - Google Slides API

### 2. Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Create service account
3. Create key (JSON format)
4. Download credentials file

### 3. Share Files

Share spreadsheets/presentations with service account email:
```
your-service-account@project-id.iam.gserviceaccount.com
```

### 4. Install Libraries

```bash
npm install googleapis
```

Or Python:
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

## Authentication (JavaScript)

```javascript
const { google } = require('googleapis');
const credentials = require('./credentials.json');

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/presentations'
  ]
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });
const slides = google.slides({ version: 'v1', auth });
```

## Google Sheets

### Read Data

```javascript
const spreadsheetId = 'YOUR_SPREADSHEET_ID';

// Read range
const response = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: 'Sheet1!A1:C10',
});

const rows = response.data.values;
console.log(rows); // [['Name', 'Email', 'Status'], ...]
```

### Write Data

```javascript
await sheets.spreadsheets.values.update({
  spreadsheetId,
  range: 'Sheet1!A1',
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [
      ['Name', 'Email', 'Status'],
      ['John', 'john@example.com', 'Active'],
      ['Jane', 'jane@example.com', 'Pending']
    ]
  }
});
```

### Append Data

```javascript
await sheets.spreadsheets.values.append({
  spreadsheetId,
  range: 'Sheet1!A:C',
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [['New', 'new@example.com', 'Active']]
  }
});
```

### Create Spreadsheet

```javascript
const response = await sheets.spreadsheets.create({
  requestBody: {
    properties: { title: 'My New Spreadsheet' },
    sheets: [{ properties: { title: 'Sheet1' } }]
  }
});

console.log('Created:', response.data.spreadsheetId);
```

### Batch Update

```javascript
await sheets.spreadsheets.batchUpdate({
  spreadsheetId,
  requestBody: {
    requests: [
      {
        updateCells: {
          range: { sheetId: 0, startRowIndex: 0, startColumnIndex: 0 },
          rows: [{ values: [{ userEnteredValue: { stringValue: 'Bold Text' } }] }],
          fields: 'userEnteredValue'
        }
      }
    ]
  }
});
```

## Google Slides

### Read Presentation

```javascript
const presentationId = 'YOUR_PRESENTATION_ID';

const presentation = await slides.presentations.get({ presentationId });

for (const slide of presentation.data.slides) {
  console.log('Slide ID:', slide.objectId);
}
```

### Create Presentation

```javascript
const response = await slides.presentations.create({
  requestBody: { title: 'My Presentation' }
});

const presentationId = response.data.presentationId;
```

### Add Slide

```javascript
await slides.presentations.batchUpdate({
  presentationId,
  requestBody: {
    requests: [
      {
        createSlide: {
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' }
        }
      }
    ]
  }
});
```

### Update Text

```javascript
await slides.presentations.batchUpdate({
  presentationId,
  requestBody: {
    requests: [
      {
        insertText: {
          objectId: 'TEXTBOX_ID',
          text: 'Hello World',
          insertionIndex: 0
        }
      }
    ]
  }
});
```

### Add Image

```javascript
await slides.presentations.batchUpdate({
  presentationId,
  requestBody: {
    requests: [
      {
        createImage: {
          url: 'https://example.com/image.png',
          elementProperties: {
            pageObjectId: 'SLIDE_ID',
            size: { width: { magnitude: 300, unit: 'PT' }, height: { magnitude: 200, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: 100, translateY: 100, unit: 'PT' }
          }
        }
      }
    ]
  }
});
```

## Google Drive

### List Files

```javascript
const response = await drive.files.list({
  pageSize: 10,
  fields: 'files(id, name, mimeType, modifiedTime)',
  q: "mimeType='application/vnd.google-apps.spreadsheet'"
});

for (const file of response.data.files) {
  console.log(`${file.name} (${file.id})`);
}
```

### Upload File

```javascript
const fs = require('fs');

await drive.files.create({
  requestBody: {
    name: 'document.pdf',
    mimeType: 'application/pdf'
  },
  media: {
    mimeType: 'application/pdf',
    body: fs.createReadStream('document.pdf')
  }
});
```

### Download File

```javascript
const fileId = 'FILE_ID';
const dest = fs.createWriteStream('downloaded.pdf');

const response = await drive.files.get(
  { fileId, alt: 'media' },
  { responseType: 'stream' }
);

response.data.pipe(dest);
```

### Share File

```javascript
await drive.permissions.create({
  fileId: 'FILE_ID',
  requestBody: {
    type: 'user',
    role: 'writer',
    emailAddress: 'user@example.com'
  }
});
```

## Python Usage

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

credentials = service_account.Credentials.from_service_account_file(
    'credentials.json',
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

sheets = build('sheets', 'v4', credentials=credentials)

# Read data
result = sheets.spreadsheets().values().get(
    spreadsheetId=spreadsheet_id,
    range='Sheet1!A1:C10'
).execute()

values = result.get('values', [])
print(values)
```

## Common Patterns

### Export Sheet to CSV

```javascript
const response = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: 'Sheet1'
});

const csv = response.data.values.map(row => row.join(',')).join('\n');
fs.writeFileSync('export.csv', csv);
```

### Import CSV to Sheet

```javascript
const csv = fs.readFileSync('data.csv', 'utf-8');
const rows = csv.split('\n').map(line => line.split(','));

await sheets.spreadsheets.values.update({
  spreadsheetId,
  range: 'Sheet1!A1',
  valueInputOption: 'USER_ENTERED',
  requestBody: { values: rows }
});
```

### Generate Report Slides

```javascript
async function createReport(data) {
  // Create presentation
  const pres = await slides.presentations.create({
    requestBody: { title: 'Weekly Report' }
  });

  const presentationId = pres.data.presentationId;

  // Add slides with data
  const requests = data.map((item, i) => ({
    createSlide: {
      slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
      placeholderIdMappings: [
        { layoutPlaceholder: { type: 'TITLE' }, objectId: `title_${i}` },
        { layoutPlaceholder: { type: 'BODY' }, objectId: `body_${i}` }
      ]
    }
  }));

  await slides.presentations.batchUpdate({ presentationId, requestBody: { requests } });
}
```

## Best Practices

- Use service accounts for server applications
- Cache spreadsheet IDs in configuration
- Batch operations to reduce API calls
- Use appropriate scopes (least privilege)
- Handle rate limits with exponential backoff
- Validate data before writing
- Keep credentials secure (use environment variables)

## Common Issues

**Authentication error**: Check credentials file and scopes
**Permission denied**: Share file with service account email
**Rate limit exceeded**: Add delays between requests
**Invalid range**: Verify sheet name and cell range format

## Resources

- Drive API: https://developers.google.com/drive
- Sheets API: https://developers.google.com/sheets/api
- Slides API: https://developers.google.com/slides
- Node.js quickstart: https://developers.google.com/drive/api/quickstart/nodejs
