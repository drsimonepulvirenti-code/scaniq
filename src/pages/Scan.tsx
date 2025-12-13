import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layouts/AppLayout';
import { UrlInput } from '@/components/UrlInput';
import { Search } from 'lucide-react';

export default function Scan() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const initialUrl = location.state?.url || '';

  useEffect(() => {
    // Auto-analyze if URL was passed from landing page
    if (initialUrl) {
      handleAnalyze(initialUrl);
    }
  }, []);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url }
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Analysis complete! Found ${data.improvements?.length || 0} improvement suggestions.`);
      
      // Navigate to results with encoded URL
      const encodedUrl = encodeURIComponent(url);
      navigate(`/results/${encodedUrl}`, { state: { result: data } });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Analyze a Website</h1>
          <p className="text-muted-foreground mb-8">
            Enter the URL of the website you want to analyze. Our AI will scan it and provide detailed UX/UI improvement suggestions.
          </p>

          <UrlInput onAnalyze={handleAnalyze} isLoading={isLoading} />

          {isLoading && (
            <div className="mt-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Analyzing website...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
