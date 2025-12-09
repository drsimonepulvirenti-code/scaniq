import { useState } from 'react';
import { AgentEnrichment } from '@/types/agents';
import { AI_AGENTS } from '@/types/agents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AgentEnrichmentTabsProps {
  enrichments: AgentEnrichment[];
}

export const AgentEnrichmentTabs = ({ enrichments }: AgentEnrichmentTabsProps) => {
  const [activeTab, setActiveTab] = useState(enrichments[0]?.agentId || '');

  const getAgent = (agentId: string) => AI_AGENTS.find(a => a.id === agentId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-coral text-white';
      case 'medium': return 'bg-sunny text-foreground';
      case 'low': return 'bg-mint text-foreground';
      default: return 'bg-muted';
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 80) return 'text-mint';
    if (impact >= 50) return 'text-electric';
    return 'text-coral';
  };

  if (enrichments.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-fredoka font-bold">Expert Insights</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
          {enrichments.map((enrichment) => {
            const agent = getAgent(enrichment.agentId);
            return (
              <TabsTrigger
                key={enrichment.agentId}
                value={enrichment.agentId}
                className="data-[state=active]:bg-electric data-[state=active]:text-white rounded-xl px-4 py-2 border border-border"
              >
                <span className="mr-2">{agent?.icon}</span>
                {agent?.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {enrichment.improvements.length}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {enrichments.map((enrichment) => {
          const agent = getAgent(enrichment.agentId);
          return (
            <TabsContent key={enrichment.agentId} value={enrichment.agentId} className="mt-6">
              <div className="mb-4 p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{agent?.icon}</span>
                  <div>
                    <h4 className="font-semibold">{agent?.name}</h4>
                    <p className="text-sm text-muted-foreground">{agent?.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {enrichment.improvements.map((improvement) => (
                  <Card key={improvement.id} className="p-4 rounded-xl border-2 hover:border-electric transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={getPriorityColor(improvement.priority)}>
                        {improvement.priority}
                      </Badge>
                      <div className="text-right">
                        <span className={`font-bold ${getImpactColor(improvement.estimatedImpact)}`}>
                          +{improvement.estimatedImpact}%
                        </span>
                        <p className="text-xs text-muted-foreground">Impact</p>
                      </div>
                    </div>
                    
                    <h5 className="font-semibold mb-2">{improvement.title}</h5>
                    <p className="text-sm text-muted-foreground mb-3">{improvement.description}</p>
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-electric mb-1">Expert Advice:</p>
                      <p className="text-sm">{improvement.specificAdvice}</p>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Estimated Impact</span>
                        <span>{improvement.estimatedImpact}/100</span>
                      </div>
                      <Progress value={improvement.estimatedImpact} className="h-2" />
                    </div>
                  </Card>
                ))}
              </div>

              {enrichment.improvements.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">✨</span>
                  <p className="text-muted-foreground">No specific issues found by this expert!</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
