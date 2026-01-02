import { useState, useEffect } from 'react';
import { Loader2, Check, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrapedData } from '@/types/onboarding';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingStep0Props {
  url: string;
  onUrlSubmit: (url: string) => void;
  onScrapingComplete: (data: ScrapedData) => void;
  isComplete: boolean;
}

export const OnboardingStep0 = ({
  url,
  onUrlSubmit,
  onScrapingComplete,
  isComplete,
}: OnboardingStep0Props) => {
  const [inputUrl, setInputUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (url && !isComplete) {
      handleScrape();
    }
  }, []);

  const formatUrl = (input: string): string => {
    let formatted = input.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `https://${formatted}`;
    }
    return formatted;
  };

  const handleScrape = async () => {
    const formattedUrl = formatUrl(inputUrl);
    onUrlSubmit(formattedUrl);
    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-website', {
        body: { url: formattedUrl },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      const scrapedData: ScrapedData = {
        url: formattedUrl,
        title: data.title || 'Untitled Page',
        description: data.description || '',
        summary: data.summary || '',
        targetAudience: data.targetAudience || [],
        suggestedObjectives: data.suggestedObjectives || [],
        screenshot: data.screenshot,
        markdown: data.markdown,
      };

      onScrapingComplete(scrapedData);
      toast.success('Website analyzed successfully!');
    } catch (error) {
      console.error('Scraping error:', error);
      toast.error('Failed to analyze website. Please try again.');
      clearInterval(progressInterval);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Add your website
        </h2>
        <p className="text-muted-foreground">
          Enter your website URL and our AI will analyze it to extract insights about your business.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com"
              className="pl-10 h-12"
              disabled={isLoading || isComplete}
            />
          </div>
          <Button
            onClick={handleScrape}
            disabled={!inputUrl || isLoading || isComplete}
            className="h-12 px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : isComplete ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Analyzed
              </>
            ) : (
              'Analyze'
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {progress < 30
                ? 'Fetching website content...'
                : progress < 60
                ? 'Extracting key information...'
                : progress < 90
                ? 'Analyzing with AI...'
                : 'Finalizing analysis...'}
            </p>
          </div>
        )}

        {isComplete && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Check className="w-5 h-5" />
              <span className="font-medium">Analysis Complete</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your website has been analyzed. Click "Continue" to review the extracted information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
