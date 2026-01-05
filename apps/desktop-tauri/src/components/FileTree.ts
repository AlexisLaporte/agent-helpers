export interface EnrichedFileEntry {
  name: string
  path: string
  isDir: boolean
  isGhost: boolean
  zone: 'primary' | 'target' | 'system'
  fileType: 'claudemd' | 'skill' | 'command' | 'settings' | 'session' | 'system'
}

export interface ProjectView {
  isGlobal: boolean
  projectPath: string
  claudePath: string
  primary: EnrichedFileEntry[]
  target: EnrichedFileEntry[]
  system: EnrichedFileEntry[]
}

export interface FileEntry {
  name: string
  path: string
  isDir: boolean
  children?: FileEntry[]
}

export class FileTree {
  private container: HTMLElement
  private onSelect: (entry: EnrichedFileEntry) => void
  private onGhostClick: ((entry: EnrichedFileEntry) => void) | null = null
  private onDelete: ((path: string) => Promise<void>) | null = null
  private onDuplicate: ((path: string) => Promise<void>) | null = null
  private selectedPath: string | null = null
  private expandedDirs: Set<string> = new Set()
  private loadedChildren: Map<string, FileEntry[]> = new Map()
  private systemCollapsed: boolean = true

  constructor(container: HTMLElement, onSelect: (entry: EnrichedFileEntry) => void) {
    this.container = container
    this.onSelect = onSelect
    this.setupContextMenu()
  }

  setGhostClickHandler(handler: (entry: EnrichedFileEntry) => void) {
    this.onGhostClick = handler
  }

  setDeleteHandler(handler: (path: string) => Promise<void>) {
    this.onDelete = handler
  }

  setDuplicateHandler(handler: (path: string) => Promise<void>) {
    this.onDuplicate = handler
  }

  private setupContextMenu() {
    document.addEventListener('click', () => {
      const existing = document.querySelector('.context-menu')
      if (existing) existing.remove()
    })
  }

  private showContextMenu(e: MouseEvent, entry: EnrichedFileEntry) {
    e.preventDefault()

    // Don't show context menu for ghosts
    if (entry.isGhost) return

    const existing = document.querySelector('.context-menu')
    if (existing) existing.remove()

    const menu = document.createElement('div')
    menu.className = 'context-menu'
    menu.style.left = `${e.clientX}px`
    menu.style.top = `${e.clientY}px`

    // Duplicate option (files only)
    if (!entry.isDir) {
      const duplicateBtn = document.createElement('div')
      duplicateBtn.className = 'context-menu-item'
      duplicateBtn.textContent = 'Duplicate'
      duplicateBtn.addEventListener('click', async () => {
        menu.remove()
        if (this.onDuplicate) {
          await this.onDuplicate(entry.path)
        }
      })
      menu.appendChild(duplicateBtn)
    }

    const deleteBtn = document.createElement('div')
    deleteBtn.className = 'context-menu-item delete'
    deleteBtn.textContent = `Delete ${entry.isDir ? 'folder' : 'file'}`
    deleteBtn.addEventListener('click', async () => {
      menu.remove()
      const confirmed = confirm(`Delete "${entry.name}"? This cannot be undone.`)
      if (confirmed && this.onDelete) {
        await this.onDelete(entry.path)
      }
    })

    menu.appendChild(deleteBtn)
    document.body.appendChild(menu)
  }

  renderProjectView(view: ProjectView) {
    this.container.innerHTML = ''

    // Zone 1: Primary (CLAUDE.md)
    this.renderZone('', view.primary, 'primary')

    // Zone 2: Target (skills, commands, settings)
    this.renderZone('Configuration', view.target, 'target')

    // Zone 3: System (collapsed)
    this.renderSystemZone(view.system)
  }

  private renderZone(title: string, entries: EnrichedFileEntry[], zoneClass: string) {
    if (title) {
      const header = document.createElement('div')
      header.className = `zone-header ${zoneClass}`
      header.textContent = title
      this.container.appendChild(header)
    }

    const zone = document.createElement('div')
    zone.className = `zone ${zoneClass}`

    for (const entry of entries) {
      const item = this.createZoneItem(entry, 0)
      zone.appendChild(item)
    }

    this.container.appendChild(zone)
  }

  private renderSystemZone(entries: EnrichedFileEntry[]) {
    const header = document.createElement('div')
    header.className = 'zone-header system collapsible'
    header.innerHTML = `
      <span class="collapse-icon">${this.systemCollapsed ? '▶' : '▼'}</span>
      <span>System files (${entries.length})</span>
    `
    header.addEventListener('click', () => {
      this.systemCollapsed = !this.systemCollapsed
      header.querySelector('.collapse-icon')!.textContent = this.systemCollapsed ? '▶' : '▼'
      zone.classList.toggle('collapsed', this.systemCollapsed)
    })
    this.container.appendChild(header)

    const zone = document.createElement('div')
    zone.className = `zone system${this.systemCollapsed ? ' collapsed' : ''}`

    for (const entry of entries) {
      const item = this.createZoneItem(entry, 0)
      zone.appendChild(item)
    }

    this.container.appendChild(zone)
  }

