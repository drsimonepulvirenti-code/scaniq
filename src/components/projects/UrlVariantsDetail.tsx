import { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, RotateCcw, Download, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProjectUrl, UrlVariant } from '@/types/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface UrlVariantsDetailProps {
  urlId: string;
  projectName: string;
}

export const UrlVariantsDetail = ({ urlId, projectName }: UrlVariantsDetailProps) => {
  const { user } = useAuth();
  const [url, setUrl] = useState<ProjectUrl | null>(null);
  const [variants, setVariants] = useState<UrlVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user && urlId) {
      fetchData();
    }
  }, [user, urlId]);

  const fetchData = async () => {
    try {
      const [urlRes, variantsRes] = await Promise.all([
        supabase.from('project_urls').select('*').eq('id', urlId).single(),
        supabase.from('url_variants').select('*').eq('url_id', urlId).order('created_at', { ascending: false }),
      ]);

      if (urlRes.error) throw urlRes.error;
      setUrl(urlRes.data as ProjectUrl);
      setVariants((variantsRes.data || []) as UrlVariant[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('url_variants')
        .update({ status: 'approved' })
        .eq('id', variantId);

      if (error) throw error;
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, status: 'approved' } : v));
      toast.success('Variant approved');
    } catch (error) {
      console.error('Error approving variant:', error);
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('url_variants')
        .update({ status: 'rejected' })
        .eq('id', variantId);

      if (error) throw error;
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, status: 'rejected' } : v));
      toast.success('Variant rejected');
    } catch (error) {
      console.error('Error rejecting variant:', error);
      toast.error('Failed to reject');
    }
  };

  const handleApproveAll = async () => {
    const toApprove = selectedVariants.length > 0 
      ? selectedVariants 
      : variants.filter(v => v.status === 'pending').map(v => v.id);

    try {
      const { error } = await supabase
        .from('url_variants')
        .update({ status: 'approved' })
        .in('id', toApprove);

      if (error) throw error;
      setVariants(prev => prev.map(v => toApprove.includes(v.id) ? { ...v, status: 'approved' } : v));
      setSelectedVariants([]);
      toast.success(`${toApprove.length} variant(s) approved`);
    } catch (error) {
      console.error('Error approving variants:', error);
      toast.error('Failed to approve');
    }
  };

  const toggleVariantSelection = (variantId: string) => {
    setSelectedVariants(prev => 
      prev.includes(variantId) 
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  const filteredVariants = variants.filter(v => 
    activeTab === 'pending' ? v.status === 'pending' : v.status === 'approved'
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!url) {
    return <div className="text-center py-12 text-muted-foreground">URL not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* URL Preview Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            {new URL(url.url).hostname}
          </h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {url.url}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(url.url, '_blank')}>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </p>
        </div>
      </div>

      {/* URL Screenshot Preview */}
      {url.screenshot_url && (
        <div className="rounded-lg border overflow-hidden bg-muted">
          <img 
            src={url.screenshot_url} 
            alt="URL preview" 
            className="w-full max-h-64 object-cover object-top"
          />
        </div>
      )}

      {/* Variants Section */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pending">
                Pending approval
                <Badge variant="secondary" className="ml-2">
                  {variants.filter(v => v.status === 'pending').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved variants
                <Badge variant="secondary" className="ml-2">
                  {variants.filter(v => v.status === 'approved').length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </Button>
              <Button size="sm" onClick={handleApproveAll}>
                Approve all
              </Button>
            </div>
          </div>

          <TabsContent value="pending" className="mt-4">
            <VariantsTable 
              variants={filteredVariants}
              selectedVariants={selectedVariants}
              onToggleSelection={toggleVariantSelection}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            <VariantsTable 
              variants={filteredVariants}
              selectedVariants={selectedVariants}
              onToggleSelection={toggleVariantSelection}
              onApprove={handleApprove}
              onReject={handleReject}
              showActions={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface VariantsTableProps {
  variants: UrlVariant[];
  selectedVariants: string[];
  onToggleSelection: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  showActions?: boolean;
}

const VariantsTable = ({ 
  variants, 
  selectedVariants, 
  onToggleSelection, 
  onApprove, 
  onReject,
  showActions = true,
}: VariantsTableProps) => {
  if (variants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        <p>No variants in this category</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>Variants</TableHead>
            <TableHead>Frame</TableHead>
            <TableHead>What's different</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell>
                <Checkbox 
                  checked={selectedVariants.includes(variant.id)}
                  onCheckedChange={() => onToggleSelection(variant.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{variant.name}</TableCell>
              <TableCell>{variant.frame || 'Surface'}</TableCell>
              <TableCell className="max-w-md text-muted-foreground">
                {variant.description}
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onApprove(variant.id)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onReject(variant.id)}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
