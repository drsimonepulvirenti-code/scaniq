import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Github, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PreviewStatus = 'idle' | 'loading' | 'building' | 'ready' | 'error';

const Preview = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<PreviewStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const parseGitHubUrl = (url: string): { owner: string; repo: string; branch?: string } | null => {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/tree\/([^\/]+))?$/,
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', ''),
          branch: match[3],
        };
      }
    }
    return null;
  };

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a GitHub repository URL',
        variant: 'destructive',
      });
      return;
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)',
        variant: 'destructive',
      });
      return;
    }

    setStatus('loading');
    setErrorMessage(null);
    setPreviewUrl(null);

    try {
      // Check if repo exists and is public
      const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or is private. Only public repositories are supported.');
        }
        throw new Error('Failed to fetch repository information');
      }

      const repoData = await response.json();
      
      if (repoData.private) {
        throw new Error('Private repositories are not supported. Please use a public repository.');
      }

      setStatus('building');
      
      // Generate StackBlitz URL for the repository
      // StackBlitz supports direct GitHub import
      const branch = parsed.branch || repoData.default_branch || 'main';
      const stackblitzUrl = `https://stackblitz.com/github/${parsed.owner}/${parsed.repo}/tree/${branch}?embed=1&file=README.md&hideNavigation=1&view=preview`;
      
      // Small delay to show building state
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPreviewUrl(stackblitzUrl);
      setStatus('ready');
      
      toast({
        title: 'Preview Ready',
        description: `Successfully loaded ${parsed.owner}/${parsed.repo}`,
      });
    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Failed to import repository';
      setErrorMessage(message);
      toast({
        title: 'Import Failed',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setRepoUrl('');
    setPreviewUrl(null);
    setStatus('idle');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">GitHub Preview</h1>
          <p className="text-muted-foreground">
            Import a public GitHub repository and view a live preview directly in your browser.
          </p>
        </div>

        {/* Import Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Import Repository
            </CardTitle>
            <CardDescription>
              Enter a public GitHub repository URL to generate a live preview. Supports React, Vite, and Next.js projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={status === 'loading' || status === 'building'}
                  onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={status === 'loading' || status === 'building'}
                  className="min-w-[140px]"
                >
                  {status === 'loading' && (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  )}
                  {status === 'building' && (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Building...
                    </>
                  )}
                  {(status === 'idle' || status === 'ready' || status === 'error') && (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Import & Preview
                    </>
                  )}
                </Button>
                {(status === 'ready' || status === 'error') && (
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {errorMessage && (
              <p className="mt-3 text-sm text-destructive">{errorMessage}</p>
            )}
            
            <p className="mt-3 text-xs text-muted-foreground">
              Example: https://github.com/vitejs/vite-plugin-react
            </p>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle>Live Preview</CardTitle>
            {previewUrl && (
              <CardDescription className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Preview is running
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {status === 'idle' && (
              <div className="flex items-center justify-center h-[600px] bg-muted/30">
                <div className="text-center text-muted-foreground">
                  <Github className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No preview loaded</p>
                  <p className="text-sm">Enter a GitHub URL above to get started</p>
                </div>
              </div>
            )}
            
            {(status === 'loading' || status === 'building') && (
              <div className="flex items-center justify-center h-[600px] bg-muted/30">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-lg font-medium text-foreground">
                    {status === 'loading' ? 'Fetching repository...' : 'Building preview...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {status === 'building' && 'This may take a moment for larger projects'}
                  </p>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex items-center justify-center h-[600px] bg-muted/30">
                <div className="text-center text-destructive">
                  <p className="text-lg font-medium">Failed to load preview</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            )}
            
            {status === 'ready' && previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-[600px] border-0"
                title="GitHub Repository Preview"
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Preview;
