export interface ClaudeProject {
  name: string
  path: string
  claude_path: string
  last_modified: number
}

export class ProjectSelector {
  private container: HTMLElement
  private onSelect: (project: ClaudeProject) => void
  private projects: ClaudeProject[] = []
  private filteredProjects: ClaudeProject[] = []
  private currentProject: ClaudeProject | null = null
  private searchQuery: string = ''

  constructor(container: HTMLElement, onSelect: (project: ClaudeProject) => void) {
    this.container = container
    this.onSelect = onSelect
    this.render()
  }

  private render() {
    this.container.innerHTML = `
      <div class="project-selector">
        <div class="current-project">
          <span class="project-name">
            <span class="loading-spinner"></span>
            Scanning projects...
          </span>
        </div>
        <div class="project-dropdown hidden">
          <div class="dropdown-header">
            <input type="text" class="search-input" placeholder="Search projects..." />
            <button class="refresh-btn" title="Refresh">↻</button>
          </div>
          <div class="project-list"></div>
        </div>
      </div>
    `

    const current = this.container.querySelector('.current-project')!
    const dropdown = this.container.querySelector('.project-dropdown')!
    const refreshBtn = this.container.querySelector('.refresh-btn')!
    const searchInput = this.container.querySelector('.search-input') as HTMLInputElement

    current.addEventListener('click', () => {
      dropdown.classList.toggle('hidden')
      if (!dropdown.classList.contains('hidden')) {
        searchInput.focus()
      }
    })

    searchInput.addEventListener('input', () => {
      this.searchQuery = searchInput.value.toLowerCase()
      this.filterProjects()
    })

    searchInput.addEventListener('click', (e) => e.stopPropagation())

    refreshBtn.addEventListener('click', async (e) => {
      e.stopPropagation()
      await this.loadProjects(true)
    })

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target as Node)) {
        dropdown.classList.add('hidden')
      }
    })
  }

  async loadProjects(forceRefresh = false) {
    const list = this.container.querySelector('.project-list')
    if (list) {
      list.innerHTML = '<div class="loading">Scanning...</div>'
    }

    try {
      if (window.__TAURI__) {
        this.projects = await window.__TAURI__.core.invoke<ClaudeProject[]>('get_all_projects', { forceRefresh })
      }
    } catch (e) {
      console.error('Failed to load projects:', e)
      this.projects = []
    }

    this.filteredProjects = this.projects
    this.renderProjectList()

    // Auto-select Global on startup
    if (this.projects.length > 0 && !this.currentProject) {
      // Find Global or use first
      const global = this.projects.find(p => p.name.includes('Global')) || this.projects[0]
      this.selectProject(global)
    }
  }

  private filterProjects() {
    if (!this.searchQuery) {
      this.filteredProjects = this.projects
    } else {
      this.filteredProjects = this.projects.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.path.toLowerCase().includes(this.searchQuery)
      )
    }
    this.renderProjectList()
  }

  private renderProjectList() {
    const list = this.container.querySelector('.project-list')!
    list.innerHTML = ''

    if (this.filteredProjects.length === 0) {
      list.innerHTML = '<div class="no-projects">No projects found</div>'
      return
    }

    for (const project of this.filteredProjects) {
      const item = document.createElement('div')
      item.className = 'project-item'
      if (this.currentProject?.claude_path === project.claude_path) {
        item.classList.add('active')
      }

      const icon = project.name.includes('Global') ? '🌐' : '📁'
      item.innerHTML = `
        <span class="icon">${icon}</span>
        <div class="project-info">
          <span class="name">${project.name}</span>
          <span class="path">${project.path}</span>
        </div>
      `

      item.addEventListener('click', () => {
        this.selectProject(project)
        this.container.querySelector('.project-dropdown')!.classList.add('hidden')
      })

      list.appendChild(item)
    }
  }

  private selectProject(project: ClaudeProject) {
    this.currentProject = project
    const currentEl = this.container.querySelector('.current-project')!
    const icon = project.name.includes('Global') ? '🌐' : '📁'
    currentEl.innerHTML = `
      <span class="project-name">${icon} ${project.name}</span>
      <span class="dropdown-arrow">▼</span>
    `
    this.renderProjectList()
    this.onSelect(project)
  }
}
