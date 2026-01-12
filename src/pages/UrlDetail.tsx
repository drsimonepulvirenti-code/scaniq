import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUrlVariants } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { ProjectBreadcrumb } from '@/components/projects/ProjectBreadcrumb';
import { VariantTabs } from '@/components/projects/VariantTabs';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardPreview } from '@/components/dashboard/DashboardPreview';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ExternalLink } from 'lucide-react';
import { CommentBalloon } from '@/types/onboarding';

const UrlDetail = () => {
  const { projectId, urlId } = useParams<{ projectId: string; urlId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { variants, urlData, project, loading, updateVariantStatus } = useUrlVariants(urlId);
  const [currentView, setCurrentView] = useState<'projects' | 'journeys' | 'experiments' | 'intelligence'>('projects');
  const [selectedBalloon, setSelectedBalloon] = useState<string | null>(null);

  // Mock balloons for demo (in real app, these would come from analysis)
  const [balloons] = useState<CommentBalloon[]>([]);

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

  const handleApprove = (variantId: string) => {
    updateVariantStatus(variantId, 'approved');
  };

  const handleReject = (variantId: string) => {
    updateVariantStatus(variantId, 'rejected');
  };

  const handleExportCSV = () => {
    const csvData = variants.map(v => ({
      name: v.name,
      status: v.status,
      description: v.description || '',
      created_at: v.created_at,
    }));

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `variants-${urlId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!urlData || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">URL not found</h2>
          <Button onClick={() => navigate('/projects')}>Go to Projects</Button>
        </div>
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
              <ProjectBreadcrumb 
                projectId={projectId} 
                projectName={project.name}
                urlId={urlId}
                urlName={urlData.url}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={urlData.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open URL
                </a>
              </Button>
              {variants.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </header>

          <main className="flex-1 flex">
            {/* Main viewport with preview */}
            <div className="flex-1 p-6">
              <DashboardPreview
                url={urlData.url}
                balloons={balloons}
                selectedBalloon={selectedBalloon}
                onBalloonClick={setSelectedBalloon}
              />
            </div>

            {/* Variants panel */}
            <div className="w-[400px] border-l border-border p-6 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Variants</h2>
              <VariantTabs
                variants={variants}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UrlDetail;
