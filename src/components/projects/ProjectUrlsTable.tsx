import { useEffect, useState } from 'react';
import { Plus, ExternalLink, Eye, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProjectUrl } from '@/types/projects';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ProjectUrlsTableProps {
  projectId: string;
  onUrlClick: (urlId: string) => void;
}

export const ProjectUrlsTable = ({ projectId, onUrlClick }: ProjectUrlsTableProps) => {
  const { user } = useAuth();
  const [urls, setUrls] = useState<ProjectUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user && projectId) {
      fetchUrls();
    }
  }, [user, projectId]);

  const fetchUrls = async () => {
    try {
      const { data, error } = await supabase
        .from('project_urls')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUrls((data || []) as ProjectUrl[]);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      toast.error('Failed to load URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim() || !user) return;

    setAdding(true);
    try {
      let formattedUrl = newUrl.trim();
      if (!formattedUrl.startsWith('http')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      const { data, error } = await supabase
        .from('project_urls')
        .insert({
          project_id: projectId,
          user_id: user.id,
          url: formattedUrl,
          source: 'manual',
          status: 'not_run',
        })
        .select()
        .single();

      if (error) throw error;
      setUrls(prev => [data as ProjectUrl, ...prev]);
      setNewUrl('');
      setAddDialogOpen(false);
      toast.success('URL added');
    } catch (error) {
      console.error('Error adding URL:', error);
      toast.error('Failed to add URL');
    } finally {
      setAdding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      not_run: 'outline',
      processing: 'secondary',
      ready: 'default',
      error: 'destructive',
    };
    const labels: Record<string, string> = {
      not_run: 'Not run',
      processing: 'Processing',
      ready: 'Ready',
      error: 'Error',
    };
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const getSourceBadge = (source: string) => {
    const labels: Record<string, string> = {
      onboarding: 'Onboarding',
      manual: 'Manual',
      generated: 'Generated',
    };
    return <Badge variant="outline">{labels[source] || source}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {urls.length} URL{urls.length !== 1 ? 's' : ''} in this project
        </p>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add URL
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add URL to Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUrl} disabled={adding || !newUrl.trim()}>
                  {adding ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {urls.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No URLs yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {urls.map((url) => (
                <TableRow 
                  key={url.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onUrlClick(url.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-md">{url.url}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getSourceBadge(url.source)}</TableCell>
                  <TableCell>{getStatusBadge(url.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(url.updated_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => window.open(url.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
