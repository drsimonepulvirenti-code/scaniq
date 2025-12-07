import { useState, useMemo } from 'react';
import { AnalysisResult, Priority } from '@/types/analysis';
import { ScoreCard } from './ScoreCard';
import { PriorityTabs } from './PriorityTabs';
import { ImprovementCard } from './ImprovementCard';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ResultsDashboardProps {
  result: AnalysisResult;
  url: string;
  onReset: () => void;
}

export const ResultsDashboard = ({ result, url, onReset }: ResultsDashboardProps) => {
  const [activePriority, setActivePriority] = useState<Priority | 'all'>('all');

  const filteredImprovements = useMemo(() => {
    if (activePriority === 'all') return result.improvements;
    return result.improvements.filter((i) => i.priority === activePriority);
  }, [result.improvements, activePriority]);

  const counts = useMemo(() => ({
    all: result.improvements.length,
    high: result.improvements.filter((i) => i.priority === 'high').length,
    medium: result.improvements.filter((i) => i.priority === 'medium').length,
    low: result.improvements.filter((i) => i.priority === 'low').length,
  }), [result.improvements]);

  return (
    <div className="space-y-8">
      <ScoreCard score={result.score} summary={result.summary} url={url} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-2xl font-fredoka font-bold">
          Improvement Roadmap
        </h3>
        <Button 
          variant="outline" 
          onClick={onReset}
          className="rounded-xl hover-bounce"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Analyze Another
        </Button>
      </div>

      <PriorityTabs 
        activePriority={activePriority} 
        onPriorityChange={setActivePriority}
        counts={counts}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {filteredImprovements.map((improvement, index) => (
          <ImprovementCard 
            key={improvement.id} 
            improvement={improvement}
            index={index}
          />
        ))}
      </div>

      {filteredImprovements.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🎉</span>
          <p className="text-muted-foreground">No issues in this priority level!</p>
        </div>
      )}
    </div>
  );
};
