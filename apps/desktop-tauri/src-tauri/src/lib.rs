use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter};

static WATCHER: Mutex<Option<RecommendedWatcher>> = Mutex::new(None);

#[derive(Debug, Serialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    #[serde(rename = "isDir")]
    pub is_dir: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileEntry>>,
}

pub fn get_claude_dir() -> PathBuf {
    dirs::home_dir()
        .expect("Could not find home directory")
        .join(".claude")
}

fn should_include(name: &str) -> bool {
    !name.starts_with('.')
        && name != "node_modules"
        && name != "statsig"
        && name != "ide"
}

fn build_tree_shallow(path: &PathBuf) -> Option<FileEntry> {
    let name = path.file_name()?.to_str()?.to_string();

    if !should_include(&name) {
        return None;
    }

    let is_dir = path.is_dir();
    let display_path = path.to_str()?.to_string();

    Some(FileEntry {
        name,
        path: display_path,
        is_dir,
        children: None, // Lazy load
    })
}

pub fn list_dir(path: &str) -> Vec<FileEntry> {
    let expanded = if path.starts_with("~") {
        dirs::home_dir()
            .expect("Could not find home directory")
            .join(&path[2..])
    } else {
        PathBuf::from(path)
    };

    if !expanded.exists() || !expanded.is_dir() {
        return vec![];
    }

    let mut entries: Vec<FileEntry> = fs::read_dir(&expanded)
        .ok()
        .map(|rd| {
            rd.filter_map(|e| e.ok())
                .filter_map(|e| build_tree_shallow(&e.path()))
                .collect()
        })
        .unwrap_or_default();

    entries.sort_by(|a, b| {
        match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.cmp(&b.name),
        }
    });

    entries
}

pub fn list_files() -> Vec<FileEntry> {
    let claude_dir = get_claude_dir();
    list_dir(claude_dir.to_str().unwrap_or("~/.claude"))
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClaudeProject {
    pub name: String,
    pub path: String,
    pub claude_path: String,
    pub last_modified: u64, // Unix timestamp
}

#[derive(Debug, Serialize, Deserialize)]
struct ProjectCache {
    timestamp: u64,
    projects: Vec<ClaudeProject>,
}

fn get_cache_path() -> PathBuf {
    get_claude_dir().join("projects_cache.json")
}

fn get_cache_max_age() -> u64 {
    3600 // 1 hour
}

fn load_cache() -> Option<Vec<ClaudeProject>> {
    let cache_path = get_cache_path();
    if !cache_path.exists() {
        return None;
    }

    let content = fs::read_to_string(&cache_path).ok()?;
    let cache: ProjectCache = serde_json::from_str(&content).ok()?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .ok()?
        .as_secs();

    if now - cache.timestamp > get_cache_max_age() {
        return None; // Cache expired
    }

    Some(cache.projects)
}

fn save_cache(projects: &[ClaudeProject]) {
    let cache_path = get_cache_path();
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let cache = ProjectCache {
        timestamp: now,
        projects: projects.to_vec(),
    };

    if let Ok(content) = serde_json::to_string_pretty(&cache) {
        let _ = fs::write(&cache_path, content);
    }
}

fn scan_for_claude_dirs(base: &PathBuf, max_depth: usize) -> Vec<ClaudeProject> {
    let mut projects = Vec::new();
    scan_recursive(base, 0, max_depth, &mut projects);
    projects
}

fn get_last_modified(path: &PathBuf) -> u64 {
    fs::metadata(path)
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn scan_recursive(dir: &PathBuf, depth: usize, max_depth: usize, projects: &mut Vec<ClaudeProject>) {
    if depth > max_depth {
        return;
    }

    let claude_dir = dir.join(".claude");
    if claude_dir.exists() && claude_dir.is_dir() {
        let name = dir.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let last_modified = get_last_modified(&claude_dir);

        projects.push(ClaudeProject {
            name,
            path: dir.to_str().unwrap_or("").to_string(),
            claude_path: claude_dir.to_str().unwrap_or("").to_string(),
            last_modified,
        });
    }

    // Skip common non-project directories
    let skip_dirs = ["node_modules", ".git", "target", "dist", ".cache", "venv", "__pycache__", ".venv"];

    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_dir() {
                let name = path.file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("");

                if !name.starts_with('.') && !skip_dirs.contains(&name) {
                    scan_recursive(&path, depth + 1, max_depth, projects);
                }
            }
        }
    }
}

