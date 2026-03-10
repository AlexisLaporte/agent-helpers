import type { ProjectSessions, SessionInfo } from './SessionsView'

interface FlatSession extends SessionInfo {
  projectName: string
  projectSlug: string
}

interface Message {
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

export class SessionReader {
  private container: HTMLElement
  private onSessionClick: ((projectSlug: string, sessionId: string) => void) | null = null

  constructor(container: HTMLElement) {
    this.container = container
  }

  setSessionClickHandler(handler: (projectSlug: string, sessionId: string) => void) {
    this.onSessionClick = handler
  }

  showDashboard(projects: ProjectSessions[]) {
    // Flatten and sort by most recent
    const flat: FlatSession[] = []
    for (const project of projects) {
      for (const session of project.sessions) {
        flat.push({ ...session, projectName: project.projectName, projectSlug: project.projectSlug })
      }
    }
    flat.sort((a, b) => (b.lastActivity || '').localeCompare(a.lastActivity || ''))

    const recent = flat.slice(0, 30)

    this.container.innerHTML = ''
    const wrapper = document.createElement('div')
    wrapper.className = 'session-dashboard'

    if (recent.length === 0) {
      wrapper.innerHTML = '<div class="dashboard-empty">No sessions found</div>'
      this.container.appendChild(wrapper)
      return
    }

    // Group by date
    let currentLabel = ''
    for (const session of recent) {
      const label = this.getDateLabel(session.lastActivity || session.startedAt)
      if (label !== currentLabel) {
        currentLabel = label
        const header = document.createElement('div')
        header.className = 'dashboard-date-header'
        header.textContent = label
        wrapper.appendChild(header)
      }
      wrapper.appendChild(this.createCard(session))
    }

    this.container.appendChild(wrapper)
  }

  private createCard(session: FlatSession): HTMLElement {
    const card = document.createElement('div')
    card.className = 'dashboard-card'

    const time = this.formatTime(session.lastActivity || session.startedAt)
    const duration = this.formatDuration(session.startedAt, session.lastActivity)
    const preview = session.firstMessage || '(no preview)'

    card.innerHTML = `
      <div class="dashboard-card-header">
        <span class="dashboard-card-project">${this.escape(session.projectName)}</span>
        <span class="dashboard-card-time">${time}</span>
      </div>
      <div class="dashboard-card-preview">${this.escape(preview)}</div>
      <div class="dashboard-card-footer">
        <span>${session.messageCount} messages</span>
        ${duration ? `<span>${duration}</span>` : ''}
      </div>
    `

    card.addEventListener('click', () => {
      if (this.onSessionClick) {
        this.onSessionClick(session.projectSlug, session.sessionId)
      }
    })

    return card
  }

  show(jsonlContent: string, projectName: string) {
    const messages = this.parseJsonl(jsonlContent)

    const wrapper = document.createElement('div')
    wrapper.className = 'session-reader'

    const header = document.createElement('div')
    header.className = 'session-reader-header'
    header.innerHTML = `
      <button class="session-back-btn">←</button>
      <span class="session-reader-project">${this.escape(projectName)}</span>
      <span class="session-reader-info">${messages.length} messages</span>
    `
    header.querySelector('.session-back-btn')!.addEventListener('click', () => {
      // Will be replaced by dashboard on next load
      this.container.innerHTML = ''
    })
    wrapper.appendChild(header)

    const body = document.createElement('div')
    body.className = 'session-reader-body'

    for (const msg of messages) {
      body.appendChild(this.createBubble(msg))
    }

    wrapper.appendChild(body)

    this.container.innerHTML = ''
    this.container.appendChild(wrapper)

    requestAnimationFrame(() => body.scrollTop = body.scrollHeight)
  }

  hide() {
    this.container.innerHTML = ''
  }

  get isVisible(): boolean {
    return !!this.container.querySelector('.session-reader') || !!this.container.querySelector('.session-dashboard')
  }

  private parseJsonl(content: string): Message[] {
    const messages: Message[] = []
    for (const line of content.split('\n')) {
      if (!line.trim()) continue
      try {
        const entry = JSON.parse(line)
        if (entry.type !== 'user' && entry.type !== 'assistant') continue

        const role = entry.type as 'user' | 'assistant'
        const text = this.extractText(entry)
        if (!text) continue

        messages.push({ role, text, timestamp: entry.timestamp || '' })
      } catch {
        // skip
      }
    }
    return messages
  }

  private extractText(entry: any): string {
    const msg = entry.message
    if (!msg) return ''

    const content = msg.content
    if (typeof content === 'string') return content

    if (Array.isArray(content)) {
      const parts: string[] = []
      for (const block of content) {
        if (block.type === 'text' && block.text) {
          parts.push(block.text)
        } else if (block.type === 'tool_use') {
          parts.push(`[${block.name}]`)
        }
      }
      return parts.join('\n')
    }

    return ''
  }

  private createBubble(msg: Message): HTMLElement {
    const bubble = document.createElement('div')
    bubble.className = `message message-${msg.role}`

    const time = msg.timestamp
      ? new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : ''

    const text = document.createElement('div')
    text.className = 'message-text'
    text.textContent = msg.text.length > 2000 ? msg.text.slice(0, 2000) + '…' : msg.text
    bubble.appendChild(text)

    if (time) {
      const ts = document.createElement('span')
      ts.className = 'message-time'
      ts.textContent = time
      bubble.appendChild(ts)
    }

    return bubble
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

  private escape(text: string): string {
    const el = document.createElement('span')
    el.textContent = text
    return el.innerHTML
  }
}
