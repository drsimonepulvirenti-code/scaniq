import { cn } from '@/lib/utils';
import { Improvement, CATEGORIES, PRIORITY_CONFIG } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';

interface ImprovementCardProps {
  improvement: Improvement;
  index: number;
}

export const ImprovementCard = ({ improvement, index }: ImprovementCardProps) => {
  const category = CATEGORIES.find((c) => c.id === improvement.category);
  const priority = PRIORITY_CONFIG[improvement.priority];

  return (
    <div 
      className={cn(
        'bg-card rounded-2xl p-6 border-2 shadow-card hover-bounce cursor-default animate-fade-up',
        category?.bgClass
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category?.icon}</span>
          <div>
            <h4 className="font-fredoka font-semibold text-lg leading-tight">
              {improvement.title}
            </h4>
            <span className={cn('text-sm', category?.colorClass)}>
              {category?.label}
            </span>
          </div>
        </div>
        <Badge className={cn('shrink-0', priority.colorClass)}>
          {improvement.priority}
        </Badge>
      </div>

      <p className="text-muted-foreground mb-4">
        {improvement.description}
      </p>

      <div className="bg-background/50 rounded-xl p-4 border border-border">
        <p className="text-sm font-medium mb-1">💡 Recommendation</p>
        <p className="text-sm text-muted-foreground">
          {improvement.recommendation}
        </p>
      </div>
    </div>
  );
};
