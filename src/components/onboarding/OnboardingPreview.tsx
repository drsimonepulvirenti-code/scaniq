import { useState, useEffect } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { ScrapedData } from '@/types/onboarding';

interface OnboardingPreviewProps {
  url: string;
  scrapedData: ScrapedData | null;
  isScrapingComplete: boolean;
}

export const OnboardingPreview = ({
  url,
  scrapedData,
  isScrapingComplete,
}: OnboardingPreviewProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset loading state when URL changes
  useEffect(() => {
    if (url) {
      setIsImageLoading(true);
      setImageError(false);
    }
  }, [url]);

  const getScreenshotUrl = (targetUrl: string) => {
    // Use screenshot service for desktop preview
    const encodedUrl = encodeURIComponent(targetUrl);
    return `https://image.thum.io/get/width/1280/crop/800/noanimate/${encodedUrl}`;
  };

  if (!url) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Website Preview
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enter a URL to see a preview of your website here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Browser chrome */}
      <div className="bg-card rounded-t-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-brand-orange/60" />
            <div className="w-3 h-3 rounded-full bg-brand-green/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-background rounded-md px-3 py-1.5 text-sm text-muted-foreground truncate">
              {url}
            </div>
          </div>
        </div>

        {/* Preview content - Desktop screenshot */}
        <div className="relative bg-background" style={{ height: 'calc(100vh - 220px)' }}>
          {/* Show loading state while fetching screenshot */}
          {(isImageLoading || !url) && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {url ? 'Generating desktop preview...' : 'Waiting for URL...'}
                </p>
              </div>
            </div>
          )}
          
          {/* Screenshot image - starts loading as soon as URL is available */}
          {url && (
            <img
              src={getScreenshotUrl(url)}
              alt="Website desktop preview"
              className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
                isImageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setImageError(true);
              }}
            />
          )}
          
          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Could not load preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Summary */}
      {scrapedData && isScrapingComplete && (
        <div className="mt-4 p-4 bg-card rounded-xl border border-border">
          <h4 className="font-medium text-foreground mb-2">AI Summary</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {scrapedData.summary || scrapedData.description || 'No summary available'}
          </p>
          
          {scrapedData.targetAudience && scrapedData.targetAudience.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Detected Audience</p>
              <div className="flex flex-wrap gap-1.5">
                {scrapedData.targetAudience.slice(0, 3).map((audience, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
