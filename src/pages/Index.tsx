import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/types/analysis';
import { UrlInput } from '@/components/UrlInput';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url },
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
      toast.success(`Analysis complete! Found ${data.improvements?.length || 0} improvement suggestions.`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral via-electric to-sunny flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-fredoka font-bold">UX Analyzer</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 md:py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          {!analysisResult && !isLoading && (
            <div className="text-center mb-8 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-fredoka font-bold mb-4 bg-gradient-to-r from-coral via-electric to-sunny bg-clip-text text-transparent">
                Analyze Any Website
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Get AI-powered recommendations to improve visual design, usability, accessibility, and performance
              </p>
            </div>
          )}

          {/* URL Input */}
          {!analysisResult && (
            <UrlInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          )}

          {/* States */}
          {isLoading && <LoadingState />}
          
          {!isLoading && !analysisResult && <EmptyState />}
          
          {analysisResult && (
            <ResultsDashboard 
              result={analysisResult} 
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
