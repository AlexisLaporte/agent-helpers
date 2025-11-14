---
name: Article Extractor
description: Extract clean article text from web pages. Use when user wants to read article content without ads/clutter, save articles, or process web content.
source: base
---

# Article Extractor

Extract clean, readable content from web articles by removing ads, menus, and clutter.

## When to Use

Use this skill when the user wants to:
- Extract main article text from web pages
- Remove ads, sidebars, and navigation
- Save articles for offline reading
- Process article content programmatically
- Convert web pages to markdown
- Get article metadata (title, author, date)

## Installation

```bash
npm install @mozilla/readability jsdom
npm install node-fetch
```

Or use readability-cli:
```bash
npm install -g @mozilla/readability-cli
```

Python alternative:
```bash
pip install newspaper3k
pip install readability-lxml
```

## JavaScript Usage

```javascript
const fetch = require('node-fetch');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

async function extractArticle(url) {
  const response = await fetch(url);
  const html = await response.text();

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  return {
    title: article.title,
    author: article.byline,
    content: article.textContent,
    html: article.content,
    excerpt: article.excerpt,
    siteName: article.siteName,
    length: article.length
  };
}

const article = await extractArticle('https://example.com/article');
console.log(article.title);
console.log(article.content);
```

## Save to File

```javascript
const fs = require('fs');

async function saveArticle(url, outputPath) {
  const article = await extractArticle(url);

  const markdown = `# ${article.title}\n\n` +
                   `**Author:** ${article.author || 'Unknown'}\n\n` +
                   `**Source:** ${article.siteName || url}\n\n` +
                   `---\n\n${article.content}`;

  fs.writeFileSync(outputPath, markdown);
  console.log(`Saved to ${outputPath}`);
}

await saveArticle('https://example.com/article', 'article.md');
```

## HTML to Markdown

```javascript
const TurndownService = require('turndown');

async function articleToMarkdown(url) {
  const article = await extractArticle(url);

  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  });

  const markdown = turndown.turndown(article.html);

  return {
    title: article.title,
    author: article.byline,
    markdown: markdown
  };
}
```

## Batch Extraction

```javascript
async function extractMultiple(urls) {
  const results = [];

  for (const url of urls) {
    try {
      const article = await extractArticle(url);
      results.push({ url, article, error: null });

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ url, article: null, error: error.message });
    }
  }

  return results;
}

const urls = [
  'https://example.com/article1',
  'https://example.com/article2'
];

const articles = await extractMultiple(urls);
```

## Python Usage (newspaper3k)

```python
from newspaper import Article

url = 'https://example.com/article'
article = Article(url)

article.download()
article.parse()

print('Title:', article.title)
print('Authors:', article.authors)
print('Date:', article.publish_date)
print('Text:', article.text)
print('Top image:', article.top_image)
```

## Python Usage (readability)

```python
import requests
from readability import Document

response = requests.get('https://example.com/article')
doc = Document(response.text)

print('Title:', doc.title())
print('Content:', doc.summary())
```

## CLI Usage

```bash
# Extract article
npx @mozilla/readability-cli https://example.com/article

# Save to file
npx @mozilla/readability-cli https://example.com/article > article.html

# Extract text only
npx @mozilla/readability-cli https://example.com/article --text-only
```

## Advanced Patterns

### With Full Browser (for JavaScript-heavy sites)

```javascript
const puppeteer = require('puppeteer');

async function extractWithBrowser(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  const content = await page.evaluate(() => {
    const { Readability } = require('@mozilla/readability');
    const reader = new Readability(document);
    return reader.parse();
  });

  await browser.close();
  return content;
}
```

### Extract with Images

```javascript
async function extractWithImages(url) {
  const article = await extractArticle(url);

  // Parse images from HTML content
  const dom = new JSDOM(article.html);
  const images = Array.from(dom.window.document.querySelectorAll('img'))
    .map(img => ({
      src: img.src,
      alt: img.alt
    }));

  return {
    ...article,
    images
  };
}
```

### Extract Metadata

```javascript
const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-title')()
]);

