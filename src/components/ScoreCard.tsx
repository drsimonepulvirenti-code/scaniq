import { cn } from '@/lib/utils';

interface ScoreCardProps {
  score: number;
  summary: string;
  url: string;
}

export const ScoreCard = ({ score, summary, url }: ScoreCardProps) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-teal';
    if (score >= 60) return 'text-sunny';
    if (score >= 40) return 'text-electric';
    return 'text-coral';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  const getScoreRingColor = () => {
    if (score >= 80) return 'stroke-teal';
    if (score >= 60) return 'stroke-sunny';
    if (score >= 40) return 'stroke-electric';
    return 'stroke-coral';
  };

  // Calculate circumference and offset for circular progress
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border animate-fade-up">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Score Circle */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              className="stroke-muted"
              strokeWidth="12"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              className={cn('transition-all duration-1000 ease-out', getScoreRingColor())}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-4xl font-fredoka font-bold', getScoreColor())}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground">{getScoreLabel()}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-lg font-fredoka font-semibold mb-2">
            Analysis Complete
          </h2>
          <p className="text-sm text-muted-foreground mb-3 break-all">
            {url}
          </p>
          <p className="text-foreground leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
};
