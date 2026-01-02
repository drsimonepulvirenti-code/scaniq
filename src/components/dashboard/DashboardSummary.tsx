import { Palette, MousePointer, Search, Accessibility, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { OnboardingData, AgentInsight } from '@/types/onboarding';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardSummaryProps {
  onboardingData: OnboardingData;
  insights: AgentInsight[];
  selectedInsight: string | null;
  onInsightClick: (id: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Palette,
  MousePointer,
  Search,
  Accessibility,
  Zap,
};

export const DashboardSummary = ({
  onboardingData,
  insights,
  selectedInsight,
  onInsightClick,
}: DashboardSummaryProps) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Summary</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Recap section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Recap</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {onboardingData.scrapedData?.summary || onboardingData.context || 'No summary available.'}
          </p>

          {/* Objectives */}
          {onboardingData.selectedObjectives.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Goals</p>
              <div className="flex flex-wrap gap-1.5">
                {onboardingData.selectedObjectives.slice(0, 3).map((obj) => (
                  <Badge key={obj} variant="secondary" className="text-xs">
                    {obj.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Badge>
                ))}
                {onboardingData.selectedObjectives.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{onboardingData.selectedObjectives.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Agent Insights */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">AI Agent Insights</h3>
            <span className="text-xs text-muted-foreground">{insights.length} issues</span>
          </div>

          <div className="space-y-2">
            {insights.map((insight, index) => {
              const Icon = iconMap[insight.agentIcon] || Sparkles;
              const isSelected = selectedInsight === insight.id;

              return (
                <Card
                  key={insight.id}
                  onClick={() => onInsightClick(insight.id)}
                  className={cn(
                    'p-3 cursor-pointer transition-all hover:border-primary/50',
                    isSelected && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs font-medium">[{index + 1}]</span>
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          insight.priority === 'high' && 'bg-destructive/10 text-destructive',
                          insight.priority === 'medium' && 'bg-brand-orange/10 text-brand-orange',
                          insight.priority === 'low' && 'bg-brand-green/10 text-brand-green'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{insight.agentName}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px]',
                            insight.priority === 'high' && 'border-destructive/50 text-destructive',
                            insight.priority === 'medium' && 'border-brand-orange/50 text-brand-orange',
                            insight.priority === 'low' && 'border-brand-green/50 text-brand-green'
                          )}
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-foreground text-sm mt-1">{insight.title}</h4>
                      {isSelected && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {insight.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform',
                        isSelected && 'rotate-90'
                      )}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Actions</h3>
          <div className="space-y-2">
            <button className="w-full p-3 text-left text-sm bg-primary/5 hover:bg-primary/10 rounded-lg text-primary font-medium transition-colors">
              Export Report
            </button>
            <button className="w-full p-3 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg text-foreground transition-colors">
              Schedule Review
            </button>
            <button className="w-full p-3 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg text-foreground transition-colors">
              Share with Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
