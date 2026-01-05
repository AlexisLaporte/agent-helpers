import * as monaco from 'monaco-editor'

interface OpenFile {
  path: string
  name: string
  projectName: string
  model: monaco.editor.ITextModel
  originalContent: string
  modified: boolean
}

export class Editor {
  private container: HTMLElement
  private editor: monaco.editor.IStandaloneCodeEditor | null = null
  private openFiles: Map<string, OpenFile> = new Map()
  private currentPath: string | null = null
  private tabsContainer: HTMLElement
  private editorElement: HTMLElement
  private onSave: ((path: string, content: string) => Promise<void>) | null = null
  private onFileCreated: (() => void) | null = null

  constructor(container: HTMLElement) {
    this.container = container

    this.tabsContainer = document.createElement('div')
    this.tabsContainer.className = 'editor-tabs'

    this.editorElement = document.createElement('div')
    this.editorElement.id = 'monaco-editor'

    this.container.appendChild(this.tabsContainer)
    this.container.appendChild(this.editorElement)

    this.showEmptyState()
    this.setupKeyboardShortcuts()
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        await this.saveCurrentFile()
      }
    })
  }

  setSaveHandler(handler: (path: string, content: string) => Promise<void>) {
    this.onSave = handler
  }

  setFileCreatedHandler(handler: () => void) {
    this.onFileCreated = handler
  }

  private showEmptyState() {
    const empty = document.createElement('div')
    empty.className = 'empty-state'
    empty.textContent = 'Select a file to edit'
    this.editorElement.appendChild(empty)
  }

  private initEditor() {
    if (this.editor) return

    this.editorElement.innerHTML = ''
    this.editor = monaco.editor.create(this.editorElement, {
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
      lineNumbers: 'on',
      wordWrap: 'on',
      scrollBeyondLastLine: false,
    })

    this.editor.onDidChangeModelContent(() => {
      if (this.currentPath) {
        const file = this.openFiles.get(this.currentPath)
        if (file) {
          const currentContent = this.editor!.getValue()
          const wasModified = file.modified
          file.modified = currentContent !== file.originalContent
          if (wasModified !== file.modified) {
            this.renderTabs()
            this.updateToolbar()
          }
        }
      }
    })
  }

  private updateToolbar() {
    const saveBtn = this.container.querySelector('.save-btn') as HTMLButtonElement
    if (saveBtn) {
      const file = this.currentPath ? this.openFiles.get(this.currentPath) : null
      saveBtn.disabled = !file?.modified
    }
  }

  openFile(path: string, name: string, content: string, projectName: string = '') {
    this.initEditor()

    let file = this.openFiles.get(path)
    if (!file) {
      const lang = this.getLanguage(name)
      const model = monaco.editor.createModel(content, lang)
      file = { path, name, projectName, model, originalContent: content, modified: false }
      this.openFiles.set(path, file)
    }

    this.currentPath = path
    this.editor!.setModel(file.model)
    this.renderTabs()
    this.updateToolbar()
  }

  openNewFile(path: string, name: string, template: string, projectName: string = '') {
    this.initEditor()

    // Close existing if any
    const existing = this.openFiles.get(path)
    if (existing) {
      existing.model.dispose()
      this.openFiles.delete(path)
    }

    const lang = this.getLanguage(name)
    const model = monaco.editor.createModel(template, lang)
    // Mark as modified with empty originalContent so save creates the file
    const file = { path, name, projectName, model, originalContent: '', modified: true }
    this.openFiles.set(path, file)

    this.currentPath = path
    this.editor!.setModel(file.model)
    this.renderTabs()
    this.updateToolbar()
  }

  private async saveCurrentFile() {
    if (!this.currentPath || !this.onSave) return

    const file = this.openFiles.get(this.currentPath)
    if (!file || !file.modified) return

    const content = this.editor!.getValue()
    const isNewFile = file.originalContent === ''

    try {
      await this.onSave(this.currentPath, content)
      file.originalContent = content
      file.modified = false
      this.renderTabs()
      this.updateToolbar()
      this.showSaveNotification()

      // Notify if this was a new file creation
      if (isNewFile && this.onFileCreated) {
        this.onFileCreated()
      }
    } catch (e) {
      console.error('Failed to save:', e)
      this.showErrorNotification('Failed to save file')
    }
  }

  private showSaveNotification() {
    const notification = document.createElement('div')
    notification.className = 'save-notification'
    notification.textContent = 'Saved!'
    this.container.appendChild(notification)
    setTimeout(() => notification.remove(), 1500)
  }

  private showErrorNotification(message: string) {
    const notification = document.createElement('div')
    notification.className = 'save-notification error'
    notification.textContent = message
    this.container.appendChild(notification)
    setTimeout(() => notification.remove(), 3000)
  }

  private closeFile(path: string) {
    const file = this.openFiles.get(path)
    if (file) {
      // Warn if modified
      if (file.modified) {
        if (!confirm(`${file.name} has unsaved changes. Close anyway?`)) {
          return
        }
      }
      file.model.dispose()
      this.openFiles.delete(path)
    }

    if (this.currentPath === path) {
      const remaining = Array.from(this.openFiles.keys())
      if (remaining.length > 0) {
        const next = this.openFiles.get(remaining[0])!
        this.currentPath = remaining[0]
        this.editor!.setModel(next.model)
      } else {
        this.currentPath = null
        this.editor?.dispose()
        this.editor = null
        this.editorElement.innerHTML = ''
        this.showEmptyState()
      }
    }

    this.renderTabs()
  }

  private renderTabs() {
    this.tabsContainer.innerHTML = ''

    for (const [path, file] of this.openFiles) {
      const tab = document.createElement('div')
      tab.className = `editor-tab${path === this.currentPath ? ' active' : ''}${file.modified ? ' modified' : ''}`

      const nameContainer = document.createElement('span')
      nameContainer.className = 'tab-name-container'
      nameContainer.addEventListener('click', () => {
        this.currentPath = path
        this.editor!.setModel(file.model)
        this.renderTabs()
        this.updateToolbar()
      })

      const name = document.createElement('span')
      name.className = 'tab-name'
      name.textContent = file.name + (file.modified ? ' •' : '')

      nameContainer.appendChild(name)

      if (file.projectName) {
        const project = document.createElement('span')
        project.className = 'tab-project'
        project.textContent = file.projectName
        nameContainer.appendChild(project)
      }

      const close = document.createElement('span')
      close.className = 'close'
      close.textContent = '×'
      close.addEventListener('click', (e) => {
        e.stopPropagation()
        this.closeFile(path)
      })

      tab.appendChild(nameContainer)
      tab.appendChild(close)
      this.tabsContainer.appendChild(tab)
    }

    // Add save button at the end
    const saveBtn = document.createElement('button')
    saveBtn.className = 'save-btn'
    saveBtn.title = 'Save (Ctrl+S)'
    saveBtn.textContent = '💾'
    saveBtn.disabled = true
    saveBtn.addEventListener('click', () => this.saveCurrentFile())
    this.tabsContainer.appendChild(saveBtn)

    this.updateToolbar()
  }

  private getLanguage(name: string): string {
    if (name.endsWith('.md')) return 'markdown'
    if (name.endsWith('.json')) return 'json'
    if (name.endsWith('.yaml') || name.endsWith('.yml')) return 'yaml'
    if (name.endsWith('.ts')) return 'typescript'
    if (name.endsWith('.js')) return 'javascript'
    return 'plaintext'
  }

  getContent(): string | null {
    return this.editor?.getValue() ?? null
  }

  notifyExternalChange(path: string) {
    const file = this.openFiles.get(path)
    if (!file) return

    // Show a notification bar for this file
    this.showReloadBar(path, file.name)
  }

  private showReloadBar(path: string, name: string) {
    // Remove existing reload bar if any
    const existing = this.container.querySelector('.reload-bar')
    if (existing) existing.remove()

    const bar = document.createElement('div')
    bar.className = 'reload-bar'
    bar.innerHTML = `
      <span>📄 "${name}" was modified externally.</span>
      <button class="reload-btn">Reload</button>
      <button class="dismiss-btn">Dismiss</button>
    `

    bar.querySelector('.reload-btn')!.addEventListener('click', async () => {
      await this.reloadFile(path)
      bar.remove()
    })

    bar.querySelector('.dismiss-btn')!.addEventListener('click', () => {
      bar.remove()
    })

    this.tabsContainer.after(bar)
  }

  private async reloadFile(path: string) {
    const file = this.openFiles.get(path)
    if (!file) return

    try {
      if (window.__TAURI__) {
        const content = await window.__TAURI__.core.invoke<string>('read_file', { path })
        file.model.setValue(content)
        file.originalContent = content
        file.modified = false
        this.renderTabs()
      }
    } catch (e) {
      console.error('Failed to reload file:', e)
    }
  }
}
