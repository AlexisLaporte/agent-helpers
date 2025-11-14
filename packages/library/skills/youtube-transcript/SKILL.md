---
name: YouTube Transcript
description: Extract video transcripts and captions from YouTube. Use when user wants to get text content from YouTube videos, analyze video content, create summaries, or extract quotes.
source: base
---

# YouTube Transcript

Extract transcripts and captions from YouTube videos.

## When to Use

Use this skill when the user wants to:
- Get the transcript of a YouTube video
- Extract captions or subtitles
- Analyze video content without watching
- Create summaries or notes from videos
- Search for specific quotes in videos
- Convert video content to text format

## Installation

```bash
npm install youtube-transcript
```

Or use Python:
```bash
pip install youtube-transcript-api
```

## JavaScript/Node.js Usage

```javascript
const { YoutubeTranscript } = require('youtube-transcript');

// Extract transcript
const transcript = await YoutubeTranscript.fetchTranscript('VIDEO_ID');

// transcript is an array of objects:
// [
//   { text: 'Hello', duration: 1.5, offset: 0 },
//   { text: 'World', duration: 2.0, offset: 1.5 },
//   ...
// ]

// Get full text
const fullText = transcript.map(item => item.text).join(' ');
console.log(fullText);
```

## Python Usage

```python
from youtube_transcript_api import YouTubeTranscriptApi

# Get transcript
transcript = YouTubeTranscriptApi.get_transcript('VIDEO_ID')

# With language preference
transcript = YouTubeTranscriptApi.get_transcript('VIDEO_ID', languages=['en', 'fr'])

# Full text
full_text = ' '.join([item['text'] for item in transcript])
print(full_text)
```

## Extract Video ID from URL

```javascript
function getVideoId(url) {
  const match = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|$)/);
  return match ? match[1] : null;
}

// Examples:
// https://www.youtube.com/watch?v=dQw4w9WgXcQ → dQw4w9WgXcQ
// https://youtu.be/dQw4w9WgXcQ → dQw4w9WgXcQ
```

## Common Patterns

### Save transcript to file

```javascript
const fs = require('fs');
const { YoutubeTranscript } = require('youtube-transcript');

async function saveTranscript(videoId, outputFile) {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  const text = transcript.map(item => item.text).join(' ');
  fs.writeFileSync(outputFile, text);
}

await saveTranscript('dQw4w9WgXcQ', 'transcript.txt');
```

### Formatted transcript with timestamps

```javascript
async function getFormattedTranscript(videoId) {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);

  return transcript.map(item => {
    const time = new Date(item.offset * 1000).toISOString().substr(11, 8);
    return `[${time}] ${item.text}`;
  }).join('\n');
}

console.log(await getFormattedTranscript('VIDEO_ID'));
// Output:
// [00:00:00] Hello
// [00:00:01] World
```

### Search in transcript

```javascript
async function searchTranscript(videoId, query) {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);

  return transcript
    .filter(item => item.text.toLowerCase().includes(query.toLowerCase()))
    .map(item => ({
      time: item.offset,
      text: item.text,
      url: `https://youtube.com/watch?v=${videoId}&t=${Math.floor(item.offset)}s`
    }));
}

const results = await searchTranscript('VIDEO_ID', 'important');
```

## Multiple Languages

```python
from youtube_transcript_api import YouTubeTranscriptApi

# List available transcripts
transcript_list = YouTubeTranscriptApi.list_transcripts('VIDEO_ID')

for transcript in transcript_list:
    print(f"Language: {transcript.language}")
    print(f"Generated: {transcript.is_generated}")

# Get in specific language
transcript = YouTubeTranscriptApi.get_transcript('VIDEO_ID', languages=['fr'])
```

## Batch Processing

```javascript
async function getMultipleTranscripts(videoIds) {
  const results = [];

  for (const id of videoIds) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(id);
      results.push({ id, transcript, error: null });
    } catch (error) {
      results.push({ id, transcript: null, error: error.message });
    }
  }

  return results;
}
```

## Common Issues

**Transcript not available**: Some videos don't have captions
```javascript
try {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
} catch (error) {
  console.log('No transcript available for this video');
}
```

**Rate limiting**: Add delays between requests
```javascript
await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
```

**Language not found**: List available languages first
```python
transcript_list = YouTubeTranscriptApi.list_transcripts('VIDEO_ID')
for t in transcript_list:
    print(t.language_code)
```

## Best Practices

- Always handle errors (not all videos have transcripts)
- Cache transcripts to avoid repeated API calls
- Respect YouTube's terms of service
- Add delays for batch processing
- Check transcript availability before processing
- Use generated transcripts as fallback

## Resources

- Node.js: https://www.npmjs.com/package/youtube-transcript
- Python: https://github.com/jdepoix/youtube-transcript-api
- YouTube Data API: https://developers.google.com/youtube/v3
