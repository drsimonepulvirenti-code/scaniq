export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  primary_url: string | null;
  screenshot_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectUrl {
  id: string;
  project_id: string;
  user_id: string;
  url: string;
  source: 'onboarding' | 'manual' | 'generated';
  status: 'not_run' | 'processing' | 'ready' | 'error';
  screenshot_url: string | null;
  scraped_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface UrlVariant {
  id: string;
  url_id: string;
  user_id: string;
  name: string;
  frame: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}
