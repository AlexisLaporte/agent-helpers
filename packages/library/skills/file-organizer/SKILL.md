---
name: File Organizer
description: Organize files and folders intelligently. Use when user wants to clean up directories, sort files by type/date, deduplicate, or maintain organized file structures.
source: base
---

# File Organizer

Intelligently organize files and maintain clean directory structures.

## When to Use

Use this skill when the user wants to:
- Organize messy directories
- Sort files by type, date, or project
- Find and remove duplicate files
- Clean up downloads folder
- Maintain organized file structures
- Rename files in batch
- Move files based on patterns

## Basic File Organization

### Organize by Type

```javascript
const fs = require('fs');
const path = require('path');

const fileTypes = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
  documents: ['.pdf', '.doc', '.docx', '.txt', '.md'],
  videos: ['.mp4', '.avi', '.mov', '.mkv'],
  audio: ['.mp3', '.wav', '.flac', '.m4a'],
  archives: ['.zip', '.tar', '.gz', '.rar', '.7z'],
  code: ['.js', '.ts', '.py', '.java', '.cpp', '.go']
};

function organizeByType(sourceDir, targetDir) {
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const sourcePath = path.join(sourceDir, file);

    if (!fs.statSync(sourcePath).isFile()) continue;

    // Find category
    let category = 'other';
    for (const [type, extensions] of Object.entries(fileTypes)) {
      if (extensions.includes(ext)) {
        category = type;
        break;
      }
    }

    // Create category directory
    const categoryDir = path.join(targetDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Move file
    const targetPath = path.join(categoryDir, file);
    fs.renameSync(sourcePath, targetPath);
    console.log(`Moved ${file} to ${category}/`);
  }
}

organizeByType('./downloads', './organized');
```

### Organize by Date

```javascript
function organizeByDate(sourceDir, targetDir) {
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);

    if (!fs.statSync(sourcePath).isFile()) continue;

    const stats = fs.statSync(sourcePath);
    const date = stats.mtime; // Modified date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Create date directory
    const dateDir = path.join(targetDir, `${year}`, `${year}-${month}`);
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }

    // Move file
    const targetPath = path.join(dateDir, file);
    fs.renameSync(sourcePath, targetPath);
    console.log(`Moved ${file} to ${year}/${year}-${month}/`);
  }
}

organizeByDate('./downloads', './organized-by-date');
```

## Find Duplicates

```javascript
const crypto = require('crypto');

function getFileHash(filepath) {
  const content = fs.readFileSync(filepath);
  return crypto.createHash('md5').update(content).digest('hex');
}

function findDuplicates(directory) {
  const hashes = new Map();
  const duplicates = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        const hash = getFileHash(fullPath);

        if (hashes.has(hash)) {
          duplicates.push({
            original: hashes.get(hash),
            duplicate: fullPath,
            size: stats.size
          });
        } else {
          hashes.set(hash, fullPath);
        }
      }
    }
  }

  scanDirectory(directory);
  return duplicates;
}

const dupes = findDuplicates('./documents');
dupes.forEach(d => {
  console.log(`Duplicate: ${d.duplicate}`);
  console.log(`Original:  ${d.original}`);
  console.log(`Size:      ${d.size} bytes\n`);
});
```

## Batch Rename

```javascript
function batchRename(directory, pattern, replacement) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filepath = path.join(directory, file);

    if (!fs.statSync(filepath).isFile()) continue;

    const newName = file.replace(new RegExp(pattern), replacement);

    if (newName !== file) {
      const newPath = path.join(directory, newName);
      fs.renameSync(filepath, newPath);
      console.log(`Renamed: ${file} → ${newName}`);
    }
  }
}

// Example: Remove spaces and replace with underscores
batchRename('./documents', ' ', '_');

// Example: Add prefix
batchRename('./images', '^', '2024-');
```

## Clean Empty Directories

```javascript
function removeEmptyDirs(directory) {
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);

    if (fs.statSync(fullPath).isDirectory()) {
      removeEmptyDirs(fullPath);

      // Check if now empty
      if (fs.readdirSync(fullPath).length === 0) {
        fs.rmdirSync(fullPath);
        console.log(`Removed empty directory: ${fullPath}`);
      }
    }
  }
}

removeEmptyDirs('./projects');
```

## Smart Organization Patterns

### Organize Photos by EXIF Date

