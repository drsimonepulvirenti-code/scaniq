import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OnboardingData, AgentInsight, CommentBalloon } from '@/types/onboarding';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardPreview } from '@/components/dashboard/DashboardPreview';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { KnowledgeBase } from '@/components/dashboard/KnowledgeBase';
import { Experiments } from '@/components/dashboard/Experiments';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

type ViewType = 'projects' | 'journeys' | 'experiments' | 'intelligence';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as ViewType | null;
  const [currentView, setCurrentView] = useState<ViewType>(
    (viewParam && ['projects', 'journeys', 'experiments', 'intelligence'].includes(viewParam))
      ? viewParam
      : 'projects'
  );
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [balloons, setBalloons] = useState<CommentBalloon[]>([]);

  useEffect(() => {
    // Load onboarding data from localStorage
    const storedData = localStorage.getItem('onboardingData');
    if (storedData) {
      const data = JSON.parse(storedData) as OnboardingData;
      setOnboardingData(data);
      generateInsights(data);
    } else {
      // Redirect to onboarding if no data
      navigate('/onboarding');
    }
  }, [navigate]);

  // Sync view with URL parameter
  useEffect(() => {
    const viewParam = searchParams.get('view') as ViewType | null;
    if (viewParam && ['projects', 'journeys', 'experiments', 'intelligence'].includes(viewParam)) {
      setCurrentView(viewParam);
    }
  }, [searchParams]);

  // Update URL when view changes
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    navigate(`/dashboard?view=${view}`, { replace: true });
  };

  const generateInsights = (data: OnboardingData) => {
    // Generate agent-specific insights based on selected agents
    const agentInsights: AgentInsight[] = [];
    const positions = [
      { x: 15, y: 10 },
      { x: 75, y: 25 },
      { x: 50, y: 60 },
      { x: 25, y: 80 },
      { x: 80, y: 70 },
    ];

    if (data.selectedAgents.includes('ui-designer')) {
      agentInsights.push({
        id: 'ui-1',
        agentId: 'ui-designer',
        agentName: 'UI Designer',
        agentIcon: 'Palette',
        title: 'Improve Visual Hierarchy',
        description: 'The primary CTA button could benefit from higher contrast and more visual weight to stand out from secondary elements.',
        priority: 'high',
        position: positions[0],
      });
    }

    if (data.selectedAgents.includes('ux-designer')) {
      agentInsights.push({
        id: 'ux-1',
        agentId: 'ux-designer',
        agentName: 'UX Designer',
        agentIcon: 'MousePointer',
        title: 'Simplify Navigation',
        description: 'Consider reducing the number of navigation items. Users may experience decision fatigue with too many options.',
        priority: 'high',
        position: positions[1],
      });
    }

    if (data.selectedAgents.includes('seo-specialist')) {
      agentInsights.push({
        id: 'seo-1',
        agentId: 'seo-specialist',
        agentName: 'SEO Specialist',
        agentIcon: 'Search',
        title: 'Optimize Meta Description',
        description: 'The meta description is missing key terms. Add your primary keyword within the first 120 characters.',
        priority: 'medium',
        position: positions[2],
      });
    }

    if (data.selectedAgents.includes('accessibility-expert')) {
      agentInsights.push({
        id: 'a11y-1',
        agentId: 'accessibility-expert',
        agentName: 'Accessibility Expert',
        agentIcon: 'Accessibility',
        title: 'Improve Color Contrast',
        description: 'Some text elements do not meet WCAG AA standards. Increase contrast ratio to at least 4.5:1.',
        priority: 'high',
        position: positions[3],
      });
    }

    if (data.selectedAgents.includes('performance-engineer')) {
      agentInsights.push({
        id: 'perf-1',
        agentId: 'performance-engineer',
        agentName: 'Performance Engineer',
        agentIcon: 'Zap',
        title: 'Optimize Images',
        description: 'Large unoptimized images are increasing load time. Use WebP format and implement lazy loading.',
        priority: 'medium',
        position: positions[4],
      });
    }

    setInsights(agentInsights);

    // Create balloons from insights
    const newBalloons: CommentBalloon[] = agentInsights.map(insight => ({
      id: insight.id,
      x: insight.position?.x || 50,
      y: insight.position?.y || 50,
      agentId: insight.agentId,
      agentName: insight.agentName,
      title: insight.title,
      content: insight.description,
      priority: insight.priority,
    }));

    setBalloons(newBalloons);
  };

  const handleInsightClick = (insightId: string) => {
    setSelectedInsight(selectedInsight === insightId ? null : insightId);
  };

  const handleBalloonClick = (balloonId: string) => {
    setSelectedInsight(selectedInsight === balloonId ? null : balloonId);
  };

  if (!onboardingData) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar
          currentView={currentView}
          onViewChange={handleViewChange}
        />
        <SidebarInset className="flex-1">
          <header className="h-14 flex items-center border-b border-border/40 px-4 sticky top-0 bg-background/95 backdrop-blur z-40">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold">
              {currentView === 'projects' ? 'My Projects' : 
               currentView === 'intelligence' ? 'Intelligence' : 
               currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h1>
          </header>

          <main className="flex-1 flex">
            {currentView === 'intelligence' ? (
              <KnowledgeBase />
            ) : currentView === 'experiments' ? (
              <Experiments />
            ) : (
              <>
                {/* Main viewport with preview */}
                <div className="flex-1 p-6">
                  <DashboardPreview
                    url={onboardingData.url}
                    balloons={balloons}
                    selectedBalloon={selectedInsight}
                    onBalloonClick={handleBalloonClick}
                  />
                </div>

                {/* Summary panel */}
                <div className="w-96 border-l border-border">
                  <DashboardSummary
                    onboardingData={onboardingData}
                    insights={insights}
                    selectedInsight={selectedInsight}
                    onInsightClick={handleInsightClick}
                  />
                </div>
              </>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
