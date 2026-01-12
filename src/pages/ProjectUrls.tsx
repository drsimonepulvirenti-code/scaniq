import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjectUrls } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { ProjectBreadcrumb } from '@/components/projects/ProjectBreadcrumb';
import { AddUrlDialog } from '@/components/projects/AddUrlDialog';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Loader2, ExternalLink, MoreVertical, Trash2, Eye, Link2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ProjectUrls = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { urls, project, loading, addUrl, deleteUrl } = useProjectUrls(projectId);
  const [currentView, setCurrentView] = useState<'projects' | 'journeys' | 'experiments' | 'intelligence'>('projects');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-brand-green/10 text-brand-green border-brand-green/30">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
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
              <ProjectBreadcrumb projectId={projectId} projectName={project.name} />
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add URL
            </Button>
          </header>

          <main className="p-6">
            {urls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Link2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No URLs yet</h2>
                <p className="text-muted-foreground mb-6">
                  Add URLs to this project to start analyzing
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add URL
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {urls.map((urlItem) => (
                      <TableRow key={urlItem.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Link 
                            to={`/projects/${projectId}/urls/${urlItem.id}`}
                            className="text-primary hover:underline flex items-center gap-2"
                          >
                            <span className="truncate max-w-[300px]">{urlItem.url}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="capitalize">{urlItem.source}</TableCell>
                        <TableCell>{getStatusBadge(urlItem.status)}</TableCell>
                        <TableCell>{urlItem.variant_count || 0}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(urlItem.updated_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/projects/${projectId}/urls/${urlItem.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={urlItem.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open URL
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteUrl(urlItem.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      <AddUrlDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={addUrl}
      />
    </SidebarProvider>
  );
};

export default ProjectUrls;
