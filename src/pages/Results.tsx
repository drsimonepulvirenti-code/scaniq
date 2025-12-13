import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/types/analysis';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { LoadingState } from '@/components/LoadingState';

export default function Results() {
  const { url } = useParams<{ url: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(
    location.state?.result || null
  );
  const [isLoading, setIsLoading] = useState(!location.state?.result);

  const decodedUrl = url ? decodeURIComponent(url) : '';

  useEffect(() => {
    // If we don't have a result from navigation state, fetch it
    if (!result && decodedUrl) {
      fetchAnalysis();
    }
  }, [decodedUrl]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url: decodedUrl }
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success(`Analysis complete! Found ${data.improvements?.length || 0} improvement suggestions.`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
      navigate('/scan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    navigate('/scan');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-12">
          <LoadingState />
        </div>
      </AppLayout>
    );
  }

  if (!result) {
    return (
      <AppLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">No analysis results found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <ResultsDashboard result={result} onReset={handleReset} />
      </div>
    </AppLayout>
  );
}
