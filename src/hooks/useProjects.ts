import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  primary_url: string | null;
  screenshot_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  url_count?: number;
}

export interface ProjectUrl {
  id: string;
  project_id: string;
  url: string;
  source: string;
  status: string;
  screenshot_url: string | null;
  scraped_data: Json | null;
  created_at: string;
  updated_at: string;
  variant_count?: number;
}

export interface UrlVariant {
  id: string;
  url_id: string;
  name: string;
  description: string | null;
  frame: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Get URL counts for each project
      const projectsWithCounts = await Promise.all(
        (data || []).map(async (project) => {
          const { count } = await supabase
            .from('project_urls')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);
          return { ...project, url_count: count || 0 };
        })
      );
      
      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, primaryUrl: string, screenshotUrl?: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
          primary_url: primaryUrl,
          screenshot_url: screenshotUrl || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Also create the primary URL in project_urls
      if (primaryUrl) {
        await supabase.from('project_urls').insert({
          project_id: data.id,
          user_id: user.id,
          url: primaryUrl,
          source: 'onboarding',
          status: 'active',
          screenshot_url: screenshotUrl || null,
        });
      }
      
      await fetchProjects();
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' });
      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      await fetchProjects();
      toast({ title: 'Success', description: 'Project deleted' });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return { projects, loading, fetchProjects, createProject, deleteProject };
};

export const useProjectUrls = (projectId: string | undefined) => {
  const { user } = useAuth();
  const [urls, setUrls] = useState<ProjectUrl[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUrls = async () => {
    if (!user || !projectId) return;
    
    try {
      setLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch URLs
      const { data, error } = await supabase
        .from('project_urls')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Get variant counts
      const urlsWithCounts = await Promise.all(
        (data || []).map(async (url) => {
          const { count } = await supabase
            .from('url_variants')
            .select('*', { count: 'exact', head: true })
            .eq('url_id', url.id);
          return { ...url, variant_count: count || 0 };
        })
      );
      
      setUrls(urlsWithCounts);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      toast({ title: 'Error', description: 'Failed to load URLs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addUrl = async (url: string, source: string = 'manual') => {
    if (!user || !projectId) return null;
    
    try {
      const { data, error } = await supabase
        .from('project_urls')
        .insert({
          project_id: projectId,
          user_id: user.id,
          url,
          source,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      await fetchUrls();
      toast({ title: 'Success', description: 'URL added successfully' });
      return data;
    } catch (error) {
      console.error('Error adding URL:', error);
      toast({ title: 'Error', description: 'Failed to add URL', variant: 'destructive' });
      return null;
    }
  };

  const deleteUrl = async (urlId: string) => {
    try {
      const { error } = await supabase
        .from('project_urls')
        .delete()
        .eq('id', urlId);

      if (error) throw error;
      await fetchUrls();
      toast({ title: 'Success', description: 'URL deleted' });
    } catch (error) {
      console.error('Error deleting URL:', error);
      toast({ title: 'Error', description: 'Failed to delete URL', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [user, projectId]);

  return { urls, project, loading, fetchUrls, addUrl, deleteUrl };
};

export const useUrlVariants = (urlId: string | undefined) => {
  const { user } = useAuth();
  const [variants, setVariants] = useState<UrlVariant[]>([]);
  const [urlData, setUrlData] = useState<ProjectUrl | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVariants = async () => {
    if (!user || !urlId) return;
    
    try {
      setLoading(true);
      
      // Fetch URL details
      const { data: urlDataResult, error: urlError } = await supabase
        .from('project_urls')
        .select('*')
        .eq('id', urlId)
        .single();

      if (urlError) throw urlError;
      setUrlData(urlDataResult);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', urlDataResult.project_id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch variants
      const { data, error } = await supabase
        .from('url_variants')
        .select('*')
        .eq('url_id', urlId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast({ title: 'Error', description: 'Failed to load variants', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateVariantStatus = async (variantId: string, status: 'approved' | 'pending' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('url_variants')
        .update({ status })
        .eq('id', variantId);

      if (error) throw error;
      await fetchVariants();
      toast({ title: 'Success', description: `Variant ${status}` });
    } catch (error) {
      console.error('Error updating variant:', error);
      toast({ title: 'Error', description: 'Failed to update variant', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [user, urlId]);

  return { variants, urlData, project, loading, fetchVariants, updateVariantStatus };
};
