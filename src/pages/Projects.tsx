import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectBreadcrumb } from '@/components/projects/ProjectBreadcrumb';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

const Projects = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { projects, loading, deleteProject } = useProjects();
  const [currentView, setCurrentView] = useState<'projects' | 'journeys' | 'experiments' | 'intelligence'>('projects');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleViewChange = (view: 'projects' | 'journeys' | 'experiments' | 'intelligence') => {
    setCurrentView(view);
    if (view !== 'projects') {
      navigate('/dashboard');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar currentView={currentView} onViewChange={handleViewChange} />
        <SidebarInset className="flex-1">
          <header className="h-14 flex items-center justify-between border-b border-border/40 px-4 sticky top-0 bg-background/95 backdrop-blur z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <ProjectBreadcrumb />
            </div>
            <Button onClick={() => navigate('/onboarding')}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </header>

          <main className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FolderOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create your first project to get started
                </p>
                <Button onClick={() => navigate('/onboarding')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={deleteProject}
                  />
                ))}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Projects;