pub fn find_all_claude_projects(force_refresh: bool) -> Vec<ClaudeProject> {
    // Check cache first
    if !force_refresh {
        if let Some(cached) = load_cache() {
            return cached;
        }
    }

    let home = dirs::home_dir().expect("Could not find home directory");

    // Common dev directories to scan
    let mut scan_dirs: Vec<PathBuf> = vec![
        home.join("projects"),
        home.join("code"),
        home.join("dev"),
        home.join("work"),
        home.join("src"),
        home.join("repos"),
        home.join("github"),
        home.join("Documents"),
    ];

    // Add /data/{username} if it exists (common on some setups)
    if let Some(user) = home.file_name() {
        let data_user = PathBuf::from("/data").join(user);
        if data_user.exists() {
            scan_dirs.push(data_user);
        }
    }

    // Also scan /data directly for projects
    let data_dir = PathBuf::from("/data");
    if data_dir.exists() {
        scan_dirs.push(data_dir);
    }

    let mut all_projects = Vec::new();

    // Add global ~/.claude as special entry
    let global_claude = get_claude_dir();
    if global_claude.exists() {
        all_projects.push(ClaudeProject {
            name: "Global (~/.claude)".to_string(),
            path: home.to_str().unwrap_or("").to_string(),
            claude_path: global_claude.to_str().unwrap_or("").to_string(),
            last_modified: get_last_modified(&global_claude),
        });
    }

    // Scan each dev directory
    for scan_dir in scan_dirs {
        if scan_dir.exists() {
            let found = scan_for_claude_dirs(&scan_dir, 4); // Max 4 levels deep
            all_projects.extend(found);
        }
    }

    // Deduplicate by claude_path
    all_projects.sort_by(|a, b| a.claude_path.cmp(&b.claude_path));
    all_projects.dedup_by(|a, b| a.claude_path == b.claude_path);

    // Sort by last_modified (most recent first), Global always first
    all_projects.sort_by(|a, b| {
        let a_is_global = a.name.contains("Global");
        let b_is_global = b.name.contains("Global");
        match (a_is_global, b_is_global) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => b.last_modified.cmp(&a.last_modified), // Most recent first
        }
    });

    // Save to cache
    save_cache(&all_projects);

    all_projects
}

pub fn read_file_content(path: &str) -> Result<String, String> {
    let expanded = if path.starts_with("~") {
        dirs::home_dir()
            .ok_or("Could not find home directory")?
            .join(&path[2..])
    } else {
        PathBuf::from(path)
    };

    fs::read_to_string(&expanded)
        .map_err(|e| format!("Failed to read file: {}", e))
}

pub fn write_file_content(path: &str, content: &str) -> Result<(), String> {
    let expanded = if path.starts_with("~") {
        dirs::home_dir()
            .ok_or("Could not find home directory")?
            .join(&path[2..])
    } else {
        PathBuf::from(path)
    };

    fs::write(&expanded, content)
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[derive(Debug, Clone, Serialize)]
pub struct FileChangeEvent {
    pub path: String,
    pub kind: String, // "create", "modify", "remove"
}

pub fn start_watching(app: AppHandle, path: &str) -> Result<(), String> {
    let watch_path = if path.starts_with("~") {
        dirs::home_dir()
            .ok_or("Could not find home directory")?
            .join(&path[2..])
    } else {
        PathBuf::from(path)
    };

    let app_handle = app.clone();

    let watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
        if let Ok(event) = res {
            let kind = match event.kind {
                notify::EventKind::Create(_) => "create",
                notify::EventKind::Modify(_) => "modify",
                notify::EventKind::Remove(_) => "remove",
                _ => return,
            };

            for path in event.paths {
                let change = FileChangeEvent {
                    path: path.to_string_lossy().to_string(),
                    kind: kind.to_string(),
                };
                let _ = app_handle.emit("file-change", change);
            }
        }
    }).map_err(|e| format!("Failed to create watcher: {}", e))?;

    let mut guard = WATCHER.lock();
    *guard = Some(watcher);

    if let Some(ref mut w) = *guard {
        w.watch(&watch_path, RecursiveMode::Recursive)
            .map_err(|e| format!("Failed to watch path: {}", e))?;
    }

    Ok(())
}

