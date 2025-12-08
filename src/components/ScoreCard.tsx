import { cn } from '@/lib/utils';
import { AnalysisResult, getScoreCategory } from '@/types/analysis';
interface ScoreCardProps {
  result: AnalysisResult;
}
export const ScoreCard = ({
  result
}: ScoreCardProps) => {
  const scoreCategory = getScoreCategory(result.score);
  const getScoreColor = () => {
    if (result.score >= 85) return 'text-teal';
    if (result.score >= 70) return 'text-electric';
    if (result.score >= 50) return 'text-sunny';
    return 'text-coral';
  };
  const getScoreRingColor = () => {
    if (result.score >= 85) return 'stroke-teal';
    if (result.score >= 70) return 'stroke-electric';
    if (result.score >= 50) return 'stroke-sunny';
    return 'stroke-coral';
  };

  // Calculate circumference and offset for circular progress
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - result.score / 100 * circumference;
  return <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border animate-fade-up">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Score Circle */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle cx="72" cy="72" r={radius} fill="none" className="stroke-muted" strokeWidth="12" />
            <circle cx="72" cy="72" r={radius} fill="none" className={cn('transition-all duration-1000 ease-out', getScoreRingColor())} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-4xl font-fredoka font-bold', getScoreColor())}>
              {result.score}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Summary */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h2 className="text-lg font-fredoka font-semibold">Analysis complete</h2>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', scoreCategory.colorClass, 'bg-muted')}>
              {scoreCategory.label}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 break-all">
            {result.url}
          </p>
          
          {/* Score Description */}
          <div className="bg-muted/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-muted-foreground">
              {scoreCategory.description}
            </p>
          </div>
          
          <p className="text-foreground leading-relaxed">
            {result.summary}
          </p>

          {/* Score Scale Legend */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Score Scale (1-100):</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-coral">0-29 Poor</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-coral">30-49 Needs Work</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sunny">50-69 Average</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-electric">70-84 Good</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-teal">85-100 Excellent</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};