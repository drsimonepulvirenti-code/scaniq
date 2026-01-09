-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  primary_url TEXT,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_urls table
CREATE TABLE public.project_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual', -- onboarding, manual, generated
  status TEXT NOT NULL DEFAULT 'not_run', -- not_run, processing, ready, error
  screenshot_url TEXT,
  scraped_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create url_variants table for Level 3
CREATE TABLE public.url_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url_id UUID NOT NULL REFERENCES public.project_urls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  frame TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_variants ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Project URLs policies
CREATE POLICY "Users can view their own project urls" ON public.project_urls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own project urls" ON public.project_urls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own project urls" ON public.project_urls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own project urls" ON public.project_urls FOR DELETE USING (auth.uid() = user_id);

-- URL Variants policies
CREATE POLICY "Users can view their own url variants" ON public.url_variants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own url variants" ON public.url_variants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own url variants" ON public.url_variants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own url variants" ON public.url_variants FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();
CREATE TRIGGER update_project_urls_updated_at BEFORE UPDATE ON public.project_urls FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();
CREATE TRIGGER update_url_variants_updated_at BEFORE UPDATE ON public.url_variants FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();