pub fn stop_watching() {
    let mut guard = WATCHER.lock();
    *guard = None;
}

// === Project View with Zones ===

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum FileZone {
    Primary,  // CLAUDE.md
    Target,   // skills/, commands/, settings*.json
    System,   // Everything else
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum FileType {
    ClaudeMd,
    Skill,
    Command,
    Settings,
    Session,
    System,
}

#[derive(Debug, Clone, Serialize)]
pub struct EnrichedFileEntry {
    pub name: String,
    pub path: String,
    #[serde(rename = "isDir")]
    pub is_dir: bool,
    #[serde(rename = "isGhost")]
    pub is_ghost: bool,
    pub zone: FileZone,
    #[serde(rename = "fileType")]
    pub file_type: FileType,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProjectView {
    #[serde(rename = "isGlobal")]
    pub is_global: bool,
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "claudePath")]
    pub claude_path: String,
    pub primary: Vec<EnrichedFileEntry>,   // CLAUDE.md
    pub target: Vec<EnrichedFileEntry>,    // skills, commands, settings
    pub system: Vec<EnrichedFileEntry>,    // everything else
}

const TARGET_DIRS: &[&str] = &["skills", "commands"];

fn classify_entry(name: &str, is_dir: bool) -> (FileZone, FileType) {
    if name == "CLAUDE.md" {
        return (FileZone::Primary, FileType::ClaudeMd);
    }

    if is_dir {
        if name == "skills" {
            return (FileZone::Target, FileType::Skill);
        }
        if name == "commands" {
            return (FileZone::Target, FileType::Command);
        }
        return (FileZone::System, FileType::System);
    }

    // Files
    if name.starts_with("settings") && name.ends_with(".json") {
        return (FileZone::Target, FileType::Settings);
    }
    if name == "sessions.json" {
        return (FileZone::Target, FileType::Session);
    }

    (FileZone::System, FileType::System)
}

