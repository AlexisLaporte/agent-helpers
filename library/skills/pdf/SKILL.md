---
name: PDF
description: PDF manipulation toolkit. Use when user wants to extract text, merge/split PDFs, create PDFs, extract images, or manipulate PDF documents.
source: base
---

# PDF

Comprehensive PDF manipulation and extraction toolkit.

## When to Use

Use this skill when the user wants to:
- Extract text from PDFs
- Merge or split PDF files
- Create PDFs from scratch or HTML
- Extract images from PDFs
- Add or remove pages
- Encrypt or decrypt PDFs
- Extract metadata and tables
- Convert PDFs to other formats

## Installation

```bash
npm install pdf-lib pdf-parse
```

For advanced features:
```bash
npm install pdfkit    # Create PDFs
npm install puppeteer # HTML to PDF
```

Python alternative:
```bash
pip install PyPDF2 pdfplumber
```

## Extract Text (JavaScript)

```javascript
const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('document.pdf');
const data = await pdf(dataBuffer);

console.log('Pages:', data.numpages);
console.log('Text:', data.text);
```

## Merge PDFs

```javascript
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function mergePDFs(pdfPaths, outputPath) {
  const mergedPdf = await PDFDocument.create();

  for (const path of pdfPaths) {
    const pdfBytes = fs.readFileSync(path);
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedBytes);
}

await mergePDFs(['file1.pdf', 'file2.pdf'], 'merged.pdf');
```

## Split PDF

```javascript
async function splitPDF(inputPath, outputDir) {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(pdfBytes);

  for (let i = 0; i < pdf.getPageCount(); i++) {
    const singlePagePdf = await PDFDocument.create();
    const [page] = await singlePagePdf.copyPages(pdf, [i]);
    singlePagePdf.addPage(page);

    const bytes = await singlePagePdf.save();
    fs.writeFileSync(`${outputDir}/page-${i + 1}.pdf`, bytes);
  }
}

await splitPDF('document.pdf', './pages');
```

## Create PDF

```javascript
const PDFDocument = require('pdfkit');

function createPDF(outputPath) {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Add content
  doc.fontSize(25).text('Hello World!', 100, 100);

  doc.addPage()
     .fontSize(12)
     .text('Page 2 content');

  doc.end();
}

createPDF('output.pdf');
```

## HTML to PDF

```javascript
const puppeteer = require('puppeteer');

async function htmlToPdf(htmlContent, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true
  });

  await browser.close();
}

await htmlToPdf('<h1>Hello PDF</h1>', 'output.pdf');
```

## Extract Metadata

```javascript
const { PDFDocument } = require('pdf-lib');

async function getMetadata(pdfPath) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdf = await PDFDocument.load(pdfBytes);

  return {
    title: pdf.getTitle(),
    author: pdf.getAuthor(),
    subject: pdf.getSubject(),
    keywords: pdf.getKeywords(),
    creator: pdf.getCreator(),
    producer: pdf.getProducer(),
    creationDate: pdf.getCreationDate(),
    modificationDate: pdf.getModificationDate(),
    pageCount: pdf.getPageCount()
  };
}
```

## Add Pages from Another PDF

```javascript
async function addPages(sourcePath, targetPath, outputPath) {
  const targetBytes = fs.readFileSync(targetPath);
  const targetPdf = await PDFDocument.load(targetBytes);

  const sourceBytes = fs.readFileSync(sourcePath);
  const sourcePdf = await PDFDocument.load(sourceBytes);

  const pages = await targetPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
  pages.forEach(page => targetPdf.addPage(page));

  const bytes = await targetPdf.save();
  fs.writeFileSync(outputPath, bytes);
}
```

## Remove Pages

```javascript
async function removePages(inputPath, outputPath, pagesToRemove) {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(pdfBytes);

  // Remove in reverse order to maintain indices
  pagesToRemove.sort((a, b) => b - a);
  for (const pageNum of pagesToRemove) {
    pdf.removePage(pageNum - 1); // 0-indexed
  }

  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
}

await removePages('input.pdf', 'output.pdf', [3, 5, 7]);
```

## Python Usage

### Extract Text

