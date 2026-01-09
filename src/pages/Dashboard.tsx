import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Upload, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/types/projects';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ProjectsGrid } from '@/components/projects/ProjectsGrid';
import { ProjectUrlsTable } from '@/components/projects/ProjectUrlsTable';
import { UrlVariantsDetail } from '@/components/projects/UrlVariantsDetail';
import { ProjectBreadcrumb } from '@/components/projects/ProjectBreadcrumb';
import { Button } from '@/components/ui/button';
import { KnowledgeBase } from '@/components/dashboard/KnowledgeBase';
import { Experiments } from '@/components/dashboard/Experiments';
import { toast } from 'sonner';

type ViewType = 'projects' | 'journeys' | 'experiments' | 'intelligence';

interface NavigationState {
  level: 1 | 2 | 3;
  projectId?: string;
  projectName?: string;
  urlId?: string;
  urlName?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('projects');
  const [navigation, setNavigation] = useState<NavigationState>({ level: 1 });
=======
  const [currentView, setCurrentView] = useState<ViewType>('projects');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [balloons, setBalloons] = useState<CommentBalloon[]>([]);
>>>>>>> 94d842d (WIP: staged changes before pull)

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

<<<<<<< HEAD
  // Handle project card click -> go to Level 2
  const handleProjectClick = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      setNavigation({
        level: 2,
        projectId,
        projectName: data.name,
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to open project');
    }
  };

  // Handle URL row click -> go to Level 3
  const handleUrlClick = async (urlId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_urls')
        .select('url')
        .eq('id', urlId)
        .single();

      if (error) throw error;

      setNavigation(prev => ({
        ...prev,
        level: 3,
        urlId,
        urlName: new URL(data.url).hostname,
      }));
    } catch (error) {
      console.error('Error fetching URL:', error);
      toast.error('Failed to open URL');
    }
  };

  // Build breadcrumb items based on current level
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'My Projects', onClick: () => setNavigation({ level: 1 }) },
=======
  const generateInsights = (data: OnboardingData) => {
    // Generate agent-specific insights based on selected agents
    const agentInsights: AgentInsight[] = [];
    const positions = [
      { x: 15, y: 10 },
      { x: 75, y: 25 },
      { x: 50, y: 60 },
      { x: 25, y: 80 },
      { x: 80, y: 70 },
>>>>>>> 94d842d (WIP: staged changes before pull)
    ];

    if (navigation.level >= 2 && navigation.projectName) {
      items.push({
        label: navigation.projectName,
        onClick: () => setNavigation({
          level: 2,
          projectId: navigation.projectId,
          projectName: navigation.projectName,
        }),
      });
    }

    if (navigation.level === 3 && navigation.urlName) {
      items.push({
        label: 'Generated Variants',
        onClick: undefined,
      });
    }

    return items;
  };

  // Get page title based on current level
  const getPageTitle = () => {
    if (currentView !== 'projects') {
      return currentView === 'intelligence' 
        ? 'Intelligence' 
        : currentView.charAt(0).toUpperCase() + currentView.slice(1);
    }
    switch (navigation.level) {
      case 1:
        return 'My Projects';
      case 2:
        return navigation.projectName || 'Project';
      case 3:
        return 'Generated Variants';
      default:
        return 'My Projects';
    }
  };

  // Get page subtitle
  const getPageSubtitle = () => {
    switch (navigation.level) {
      case 1:
        return 'Customize your AI agent\'s design to reflect your brand identity';
      case 2:
        return 'Manage URLs and view generated variants';
      case 3:
        return 'Review and approve generated variants';
      default:
        return '';
    }
  };

  const renderProjectsContent = () => {
    switch (navigation.level) {
      case 1:
        return <ProjectsGrid onProjectClick={handleProjectClick} />;
      case 2:
        return (
          <ProjectUrlsTable 
            projectId={navigation.projectId!} 
            onUrlClick={handleUrlClick}
          />
        );
      case 3:
        return (
          <UrlVariantsDetail 
            urlId={navigation.urlId!}
            projectName={navigation.projectName || ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar
          currentView={currentView}
<<<<<<< HEAD
          onViewChange={(view) => {
            setCurrentView(view);
            if (view === 'projects') {
              setNavigation({ level: 1 });
            }
          }}
=======
          onViewChange={setCurrentView}
>>>>>>> 94d842d (WIP: staged changes before pull)
        />
        <SidebarInset className="flex-1">
          <header className="h-14 flex items-center justify-between border-b border-border/40 px-4 sticky top-0 bg-background/95 backdrop-blur z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              {currentView === 'projects' && navigation.level > 1 ? (
                <ProjectBreadcrumb items={getBreadcrumbItems()} />
              ) : (
                <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
              )}
            </div>

            {currentView === 'projects' && navigation.level === 1 && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Filter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Upload className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            )}
          </header>

          <main className="flex-1 p-6">
            {currentView === 'projects' && navigation.level === 1 && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
                <p className="text-muted-foreground">{getPageSubtitle()}</p>
              </div>
            )}

            {currentView === 'intelligence' ? (
              <KnowledgeBase />
            ) : currentView === 'experiments' ? (
              <Experiments />
            ) : (
              renderProjectsContent()
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
