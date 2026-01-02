import { Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrapedData } from '@/types/onboarding';

interface OnboardingStep1Props {
  context: string;
  onContextChange: (context: string) => void;
  scrapedData: ScrapedData | null;
}

export const OnboardingStep1 = ({
  context,
  onContextChange,
  scrapedData,
}: OnboardingStep1Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Tell us about your page
        </h2>
        <p className="text-muted-foreground">
          Review and edit the AI-generated summary to ensure we understand your business correctly.
        </p>
      </div>

      {scrapedData && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Detected Information</span>
          </div>
          <div className="space-y-2 text-sm">
            {scrapedData.title && (
              <p>
                <span className="text-muted-foreground">Title:</span>{' '}
                <span className="text-foreground">{scrapedData.title}</span>
              </p>
            )}
            {scrapedData.description && (
              <p>
                <span className="text-muted-foreground">Description:</span>{' '}
                <span className="text-foreground">{scrapedData.description}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          What's your page about?
        </label>
        <Textarea
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder="Describe your page, what it offers, and what makes it unique..."
          className="min-h-[200px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          This helps our AI agents provide more relevant and personalized recommendations.
        </p>
      </div>
    </div>
  );
};
