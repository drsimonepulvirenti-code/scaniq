import { useState, useMemo } from 'react';
import { AnalysisResult, Priority } from '@/types/analysis';
import { AgentEnrichment } from '@/types/agents';
import { ScoreCard } from './ScoreCard';
import { PriorityTabs } from './PriorityTabs';
import { ImprovementCard } from './ImprovementCard';
import { AIAgentsTable } from './AIAgentsTable';
import { AgentEnrichmentTabs } from './AgentEnrichmentTabs';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Bot, Map } from 'lucide-react';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultsDashboard = ({
  result,
  onReset
}: ResultsDashboardProps) => {
  const [activePriority, setActivePriority] = useState<Priority | 'all'>('all');
  const [activeMainTab, setActiveMainTab] = useState<string>('agents');
  const [enrichments, setEnrichments] = useState<AgentEnrichment[]>([]);

  const filteredImprovements = useMemo(() => {
    if (activePriority === 'all') return result.improvements;
    return result.improvements.filter(i => i.priority === activePriority);
  }, [result.improvements, activePriority]);

  const counts = useMemo(() => ({
    all: result.improvements.length,
    high: result.improvements.filter(i => i.priority === 'high').length,
    medium: result.improvements.filter(i => i.priority === 'medium').length,
    low: result.improvements.filter(i => i.priority === 'low').length
  }), [result.improvements]);

  const handleEnrichmentComplete = (newEnrichments: AgentEnrichment[]) => {
    setEnrichments(newEnrichments);
  };

  return (
    <div className="space-y-8">
      <ScoreCard result={result} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="agents" 
                className="data-[state=active]:bg-electric data-[state=active]:text-white rounded-lg px-4"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Agents
              </TabsTrigger>
              <TabsTrigger 
                value="roadmap" 
                className="data-[state=active]:bg-electric data-[state=active]:text-white rounded-lg px-4"
              >
                <Map className="w-4 h-4 mr-2" />
                Improvement Roadmap
              </TabsTrigger>
            </TabsList>

            <Button variant="outline" onClick={onReset} className="rounded-xl hover-bounce">
              <RotateCcw className="w-4 h-4 mr-2" />
              Analyze Another
            </Button>
          </div>

          <TabsContent value="agents" className="space-y-8">
            <AIAgentsTable 
              websiteContent={result.summary}
              url={result.url}
              onEnrichmentComplete={handleEnrichmentComplete}
            />
            
            {enrichments.length > 0 && (
              <AgentEnrichmentTabs enrichments={enrichments} />
            )}
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
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
                  screenshot={result.screenshot} 
                />
              ))}
            </div>

            {filteredImprovements.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🎉</span>
                <p className="text-muted-foreground">No issues in this priority level!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
