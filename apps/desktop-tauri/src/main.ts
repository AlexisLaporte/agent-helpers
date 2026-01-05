import { FileTree, EnrichedFileEntry, ProjectView } from './components/FileTree'
import { Editor } from './components/Editor'
import { ProjectSelector, ClaudeProject } from './components/ProjectSelector'
import { getTemplateForPath } from './templates'
import { checkForUpdates } from './updater'

declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>
      }
      event: {
        listen: <T>(event: string, handler: (event: { payload: T }) => void) => Promise<() => void>
      }
    }
  }
}

interface FileChangeEvent {
  path: string
  kind: 'create' | 'modify' | 'remove'
}

class App {
  private projectSelector: ProjectSelector
  private fileTree: FileTree
  private editor: Editor
  private currentProject: ClaudeProject | null = null
  private unlisten: (() => void) | null = null

  constructor() {
    const sidebar = document.getElementById('sidebar')!
    const header = document.createElement('div')
    header.id = 'sidebar-header'
    sidebar.insertBefore(header, sidebar.firstChild)

    this.projectSelector = new ProjectSelector(
      header,
      this.onProjectSelect.bind(this)
    )

    this.fileTree = new FileTree(
      document.getElementById('file-tree')!,
      this.onFileSelect.bind(this)
    )

    this.editor = new Editor(document.getElementById('editor-container')!)
    this.editor.setSaveHandler(this.saveFile.bind(this))
    this.editor.setFileCreatedHandler(() => this.loadProjectView())
    this.fileTree.setDeleteHandler(this.deleteItem.bind(this))
    this.fileTree.setDuplicateHandler(this.duplicateItem.bind(this))
    this.fileTree.setGhostClickHandler(this.onGhostClick.bind(this))
    this.init()
  }

  private async saveFile(path: string, content: string): Promise<void> {
    await this.invoke<void>('write_file', { path, content })
  }

  private async deleteItem(path: string): Promise<void> {
    await this.invoke<void>('delete_item', { path })
    await this.loadProjectView()
  }

  private async duplicateItem(path: string): Promise<void> {
    // Read content
    const content = await this.invoke<string>('read_file', { path })

    // Generate new path with _copy suffix
    const lastDot = path.lastIndexOf('.')
    const newPath = lastDot > 0
      ? path.slice(0, lastDot) + '_copy' + path.slice(lastDot)
      : path + '_copy'

    // Create the duplicate
    await this.invoke<void>('create_file', { path: newPath, content })
    await this.loadProjectView()
  }

  private async onGhostClick(entry: EnrichedFileEntry): Promise<void> {
    if (!this.currentProject) return

    const isGlobal = this.currentProject.name.includes('Global')
    const template = getTemplateForPath(entry.path, isGlobal)

    if (entry.isDir) {
      // Create directory immediately
      await this.invoke<void>('create_file', {
        path: entry.path + '/.gitkeep',
        content: ''
      })
      await this.loadProjectView()
    } else {
      // Open template in editor as new unsaved file
      // The file will be created when the user saves
      this.editor.openNewFile(entry.path, entry.name, template, this.currentProject.name)
    }
  }

  private async init() {
    await this.projectSelector.loadProjects()
    // Check for updates after a short delay
    setTimeout(() => checkForUpdates(), 2000)
  }

  private async onProjectSelect(project: ClaudeProject) {
    this.currentProject = project
    await this.loadProjectView()
    await this.startWatching(project.claude_path)
  }

  private async loadProjectView() {
    if (!this.currentProject) return

    try {
      const isGlobal = this.currentProject.name.includes('Global')
      const view = await this.invoke<ProjectView>('get_view', {
        claudePath: this.currentProject.claude_path,
        projectPath: this.currentProject.path,
        isGlobal
      })
      this.fileTree.renderProjectView(view)
    } catch (e) {
      console.error('Failed to load project view:', e)
    }
  }

  private async startWatching(path: string) {
    if (this.unlisten) {
      this.unlisten()
      this.unlisten = null
    }

    try {
      await this.invoke('watch_directory', { path })

      if (window.__TAURI__?.event) {
        this.unlisten = await window.__TAURI__.event.listen<FileChangeEvent>('file-change', (event) => {
          this.handleFileChange(event.payload)
        })
      }
    } catch (e) {
      console.error('Failed to start watching:', e)
    }
  }

  private handleFileChange(change: FileChangeEvent) {
    console.log('File changed:', change)

    if (change.kind === 'create' || change.kind === 'remove') {
      this.loadProjectView()
    }

    if (change.kind === 'modify') {
      this.editor.notifyExternalChange(change.path)
    }
  }

  private async onFileSelect(entry: EnrichedFileEntry) {
    if (entry.isDir || entry.isGhost) return

    try {
      const content = await this.invoke<string>('read_file', { path: entry.path })
      const projectName = this.currentProject?.name || ''
      this.editor.openFile(entry.path, entry.name, content, projectName)
    } catch (e) {
      console.error('Failed to read file:', e)
      const projectName = this.currentProject?.name || ''
      this.editor.openFile(entry.path, entry.name, `// Error loading ${entry.name}`, projectName)
    }
  }

  private async invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
    if (window.__TAURI__) {
      return window.__TAURI__.core.invoke<T>(cmd, args)
    }
    throw new Error('Tauri not available')
  }
}

new App()
