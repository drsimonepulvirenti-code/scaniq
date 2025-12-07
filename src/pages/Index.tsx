import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { AnalysisResult } from '@/types/analysis';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { UrlInput } from '@/components/UrlInput';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { toast } = useToast();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState('');

  useEffect(() => {
    setHasApiKey(FirecrawlService.hasApiKey());
  }, []);

  const handleApiKeySet = () => {
    setHasApiKey(true);
    setShowApiKeyInput(false);
    toast({
      title: "API key saved!",
      description: "You're ready to analyze websites.",
    });
  };

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setAnalyzedUrl(url);

    try {
      // Step 1: Fetch website content with Firecrawl
      const scrapeResult = await FirecrawlService.scrapeUrl(url);
      
      if (!scrapeResult.success) {
        throw new Error(scrapeResult.error || 'Failed to fetch website');
      }

      // Step 2: Send to AI for analysis
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { 
          websiteContent: scrapeResult.data.markdown,
          url 
        },
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
      toast({
        title: "Analysis complete!",
        description: `Found ${data.improvements?.length || 0} improvement suggestions.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setAnalyzedUrl('');
  };

  const showSetup = !hasApiKey || showApiKeyInput;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral via-electric to-sunny flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-fredoka font-bold">UX Analyzer</h1>
          </div>
          
          {hasApiKey && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowApiKeyInput(true)}
              className="rounded-xl"
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 md:py-12">
        {showSetup ? (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-fredoka font-bold mb-4 bg-gradient-to-r from-coral via-electric to-sunny bg-clip-text text-transparent">
                Welcome to UX Analyzer
              </h2>
              <p className="text-muted-foreground text-lg">
                Get AI-powered UX/UI improvement suggestions for any website
              </p>
            </div>
            <ApiKeyInput onApiKeySet={handleApiKeySet} />
          </div>
        ) : (
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
                url={analyzedUrl}
                onReset={handleReset}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
