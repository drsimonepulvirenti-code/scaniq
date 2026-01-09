import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, FileText, Play, Layout } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/types/projects';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ProjectsGridProps {
  onProjectClick: (projectId: string) => void;
}

export const ProjectsGrid = ({ onProjectClick }: ProjectsGridProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/onboarding');
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Project deleted');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Create new project card */}
      <Card 
        className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer transition-colors group"
        onClick={handleCreateProject}
      >
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground group-hover:text-primary transition-colors">
          <Plus className="w-12 h-12 mb-3" />
          <p className="font-medium">New Project</p>
        </CardContent>
      </Card>

      {/* Project cards */}
      {projects.map((project) => (
        <Card 
          key={project.id}
          className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onProjectClick(project.id)}
        >
          <div className="relative">
            {/* Screenshot preview or placeholder */}
            <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
              {project.screenshot_url ? (
                <img 
                  src={project.screenshot_url} 
                  alt={project.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <Layout className="w-12 h-12 text-muted-foreground/50" />
              )}
            </div>
            
            {/* Menu button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold truncate">{project.name}</h3>
            {project.primary_url && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {project.primary_url}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