  private createZoneItem(entry: EnrichedFileEntry, depth: number): HTMLElement {
    const item = document.createElement('div')
    item.className = `tree-item${entry.isDir ? ' folder' : ''}${entry.isGhost ? ' ghost' : ''}`
    item.dataset.path = entry.path
    item.style.paddingLeft = `${12 + depth * 16}px`

    if (entry.isDir && !entry.isGhost) {
      const chevron = document.createElement('span')
      chevron.className = 'chevron'
      chevron.textContent = this.expandedDirs.has(entry.path) ? '▼' : '▶'
      item.appendChild(chevron)
    } else if (entry.isGhost) {
      const plus = document.createElement('span')
      plus.className = 'ghost-plus'
      plus.textContent = '+'
      item.appendChild(plus)
    }

    const icon = document.createElement('span')
    icon.className = 'icon'
    icon.textContent = this.getIcon(entry)

    const name = document.createElement('span')
    name.className = 'name'
    name.textContent = entry.name

    item.appendChild(icon)
    item.appendChild(name)

    item.addEventListener('click', async (e) => {
      e.stopPropagation()

      if (entry.isGhost) {
        if (this.onGhostClick) {
          this.onGhostClick(entry)
        }
        return
      }

      if (entry.isDir) {
        await this.toggleDir(entry, item)
      } else {
        if (this.selectedPath) {
          const prev = this.container.querySelector(`[data-path="${CSS.escape(this.selectedPath)}"]`)
          prev?.classList.remove('selected')
        }
        item.classList.add('selected')
        this.selectedPath = entry.path
        this.onSelect(entry)
      }
    })

    item.addEventListener('contextmenu', (e) => this.showContextMenu(e, entry))

    return item
  }

  private async toggleDir(entry: EnrichedFileEntry, item: HTMLElement) {
    const chevron = item.querySelector('.chevron')

    if (this.expandedDirs.has(entry.path)) {
      this.expandedDirs.delete(entry.path)
      chevron!.textContent = '▶'
      this.removeChildren(entry.path)
    } else {
      if (!this.loadedChildren.has(entry.path)) {
        chevron!.textContent = '...'
        const children = await this.loadDirectory(entry.path)
        this.loadedChildren.set(entry.path, children)
      }
      this.expandedDirs.add(entry.path)
      chevron!.textContent = '▼'
      this.insertChildren(entry.path, item)
    }
  }

  private async loadDirectory(path: string): Promise<FileEntry[]> {
    try {
      if (window.__TAURI__) {
        return await window.__TAURI__.core.invoke<FileEntry[]>('list_directory', { path })
      }
    } catch (e) {
      console.error('Failed to load directory:', e)
    }
    return []
  }

  private removeChildren(parentPath: string) {
    const items = Array.from(this.container.querySelectorAll('.tree-item'))
    let removing = false
    const parentDepth = this.getDepth(parentPath)

    for (const item of items) {
      const itemPath = (item as HTMLElement).dataset.path || ''
      if (itemPath === parentPath) {
        removing = true
        continue
      }
      if (removing) {
        const itemDepth = this.getDepth(itemPath)
        if (itemDepth <= parentDepth) {
          removing = false
        } else {
          item.remove()
        }
      }
    }
  }

  private insertChildren(parentPath: string, parentItem: HTMLElement) {
    const children = this.loadedChildren.get(parentPath) || []
    const depth = this.getDepth(parentPath) + 1

    let insertAfter = parentItem
    for (const child of this.sortEntries(children)) {
      const enriched: EnrichedFileEntry = {
        name: child.name,
        path: child.path,
        isDir: child.isDir,
        isGhost: false,
        zone: 'target',
        fileType: 'system'
      }
      const childEl = this.createZoneItem(enriched, depth)
      insertAfter.after(childEl)
      insertAfter = childEl
    }
  }

  private sortEntries(entries: FileEntry[]): FileEntry[] {
    return [...entries].sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }

  private getDepth(path: string): number {
    const basePath = '/.claude'
    const relativePath = path.includes('.claude') ? path.split('.claude')[1] : path
    return (relativePath.match(/\//g) || []).length
  }

  private getIcon(entry: EnrichedFileEntry): string {
    if (entry.isGhost) {
      if (entry.isDir) return '📁'
      if (entry.fileType === 'claudemd') return '📝'
      if (entry.fileType === 'settings') return '⚙️'
      return '📄'
    }

    if (entry.isDir) {
      if (entry.fileType === 'skill') return '🎯'
      if (entry.fileType === 'command') return '⚡'
      return '📁'
    }

    if (entry.fileType === 'claudemd') return '📝'
    if (entry.fileType === 'settings') return '⚙️'
    if (entry.fileType === 'session') return '💬'
    if (entry.name.endsWith('.md')) return '📝'
    if (entry.name.endsWith('.json')) return '⚙️'
    if (entry.name.endsWith('.jsonl')) return '📊'
    return '📄'
  }

  // Legacy method for compatibility
  render(entries: FileEntry[]) {
    this.container.innerHTML = ''
    this.renderEntries(entries, 0)
  }

  private renderEntries(entries: FileEntry[], depth: number) {
    const sorted = [...entries].sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    for (const entry of sorted) {
      const enriched: EnrichedFileEntry = {
        name: entry.name,
        path: entry.path,
        isDir: entry.isDir,
        isGhost: false,
        zone: 'system',
        fileType: 'system'
      }
      const item = this.createZoneItem(enriched, depth)
      this.container.appendChild(item)
    }
  }
}