```python
import PyPDF2

with open('document.pdf', 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    text = ''
    for page in reader.pages:
        text += page.extract_text()
    print(text)
```

### Merge PDFs

```python
import PyPDF2

merger = PyPDF2.PdfMerger()

for pdf in ['file1.pdf', 'file2.pdf']:
    merger.append(pdf)

merger.write('merged.pdf')
merger.close()
```

### Extract Tables with pdfplumber

```python
import pdfplumber

with pdfplumber.open('document.pdf') as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            print(table)
```

## Extract Images

```javascript
// Using pdf-lib
async function extractImages(pdfPath) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdf = await PDFDocument.load(pdfBytes);

  const pages = pdf.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Images are embedded as XObjects
    const resources = page.node.Resources();
    if (resources) {
      // Extract image data
      console.log(`Page ${i + 1}: ${width}x${height}`);
    }
  }
}
```

## Encrypt PDF

```javascript
const { PDFDocument, StandardFonts } = require('pdf-lib');

async function encryptPDF(inputPath, outputPath, password) {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(pdfBytes);

  // Note: pdf-lib doesn't support encryption directly
  // Use Python's PyPDF2 or external tools like pdftk
  console.warn('Use Python PyPDF2 or pdftk for encryption');
}
```

Python encryption:
```python
import PyPDF2

reader = PyPDF2.PdfReader('input.pdf')
writer = PyPDF2.PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.encrypt('password123')

with open('encrypted.pdf', 'wb') as output:
    writer.write(output)
```

## Common Patterns

### Extract Specific Pages

```javascript
async function extractPages(inputPath, outputPath, pageNumbers) {
  const pdfBytes = fs.readFileSync(inputPath);
  const sourcePdf = await PDFDocument.load(pdfBytes);
  const targetPdf = await PDFDocument.create();

  const pages = await targetPdf.copyPages(
    sourcePdf,
    pageNumbers.map(n => n - 1) // Convert to 0-indexed
  );

  pages.forEach(page => targetPdf.addPage(page));

  const bytes = await targetPdf.save();
  fs.writeFileSync(outputPath, bytes);
}

await extractPages('input.pdf', 'output.pdf', [1, 3, 5]);
```

### Rotate Pages

```javascript
async function rotatePages(inputPath, outputPath, degrees) {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(pdfBytes);

  const pages = pdf.getPages();
  pages.forEach(page => {
    page.setRotation({ angle: degrees });
  });

  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
}

await rotatePages('input.pdf', 'output.pdf', 90);
```

### Add Watermark

```javascript
async function addWatermark(inputPath, outputPath, watermarkText) {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(pdfBytes);

  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  pages.forEach(page => {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 2 - 100,
      y: height / 2,
      size: 50,
      font,
      color: rgb(0.95, 0.95, 0.95),
      opacity: 0.5
    });
  });

  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
}
```

## Best Practices

- Stream large PDFs to avoid memory issues
- Validate PDF integrity before processing
- Use pdf-lib for structure manipulation
- Use pdf-parse for text extraction
- Use pdfkit for PDF creation
- Use puppeteer for HTML to PDF conversion
- Handle encrypted PDFs with proper error messages
- Test with various PDF versions (1.4, 1.5, 1.7, etc.)

## Common Issues

**Text extraction returns gibberish**: PDF uses embedded fonts or images
```
Solution: Use OCR (tesseract.js) for scanned PDFs
```

**Memory errors with large PDFs**: File too large for memory
```
Solution: Process page by page or use streaming
```

**Corrupted output**: Incompatible PDF version
```
Solution: Update libraries or use pdf-lib
```

## Tools

Command-line alternatives:
```bash
# Merge PDFs
pdftk file1.pdf file2.pdf cat output merged.pdf

# Split PDF
pdftk input.pdf burst

# Extract pages
pdftk input.pdf cat 1-3 5 7-9 output selected.pdf

# Rotate
pdftk input.pdf cat 1-endeast output rotated.pdf
```

## Resources

- pdf-lib: https://pdf-lib.js.org
- pdf-parse: https://www.npmjs.com/package/pdf-parse
- pdfkit: https://pdfkit.org
- PyPDF2: https://pypdf2.readthedocs.io
- pdfplumber: https://github.com/jsvine/pdfplumber
