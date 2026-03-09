export interface SessionInfo {
  sessionId: string
  startedAt: string
  lastActivity: string
  messageCount: number
  firstMessage: string
}

export interface ProjectSessions {
  projectName: string
  projectSlug: string
  sessions: SessionInfo[]
}

export class SessionsView {
  private container: HTMLElement
  private onSessionClick: (projectSlug: string, sessionId: string) => void
  private expandedProjects: Set<string> = new Set()

  constructor(
    container: HTMLElement,
    onSessionClick: (projectSlug: string, sessionId: string) => void
  ) {
    this.container = container
    this.onSessionClick = onSessionClick
  }

  async load() {
    this.container.innerHTML = '<div class="loading"><span class="loading-spinner"></span>Loading sessions...</div>'

    try {
      if (!window.__TAURI__) return
      const projects = await window.__TAURI__.core.invoke<ProjectSessions[]>('get_sessions')
      this.render(projects)
    } catch (e) {
      this.container.innerHTML = '<div class="loading">Failed to load sessions</div>'
      console.error(e)
    }
  }

  private render(projects: ProjectSessions[]) {
    this.container.innerHTML = ''

    if (projects.length === 0) {
      this.container.innerHTML = '<div class="loading">No sessions found</div>'
      return
    }

    for (const project of projects) {
      this.container.appendChild(this.createProjectGroup(project))
    }
  }

  private createProjectGroup(project: ProjectSessions): HTMLElement {
    const group = document.createElement('div')
    group.className = 'session-project'

    const header = document.createElement('div')
    header.className = 'session-project-header'

    const expanded = this.expandedProjects.has(project.projectSlug)

    header.innerHTML = `
      <span class="collapse-icon">${expanded ? '▼' : '▶'}</span>
      <span class="session-project-name">${project.projectName}</span>
      <span class="session-count">${project.sessions.length}</span>
    `

    const list = document.createElement('div')
    list.className = `session-list${expanded ? '' : ' collapsed'}`

    header.addEventListener('click', () => {
      const isExpanded = this.expandedProjects.has(project.projectSlug)
      if (isExpanded) {
        this.expandedProjects.delete(project.projectSlug)
        list.classList.add('collapsed')
        header.querySelector('.collapse-icon')!.textContent = '▶'
      } else {
        this.expandedProjects.add(project.projectSlug)
        list.classList.remove('collapsed')
        header.querySelector('.collapse-icon')!.textContent = '▼'
      }
    })

    for (const session of project.sessions) {
      list.appendChild(this.createSessionItem(project.projectSlug, session))
    }

    group.appendChild(header)
    group.appendChild(list)
    return group
  }

  private createSessionItem(projectSlug: string, session: SessionInfo): HTMLElement {
    const item = document.createElement('div')
    item.className = 'session-item'

    const date = this.formatDate(session.lastActivity || session.startedAt)
    const duration = this.formatDuration(session.startedAt, session.lastActivity)
    const preview = session.firstMessage || '(no preview)'

    item.innerHTML = `
      <div class="session-meta">
        <span class="session-date">${date}</span>
        <span class="session-stats">${session.messageCount} msgs${duration ? ' · ' + duration : ''}</span>
      </div>
      <div class="session-preview">${this.escapeHtml(preview)}</div>
    `

    item.addEventListener('click', () => {
      this.onSessionClick(projectSlug, session.sessionId)
    })

    return item
  }

  private formatDate(iso: string): string {
    if (!iso) return '?'
    try {
      const d = new Date(iso)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffDays === 0) {
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays}d ago`

      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    } catch {
      return iso.slice(0, 10)
    }
  }

  private formatDuration(start: string, end: string): string {
    if (!start || !end) return ''
    try {
      const ms = new Date(end).getTime() - new Date(start).getTime()
      if (ms < 60000) return '<1min'
      const mins = Math.floor(ms / 60000)
      if (mins < 60) return `${mins}min`
      const hours = Math.floor(mins / 60)
      const remMins = mins % 60
      return remMins > 0 ? `${hours}h${remMins}` : `${hours}h`
    } catch {
      return ''
    }
  }

  private escapeHtml(text: string): string {
    const el = document.createElement('span')
    el.textContent = text
    return el.innerHTML
  }
}
