---
name: Slack
description: Slack workspace integration. Use when user wants to send messages, read channels, post notifications, create bots, or automate Slack workflows.
source: base
---

# Slack

Integrate with Slack to send messages, read channels, and automate workflows.

## When to Use

Use this skill when the user wants to:
- Send messages to Slack channels
- Post notifications and alerts
- Read channel history
- Create or manage Slack bots
- Respond to slash commands
- Build interactive workflows
- Send files or attachments
- Manage channels and users

## Setup

### 1. Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Name your app and select workspace

### 2. Add Bot Token Scopes

Go to "OAuth & Permissions" and add scopes:
- `chat:write` - Send messages
- `chat:write.public` - Send to public channels without joining
- `channels:read` - View public channels
- `channels:history` - Read messages
- `files:write` - Upload files
- `users:read` - View users

### 3. Install App

1. Click "Install to Workspace"
2. Authorize the app
3. Copy "Bot User OAuth Token"

### 4. Store Token

```bash
export SLACK_BOT_TOKEN="xoxb-xxxxx"
```

Or in `.env`:
```
SLACK_BOT_TOKEN=xoxb-xxxxx
```

## Installation

```bash
npm install @slack/web-api
```

Or Python:
```bash
pip install slack-sdk
```

## JavaScript Usage

```javascript
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

// Send message
await client.chat.postMessage({
  channel: 'C1234567890',  // Channel ID or name
  text: 'Hello from Node.js!'
});

// Send rich message with blocks
await client.chat.postMessage({
  channel: 'general',
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: '*Hello* from _Slack Blocks_!' }
    }
  ]
});
```

## Common Patterns

### Send Simple Message

```javascript
async function sendMessage(channel, text) {
  const result = await client.chat.postMessage({
    channel: channel,
    text: text
  });
  return result.ts; // Message timestamp (unique ID)
}

await sendMessage('general', 'Hello World!');
```

### Send Rich Message with Blocks

```javascript
await client.chat.postMessage({
  channel: 'general',
  blocks: [
    {
      type: 'header',
      text: { type: 'plain_text', text: 'Build Status' }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: '*Status:* Success ✅' }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: '*Branch:*\nmain' },
        { type: 'mrkdwn', text: '*Duration:*\n2m 34s' }
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'View Details' },
          url: 'https://example.com/build/123'
        }
      ]
    }
  ]
});
```

### Thread Reply

```javascript
// Reply to a message in a thread
await client.chat.postMessage({
  channel: 'general',
  thread_ts: '1234567890.123456',  // Parent message timestamp
  text: 'Reply in thread'
});
```

### Upload File

```javascript
const fs = require('fs');

await client.files.uploadV2({
  channel_id: 'C1234567890',
  file: fs.createReadStream('report.pdf'),
  filename: 'report.pdf',
  initial_comment: 'Here is the report'
});
```

### Read Channel History

```javascript
const result = await client.conversations.history({
  channel: 'C1234567890',
  limit: 10
});

for (const message of result.messages) {
  console.log(`${message.user}: ${message.text}`);
}
```

### Get Channel ID by Name

```javascript
async function getChannelId(channelName) {
  const result = await client.conversations.list();

  for (const channel of result.channels) {
    if (channel.name === channelName) {
      return channel.id;
    }
  }

  throw new Error(`Channel #${channelName} not found`);
}

const channelId = await getChannelId('general');
```

### Send Direct Message

```javascript
async function sendDM(userId, text) {
  // Open DM channel
  const dm = await client.conversations.open({ users: userId });

  // Send message
  await client.chat.postMessage({
    channel: dm.channel.id,
    text: text
  });
}

await sendDM('U1234567890', 'Private message!');
```

### Update Message

```javascript
await client.chat.update({
  channel: 'C1234567890',
  ts: '1234567890.123456',  // Message timestamp
  text: 'Updated text'
});
```

### Delete Message

```javascript
await client.chat.delete({
  channel: 'C1234567890',
  ts: '1234567890.123456'
});
```

### Add Reaction

```javascript
await client.reactions.add({
  channel: 'C1234567890',
  timestamp: '1234567890.123456',
  name: 'thumbsup'  // Emoji name without colons
});
```

## Python Usage

```python
from slack_sdk import WebClient

client = WebClient(token=os.environ['SLACK_BOT_TOKEN'])

# Send message
response = client.chat_postMessage(
    channel='general',
    text='Hello from Python!'
)

# Send with blocks
response = client.chat_postMessage(
    channel='general',
    blocks=[
        {
            'type': 'section',
            'text': {'type': 'mrkdwn', 'text': '*Hello* World!'}
        }
    ]
)
```

## Block Kit Examples

### Alert Message

```javascript
{
  blocks: [
    {
      type: 'header',
      text: { type: 'plain_text', text: '⚠️ Alert: High CPU Usage' }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: '*Server:*\nweb-prod-01' },
        { type: 'mrkdwn', text: '*CPU:*\n95%' }
      ]
    },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: 'Triggered at 2024-01-15 10:30 UTC' }
      ]
    }
  ]
}
```

### Notification with Image

```javascript
{
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: 'New deployment completed' },
      accessory: {
        type: 'image',
        image_url: 'https://example.com/success.png',
        alt_text: 'success'
      }
    }
  ]
}
```

### Interactive Buttons

```javascript
{
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: 'Approve this PR?' }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Approve' },
          style: 'primary',
          value: 'approve'
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Reject' },
          style: 'danger',
          value: 'reject'
        }
      ]
    }
  ]
}
```

## Webhooks (Simpler Alternative)

For send-only integration, use Incoming Webhooks:

```javascript
const fetch = require('node-fetch');

const webhookUrl = 'https://hooks.slack.com/services/T00/B00/XXX';

await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello from webhook!',
    blocks: [...]
  })
});
```

No token required, but limited to sending messages only.

## Best Practices

- Use Block Kit for rich formatting
- Cache channel IDs to reduce API calls
- Handle rate limits (1 message per second per channel)
- Use threads for related messages
- Add meaningful emoji reactions
- Include actionable buttons for alerts
- Use markdown formatting (bold, italic, code blocks)
- Test with test channels first
- Handle errors gracefully
- Use webhooks for simple send-only needs

## Rate Limits

- Tier 1 (posting messages): ~1 request per second
- Tier 2 (reading data): ~20 requests per minute
- Tier 3 (complex operations): ~50 requests per minute

Handle rate limits:
```javascript
try {
  await client.chat.postMessage({...});
} catch (error) {
  if (error.code === 'rate_limited') {
    const retryAfter = error.retryAfter || 5;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    // Retry
  }
}
```

## Common Issues

**Not in channel**: Add `chat:write.public` scope or join channel first
**Invalid channel**: Use channel ID (starts with C) instead of name
**Token invalid**: Regenerate token in Slack app settings
**Missing scopes**: Add required scopes and reinstall app

## Resources

- Slack API: https://api.slack.com
- Block Kit Builder: https://app.slack.com/block-kit-builder
- Web API docs: https://api.slack.com/web
- Node SDK: https://slack.dev/node-slack-sdk
- Python SDK: https://slack.dev/python-slack-sdk
