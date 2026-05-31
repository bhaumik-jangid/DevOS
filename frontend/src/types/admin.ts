export interface ProjectRow {
  id: number
  name: string
  slug: string
  description: string
  status: string
  stack_tags: string[]
  hosting_provider: string
  github_url: string
  live_url: string
  is_featured: boolean
  is_public: boolean
}

export interface DeploymentRow {
  id: number
  project_name: string
  status: string
  source: string
  branch: string
  commit_hash: string
  commit_message: string
  triggered_by: string
  started_at: string
  finished_at: string | null
  duration_display: string | null
  error_message: string
  deployment_url: string
}

export interface DeploymentStats {
  total: number
  by_status: Record<string, number>
  recent_failed: DeploymentRow[]
}

export interface MonitoringStatus {
  project_id: number
  project_name: string
  project_slug: string
  has_health_endpoint: boolean
  uptime_percent: number | null
  open_incident: IncidentRow | null
  latest_check: HealthCheckRow | null
}

export interface HealthCheckRow {
  status: string
  status_code: number | null
  latency_ms: number | null
  is_healthy: boolean
  checked_at: string
  error_message: string
}

export interface IncidentRow {
  id: number
  project_name: string
  started_at: string
  resolved_at: string | null
  severity: string
  description: string
  is_resolved: boolean
  duration_minutes: number | null
}

export interface AlertRow {
  id: number
  channel: string
  alert_type: string
  status: string
  subject: string
  message: string
  project_name: string | null
  sent_at: string | null
  created_at: string
  error_message: string
}

export interface SkillRow {
  id: number
  name: string
  category: string
  proficiency: number
  order: number
}

export interface ExperienceRow {
  id: number
  role: string
  company: string
  start_date: string
  end_date: string | null
  is_current: boolean
  description: string
}