pub fn get_project_view(claude_path: &str, project_path: &str, is_global: bool) -> ProjectView {
    let claude_dir = PathBuf::from(claude_path);
    let project_dir = PathBuf::from(project_path);

    let mut primary = Vec::new();
    let mut target = Vec::new();
    let mut system = Vec::new();

    // Check for CLAUDE.md
    let claude_md_path = if is_global {
        claude_dir.join("CLAUDE.md")
    } else {
        project_dir.join("CLAUDE.md")
    };

    let claude_md_exists = claude_md_path.exists();
    primary.push(EnrichedFileEntry {
        name: "CLAUDE.md".to_string(),
        path: claude_md_path.to_string_lossy().to_string(),
        is_dir: false,
        is_ghost: !claude_md_exists,
        zone: FileZone::Primary,
        file_type: FileType::ClaudeMd,
    });

    // Add ghost entries for target dirs/files that don't exist
    for &dir_name in TARGET_DIRS {
        let dir_path = claude_dir.join(dir_name);
        let exists = dir_path.exists();
        let (zone, file_type) = classify_entry(dir_name, true);
        target.push(EnrichedFileEntry {
            name: dir_name.to_string(),
            path: dir_path.to_string_lossy().to_string(),
            is_dir: true,
            is_ghost: !exists,
            zone,
            file_type,
        });
    }

    // Check for settings.local.json (ghost if not exists)
    let settings_path = claude_dir.join("settings.local.json");
    let settings_exists = settings_path.exists();
    if !settings_exists {
        target.push(EnrichedFileEntry {
            name: "settings.local.json".to_string(),
            path: settings_path.to_string_lossy().to_string(),
            is_dir: false,
            is_ghost: true,
            zone: FileZone::Target,
            file_type: FileType::Settings,
        });
    }

    // Read actual directory contents
    if let Ok(entries) = fs::read_dir(&claude_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            let name = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();

            // Skip hidden files
            if name.starts_with('.') {
                continue;
            }

            let is_dir = path.is_dir();
            let (zone, file_type) = classify_entry(&name, is_dir);

            // Skip if already added as ghost
            if TARGET_DIRS.contains(&name.as_str()) || name == "CLAUDE.md" {
                // Update ghost to real
                if zone == FileZone::Target {
                    if let Some(entry) = target.iter_mut().find(|e| e.name == name) {
                        entry.is_ghost = false;
                    }
                }
                continue;
            }

            let enriched = EnrichedFileEntry {
                name,
                path: path.to_string_lossy().to_string(),
                is_dir,
                is_ghost: false,
                zone: zone.clone(),
                file_type,
            };

            match zone {
                FileZone::Primary => primary.push(enriched),
                FileZone::Target => target.push(enriched),
                FileZone::System => system.push(enriched),
            }
        }
    }

    // Sort each zone
    let sort_fn = |a: &EnrichedFileEntry, b: &EnrichedFileEntry| {
        // Ghosts last within their zone
        match (a.is_ghost, b.is_ghost) {
            (true, false) => std::cmp::Ordering::Greater,
            (false, true) => std::cmp::Ordering::Less,
            _ => {
                // Dirs first, then by name
                match (a.is_dir, b.is_dir) {
                    (true, false) => std::cmp::Ordering::Less,
                    (false, true) => std::cmp::Ordering::Greater,
                    _ => a.name.cmp(&b.name),
                }
            }
        }
    };

    target.sort_by(sort_fn);
    system.sort_by(sort_fn);

    ProjectView {
        is_global,
        project_path: project_path.to_string(),
        claude_path: claude_path.to_string(),
        primary,
        target,
        system,
    }
}

pub fn create_file_with_content(path: &str, content: &str) -> Result<(), String> {
    let expanded = PathBuf::from(path);

    // Create parent directories if needed
    if let Some(parent) = expanded.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directories: {}", e))?;
    }

    fs::write(&expanded, content)
        .map_err(|e| format!("Failed to create file: {}", e))
}

pub fn delete_path(path: &str) -> Result<(), String> {
    let expanded = if path.starts_with("~") {
        dirs::home_dir()
            .ok_or("Could not find home directory")?
            .join(&path[2..])
    } else {
        PathBuf::from(path)
    };

    if !expanded.exists() {
        return Err("Path does not exist".to_string());
    }

    if expanded.is_dir() {
        fs::remove_dir_all(&expanded)
            .map_err(|e| format!("Failed to delete directory: {}", e))
    } else {
        fs::remove_file(&expanded)
            .map_err(|e| format!("Failed to delete file: {}", e))
    }
}

// === Sessions ===

#[derive(Debug, Clone, Serialize)]
pub struct SessionInfo {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "startedAt")]
    pub started_at: String,
    #[serde(rename = "lastActivity")]
    pub last_activity: String,
    #[serde(rename = "messageCount")]
    pub message_count: usize,
    #[serde(rename = "firstMessage")]
    pub first_message: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProjectSessions {
    #[serde(rename = "projectName")]
    pub project_name: String,
    #[serde(rename = "projectSlug")]
    pub project_slug: String,
    pub sessions: Vec<SessionInfo>,
}

fn slug_to_project_name(slug: &str) -> String {
    // Convert slug like "-data-projects-tuls" to "/data/projects/tuls"
    let path = slug.replacen('-', "/", 1).replace('-', "/");
    // Try to extract just the last component as display name
    path.rsplit('/').next().unwrap_or(slug).to_string()
}

