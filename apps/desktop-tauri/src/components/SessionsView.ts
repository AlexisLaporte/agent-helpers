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

interface FlatSession extends SessionInfo {
  projectName: string
  projectSlug: string
}

export class SessionsView {
  private container: HTMLElement
  private onSessionClick: (projectSlug: string, sessionId: string) => void
  private onDataLoaded: ((projects: ProjectSessions[]) => void) | null = null

  constructor(
    container: HTMLElement,
    onSessionClick: (projectSlug: string, sessionId: string) => void
  ) {
    this.container = container
    this.onSessionClick = onSessionClick
  }

  setDataLoadedHandler(handler: (projects: ProjectSessions[]) => void) {
    this.onDataLoaded = handler
  }

  async load() {
    this.container.innerHTML = '<div class="loading"><span class="loading-spinner"></span>Loading sessions...</div>'

    try {
      if (!window.__TAURI__) return
      const projects = await window.__TAURI__.core.invoke<ProjectSessions[]>('get_sessions')
      this.render(projects)
      if (this.onDataLoaded) this.onDataLoaded(projects)
    } catch (e) {
      this.container.innerHTML = '<div class="loading">Failed to load sessions</div>'
      console.error(e)
    }
  }

  private render(projects: ProjectSessions[]) {
    this.container.innerHTML = ''

    // Flatten all sessions, sort by lastActivity desc
    const flat: FlatSession[] = []
    for (const project of projects) {
      for (const session of project.sessions) {
        flat.push({ ...session, projectName: project.projectName, projectSlug: project.projectSlug })
      }
    }
    flat.sort((a, b) => (b.lastActivity || '').localeCompare(a.lastActivity || ''))

    if (flat.length === 0) {
      this.container.innerHTML = '<div class="loading">No sessions found</div>'
      return
    }

    // Group by date label
    let currentLabel = ''
    for (const session of flat) {
      const label = this.getDateLabel(session.lastActivity || session.startedAt)
      if (label !== currentLabel) {
        currentLabel = label
        const header = document.createElement('div')
        header.className = 'session-date-header'
        header.textContent = label
        this.container.appendChild(header)
      }
      this.container.appendChild(this.createSessionItem(session))
    }
  }

  private createSessionItem(session: FlatSession): HTMLElement {
    const item = document.createElement('div')
    item.className = 'session-item'

    const time = this.formatTime(session.lastActivity || session.startedAt)
    const duration = this.formatDuration(session.startedAt, session.lastActivity)
    const preview = session.firstMessage || '(no preview)'

    item.innerHTML = `
      <div class="session-meta">
        <span class="session-time">${time}</span>
        <span class="session-project-label">${this.escapeHtml(session.projectName)}</span>
        <span class="session-stats">${session.messageCount} msgs${duration ? ' · ' + duration : ''}</span>
      </div>
      <div class="session-preview">${this.escapeHtml(preview)}</div>
    `

    item.addEventListener('click', () => {
      this.onSessionClick(session.projectSlug, session.sessionId)
    })

    return item
  }

  private getDateLabel(iso: string): string {
    if (!iso) return 'Unknown'
    try {
      const d = new Date(iso)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const sessionDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const diffDays = Math.floor((today.getTime() - sessionDay.getTime()) / 86400000)

      if (diffDays === 0) return "Today"
      if (diffDays === 1) return "Yesterday"
      if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' })
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    } catch {
      return iso.slice(0, 10)
    }
  }

  private formatTime(iso: string): string {
    if (!iso) return '?'
    try {
      return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '?'
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