```javascript
const ExifParser = require('exif-parser');

function organizePhotosByDate(sourceDir, targetDir) {
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg'].includes(ext)) continue;

    const filepath = path.join(sourceDir, file);
    const buffer = fs.readFileSync(filepath);

    try {
      const parser = ExifParser.create(buffer);
      const result = parser.parse();
      const date = new Date(result.tags.DateTimeOriginal * 1000);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const targetPath = path.join(targetDir, `${year}`, `${month}`, `${day}`);
      fs.mkdirSync(targetPath, { recursive: true });

      fs.renameSync(filepath, path.join(targetPath, file));
      console.log(`Moved ${file} to ${year}/${month}/${day}/`);
    } catch (error) {
      console.log(`No EXIF data for ${file}`);
    }
  }
}
```

### Organize by Project

```javascript
function organizeByProject(sourceDir, targetDir) {
  const patterns = {
    'project-alpha': /alpha/i,
    'project-beta': /beta/i,
    'client-acme': /acme/i
  };

  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const filepath = path.join(sourceDir, file);

    if (!fs.statSync(filepath).isFile()) continue;

    let moved = false;

    for (const [project, pattern] of Object.entries(patterns)) {
      if (pattern.test(file)) {
        const projectDir = path.join(targetDir, project);
        fs.mkdirSync(projectDir, { recursive: true });

        fs.renameSync(filepath, path.join(projectDir, file));
        console.log(`Moved ${file} to ${project}/`);
        moved = true;
        break;
      }
    }

    if (!moved) {
      const otherDir = path.join(targetDir, 'uncategorized');
      fs.mkdirSync(otherDir, { recursive: true });
      fs.renameSync(filepath, path.join(otherDir, file));
    }
  }
}
```

## Python Alternative

```python
import os
import shutil
from pathlib import Path

def organize_by_type(source_dir, target_dir):
    file_types = {
        'images': ['.jpg', '.png', '.gif', '.svg'],
        'documents': ['.pdf', '.doc', '.docx', '.txt'],
        'videos': ['.mp4', '.avi', '.mov'],
        'audio': ['.mp3', '.wav', '.flac']
    }

    for file in os.listdir(source_dir):
        filepath = os.path.join(source_dir, file)

        if not os.path.isfile(filepath):
            continue

        ext = Path(file).suffix.lower()

        category = 'other'
        for cat, extensions in file_types.items():
            if ext in extensions:
                category = cat
                break

        category_dir = os.path.join(target_dir, category)
        os.makedirs(category_dir, exist_ok=True)

        shutil.move(filepath, os.path.join(category_dir, file))
        print(f'Moved {file} to {category}/')
```

## CLI Tools

### Using find and mv

```bash
# Move all PDFs to documents/
find . -name "*.pdf" -exec mv {} documents/ \;

# Move files older than 30 days to archive/
find . -type f -mtime +30 -exec mv {} archive/ \;

# Delete files larger than 100MB
find . -type f -size +100M -delete

# Find duplicate files by size
find . -type f -exec du -h {} + | sort -h | uniq -d -w 8
```

### Using organize-cli

```bash
npm install -g organize-cli

# Organize current directory
organize

# Organize specific directory
organize ~/Downloads

# Dry run (preview changes)
organize --dry-run ~/Downloads
```

## Best Practices

- Always backup before organizing
- Use dry-run mode first to preview changes
- Organize regularly (weekly/monthly)
- Create a consistent folder structure
- Use descriptive folder names
- Keep similar files together
- Archive old files periodically
- Document your organization system
- Test patterns on small samples first

## Common Patterns

### Downloads Cleanup

```javascript
function cleanDownloads() {
  const downloadsDir = path.join(process.env.HOME, 'Downloads');
  organizeByType(downloadsDir, path.join(downloadsDir, 'organized'));
  removeEmptyDirs(downloadsDir);
}
```

### Screenshot Organization

```javascript
function organizeScreenshots(sourceDir, targetDir) {
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    if (/screenshot/i.test(file)) {
      const filepath = path.join(sourceDir, file);
      const stats = fs.statSync(filepath);
      const date = stats.mtime;

      const dateDir = path.join(
        targetDir,
        'screenshots',
        date.toISOString().split('T')[0]
      );

      fs.mkdirSync(dateDir, { recursive: true });
      fs.renameSync(filepath, path.join(dateDir, file));
    }
  }
}
```

## Tools

- organize-cli: Automatic file organization
- fdupes: Find duplicate files
- ranger: Terminal file manager
- fzf: Fuzzy file finder
- fd: Fast file finder

## Resources

- Node.js fs module: https://nodejs.org/api/fs.html
- organize-cli: https://github.com/ManrajGrover/organize-cli
- fdupes: https://github.com/adrianlopezroche/fdupes