fn extract_json_field(line: &str, field: &str) -> Option<String> {
    // Fast extraction without full JSON parse
    let key = format!("\"{}\":", field);
    let start = line.find(&key)? + key.len();
    let rest = &line[start..].trim_start();
    if rest.starts_with('"') {
        let inner = &rest[1..];
        let end = inner.find('"')?;
        Some(inner[..end].to_string())
    } else {
        None
    }
}

fn extract_first_user_message(line: &str) -> Option<String> {
    // Look for "role":"user" and extract text content
    if !line.contains("\"role\":\"user\"") {
        return None;
    }
    // Try to find content string
    if let Some(pos) = line.find("\"content\":\"") {
        let start = pos + 11;
        let rest = &line[start..];
        let end = rest.find('"').unwrap_or(rest.len().min(200));
        let msg = &rest[..end];
        return Some(msg.chars().take(150).collect());
    }
    // Content might be an array with text blocks
    if let Some(pos) = line.find("\"text\":\"") {
        let start = pos + 8;
        let rest = &line[start..];
        let end = rest.find('"').unwrap_or(rest.len().min(200));
        let msg = &rest[..end];
        return Some(msg.chars().take(150).collect());
    }
    None
}

fn parse_session_file(path: &PathBuf) -> Option<SessionInfo> {
    let file = fs::File::open(path).ok()?;
    let file_size = file.metadata().ok()?.len();
    if file_size == 0 {
        return None;
    }

    let session_id = path.file_stem()?.to_str()?.to_string();

    let reader = BufReader::new(&file);
    let mut first_timestamp = String::new();
    let mut last_timestamp = String::new();
    let mut first_message = String::new();
    let mut message_count: usize = 0;

    for line in reader.lines().filter_map(|l| l.ok()) {
        if line.is_empty() {
            continue;
        }
        message_count += 1;

        if let Some(ts) = extract_json_field(&line, "timestamp") {
            if first_timestamp.is_empty() {
                first_timestamp = ts.clone();
            }
            last_timestamp = ts;
        }

        if first_message.is_empty() {
            if let Some(msg) = extract_first_user_message(&line) {
                first_message = msg;
            }
        }
    }

    if message_count == 0 {
        return None;
    }

    Some(SessionInfo {
        session_id,
        started_at: first_timestamp,
        last_activity: last_timestamp,
        message_count,
        first_message,
    })
}

pub fn list_all_sessions() -> Vec<ProjectSessions> {
    let projects_dir = get_claude_dir().join("projects");
    if !projects_dir.exists() {
        return vec![];
    }

    let mut all_projects: Vec<ProjectSessions> = Vec::new();

    if let Ok(entries) = fs::read_dir(&projects_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }

            let slug = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();

            // Skip hidden dirs
            if slug.starts_with('.') {
                continue;
            }

            let mut sessions: Vec<SessionInfo> = Vec::new();

            if let Ok(files) = fs::read_dir(&path) {
                for file in files.filter_map(|f| f.ok()) {
                    let file_path = file.path();
                    let name = file_path.file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("");

                    // Only .jsonl files, skip agent files
                    if !name.ends_with(".jsonl") || name.starts_with("agent-") {
                        continue;
                    }

                    if let Some(session) = parse_session_file(&file_path) {
                        sessions.push(session);
                    }
                }
            }

            if sessions.is_empty() {
                continue;
            }

            // Sort sessions by last_activity desc
            sessions.sort_by(|a, b| b.last_activity.cmp(&a.last_activity));

            all_projects.push(ProjectSessions {
                project_name: slug_to_project_name(&slug),
                project_slug: slug.clone(),
                sessions,
            });
        }
    }

    // Sort projects by most recent session
    all_projects.sort_by(|a, b| {
        let a_last = a.sessions.first().map(|s| &s.last_activity).cloned().unwrap_or_default();
        let b_last = b.sessions.first().map(|s| &s.last_activity).cloned().unwrap_or_default();
        b_last.cmp(&a_last)
    });

    all_projects
}