async function getMetadata(url) {
  const response = await fetch(url);
  const html = await response.text();

  const metadata = await metascraper({ html, url });

  return {
    title: metadata.title,
    author: metadata.author,
    date: metadata.date,
    description: metadata.description,
    image: metadata.image
  };
}
```

### Filter by Content Length

```javascript
async function extractLongArticle(url, minLength = 1000) {
  const article = await extractArticle(url);

  if (article.content.length < minLength) {
    throw new Error(`Article too short: ${article.content.length} chars`);
  }

  return article;
}
```

## Convert to Different Formats

### To Plain Text

```javascript
function stripHTML(html) {
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent;
}

const article = await extractArticle(url);
const plainText = stripHTML(article.html);
```

### To JSON

```javascript
async function saveAsJSON(url, outputPath) {
  const article = await extractArticle(url);

  fs.writeFileSync(outputPath, JSON.stringify(article, null, 2));
}

await saveAsJSON('https://example.com/article', 'article.json');
```

### To PDF

```javascript
const PDFDocument = require('pdfkit');

async function articleToPDF(url, outputPath) {
  const article = await extractArticle(url);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(outputPath));

  doc.fontSize(20).text(article.title);
  doc.moveDown();
  doc.fontSize(12).text(article.byline || '');
  doc.moveDown();
  doc.fontSize(10).text(article.content);

  doc.end();
}
```

## Common Patterns

### RSS Feed Reader

```javascript
const Parser = require('rss-parser');

async function readFeed(feedUrl) {
  const parser = new Parser();
  const feed = await parser.parseURL(feedUrl);

  const articles = [];

  for (const item of feed.items.slice(0, 5)) {
    const article = await extractArticle(item.link);
    articles.push({
      title: item.title,
      link: item.link,
      content: article.content
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return articles;
}
```

### Article Archive

```javascript
async function archiveArticle(url) {
  const article = await extractArticle(url);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${timestamp}-${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;

  const markdown = `# ${article.title}\n\n` +
                   `**Date archived:** ${timestamp}\n` +
                   `**URL:** ${url}\n` +
                   `**Author:** ${article.byline || 'Unknown'}\n\n` +
                   `---\n\n${article.content}`;

  fs.writeFileSync(`archive/${filename}`, markdown);
}
```

## Best Practices

- Respect robots.txt and rate limits
- Add delays between requests (1-2 seconds)
- Cache extracted content to avoid re-fetching
- Handle errors gracefully (some pages won't extract)
- Use full browser (Puppeteer) for JavaScript-heavy sites
- Verify content quality after extraction
- Store original URL with extracted content
- Consider copyright and terms of service

## Common Issues

**Empty or incomplete content**: Page uses JavaScript to load content
```
Solution: Use Puppeteer instead of simple fetch
```

**Extraction fails**: Non-article page (e.g., home page)
```
Solution: Check article.length before processing
```

**Images missing or broken**: Relative URLs not resolved
```
Solution: Convert relative URLs to absolute
```

**Rate limited**: Too many requests
```
Solution: Add delays and respect robots.txt
```

## Tools

Command-line tools:
```bash
# Readability CLI
npx @mozilla/readability-cli URL

# Save to file
curl URL | npx @mozilla/readability-cli > article.html

# Mercury Parser (alternative)
npx @postlight/mercury-parser URL
```

Browser extensions:
- Reader View (Firefox built-in)
- Just Read (Chrome extension)
- Clearly (Chrome extension)

## Resources

- Readability: https://github.com/mozilla/readability
- newspaper3k: https://newspaper.readthedocs.io
- Metascraper: https://metascraper.js.org
- Mercury Parser: https://github.com/postlight/mercury-parser
