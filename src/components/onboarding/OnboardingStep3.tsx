import { useState, useEffect } from 'react';
import { Target, TrendingUp, Users, DollarSign, Clock, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrapedData, Objective } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep3Props {
  selectedObjectives: string[];
  onObjectiveToggle: (objectiveId: string) => void;
  selectedPersonas: string[];
  scrapedData: ScrapedData | null;
}

const defaultObjectives: Objective[] = [
  { id: 'increase-signups', name: 'Increase Sign-ups', description: 'Convert more visitors into registered users', category: 'conversion' },
  { id: 'reduce-bounce', name: 'Reduce Bounce Rate', description: 'Keep visitors engaged longer on your site', category: 'engagement' },
  { id: 'improve-ctr', name: 'Improve Click-Through Rate', description: 'Get more clicks on your CTAs', category: 'conversion' },
  { id: 'increase-time', name: 'Increase Time on Page', description: 'Keep users engaged with your content', category: 'engagement' },
  { id: 'boost-conversions', name: 'Boost Conversions', description: 'Turn visitors into paying customers', category: 'revenue' },
  { id: 'improve-retention', name: 'Improve Retention', description: 'Keep users coming back', category: 'engagement' },
];

const iconMap: Record<string, React.ElementType> = {
  conversion: TrendingUp,
  engagement: Users,
  revenue: DollarSign,
  performance: Clock,
};

export const OnboardingStep3 = ({
  selectedObjectives,
  onObjectiveToggle,
  selectedPersonas,
  scrapedData,
}: OnboardingStep3Props) => {
  const [aiObjectives, setAiObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scrapedData && selectedPersonas.length > 0) {
      generateAiObjectives();
    }
  }, [scrapedData, selectedPersonas]);

  const generateAiObjectives = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-objectives', {
        body: {
          context: scrapedData?.summary,
          personas: selectedPersonas,
          url: scrapedData?.url,
        },
      });

      if (error) throw error;

      if (data?.objectives) {
        setAiObjectives(data.objectives);
      }
    } catch (error) {
      console.error('Error generating objectives:', error);
      // Fall back to default objectives
      setAiObjectives([]);
    } finally {
      setIsLoading(false);
    }
  };

  const allObjectives = [...aiObjectives, ...defaultObjectives];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Set your objectives
        </h2>
        <p className="text-muted-foreground">
          Based on your customers, we've suggested some goals. Select what matters most.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-primary">Generating personalized objectives...</span>
        </div>
      )}

      {aiObjectives.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Suggested Objectives</span>
          </div>
          <div className="grid gap-3">
            {aiObjectives.map((objective) => {
              const Icon = iconMap[objective.category] || Target;
              const isSelected = selectedObjectives.includes(objective.id);

              return (
                <Card
                  key={objective.id}
                  onClick={() => onObjectiveToggle(objective.id)}
                  className={cn(
                    'p-4 cursor-pointer transition-all hover:border-primary/50',
                    isSelected && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{objective.name}</h4>
                      <p className="text-sm text-muted-foreground">{objective.description}</p>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 transition-all',
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {isSelected && (
                        <svg
                          className="w-full h-full text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground">Common Objectives</span>
        <div className="grid gap-3">
          {defaultObjectives.map((objective) => {
            const Icon = iconMap[objective.category] || Target;
            const isSelected = selectedObjectives.includes(objective.id);

            return (
              <Card
                key={objective.id}
                onClick={() => onObjectiveToggle(objective.id)}
                className={cn(
                  'p-4 cursor-pointer transition-all hover:border-primary/50',
                  isSelected && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{objective.name}</h4>
                    <p className="text-sm text-muted-foreground">{objective.description}</p>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 transition-all',
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="w-full h-full text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedObjectives.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedObjectives.length} objective{selectedObjectives.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};
