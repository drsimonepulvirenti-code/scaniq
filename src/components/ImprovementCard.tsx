import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Improvement, CATEGORIES, PRIORITY_CONFIG } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Eye, TrendingUp, MapPin } from 'lucide-react';

interface ImprovementCardProps {
  improvement: Improvement;
  index: number;
  screenshot?: string;
}

const getBenefitColor = (benefit: number) => {
  if (benefit >= 90) return 'text-[hsl(160,84%,39%)] bg-[hsl(160,84%,95%)]';
  if (benefit >= 70) return 'text-[hsl(160,84%,39%)] bg-[hsl(160,84%,95%)]';
  if (benefit >= 50) return 'text-primary bg-[hsl(217,91%,95%)]';
  if (benefit >= 30) return 'text-[hsl(25,95%,53%)] bg-[hsl(25,95%,95%)]';
  return 'text-muted-foreground bg-muted';
};

const getBenefitLabel = (benefit: number) => {
  if (benefit >= 90) return 'Critical Impact';
  if (benefit >= 70) return 'High Impact';
  if (benefit >= 50) return 'Moderate Impact';
  if (benefit >= 30) return 'Low Impact';
  return 'Minor Polish';
};

export const ImprovementCard = ({ improvement, index, screenshot }: ImprovementCardProps) => {
  const [showScreenshot, setShowScreenshot] = useState(false);
  const category = CATEGORIES.find(c => c.id === improvement.category);
  const priority = PRIORITY_CONFIG[improvement.priority];
  const benefitColor = getBenefitColor(improvement.estimatedBenefit);

  return (
    <div 
      className={cn(
        'bg-card rounded-2xl p-6 border shadow-soft hover:shadow-card transition-shadow animate-fade-up',
        category?.bgClass
      )} 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category?.icon}</span>
          <div>
            <h4 className="font-semibold text-lg leading-tight">
              {improvement.title}
            </h4>
            <span className={cn('text-sm', category?.colorClass)}>
              {category?.label}
            </span>
          </div>
        </div>
        <div className="flex items-end gap-2 flex-row">
          <Badge className={cn('shrink-0', priority.colorClass)}>
            {improvement.priority}
          </Badge>
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
            benefitColor
          )}>
            <TrendingUp className="w-3 h-3" />
            <span>{improvement.estimatedBenefit}%</span>
            <span className="hidden sm:inline">• {getBenefitLabel(improvement.estimatedBenefit)}</span>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground mb-4">
        {improvement.description}
      </p>

      {improvement.elementLocation && (
        <div className="bg-muted/50 rounded-xl p-3 mb-4 border border-border">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-foreground">
                {improvement.elementLocation.section}
              </span>
              <span className="text-muted-foreground"> → </span>
              <span className="font-medium text-foreground">
                {improvement.elementLocation.element}
              </span>
              <p className="text-muted-foreground mt-1 text-xs">
                {improvement.elementLocation.visualDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-muted/30 rounded-xl p-4 border border-border">
        <p className="text-sm font-medium mb-1">💡 Recommendation</p>
        <p className="text-sm text-muted-foreground">
          {improvement.recommendation}
        </p>
      </div>

      {screenshot && improvement.elementLocation && (
        <div className="mt-4">
          <button
            onClick={() => setShowScreenshot(!showScreenshot)}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors text-primary hover:opacity-80'
            )}
          >
            <Eye className="w-4 h-4" />
            {showScreenshot ? 'Hide Page Screenshot' : 'View Full Page'}
            {showScreenshot ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showScreenshot && (
            <div className="mt-3 space-y-2 animate-fade-up">
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                📍 Look for: <strong>{improvement.elementLocation.section}</strong> → <strong>{improvement.elementLocation.element}</strong>
              </p>
              <div className="rounded-xl overflow-hidden border border-border shadow-soft">
                <img src={screenshot} alt="Website screenshot" className="w-full h-auto" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
