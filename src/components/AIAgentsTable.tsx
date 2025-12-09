import { useState } from 'react';
import { AI_AGENTS, AIAgent, AgentEnrichment } from '@/types/agents';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIAgentsTableProps {
  websiteContent: string;
  url: string;
  onEnrichmentComplete: (enrichments: AgentEnrichment[]) => void;
}

export const AIAgentsTable = ({ websiteContent, url, onEnrichmentComplete }: AIAgentsTableProps) => {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const toggleAll = () => {
    if (selectedAgents.length === AI_AGENTS.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(AI_AGENTS.map(a => a.id));
    }
  };

  const runEnrichment = async () => {
    if (selectedAgents.length === 0) {
      toast.error('Please select at least one AI agent');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { 
          url,
          enrichment: true,
          agentIds: selectedAgents,
          websiteContent
        }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      onEnrichmentComplete(data.enrichments || []);
      toast.success(`Analysis complete from ${selectedAgents.length} expert${selectedAgents.length > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Enrichment error:', error);
      toast.error(error instanceof Error ? error.message : 'Enrichment failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 rounded-2xl border-2 border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-fredoka font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-electric" />
            AI Expert Agents
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select experts to get specialized analysis insights
          </p>
        </div>
        <Button 
          onClick={runEnrichment} 
          disabled={selectedAgents.length === 0 || isAnalyzing}
          className="bg-gradient-to-r from-coral via-electric to-sunny text-white hover-bounce rounded-xl"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Run Expert Analysis ({selectedAgents.length})
            </>
          )}
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedAgents.length === AI_AGENTS.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead>Agent</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden lg:table-cell">Expertise</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {AI_AGENTS.map((agent) => (
              <TableRow 
                key={agent.id}
                className={`cursor-pointer transition-colors ${
                  selectedAgents.includes(agent.id) ? 'bg-electric/10' : 'hover:bg-muted/30'
                }`}
                onClick={() => toggleAgent(agent.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedAgents.includes(agent.id)}
                    onCheckedChange={() => toggleAgent(agent.id)}
                  />
                </TableCell>
                <TableCell>
                  <span className="text-2xl">{agent.icon}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold">{agent.name}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{agent.role}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{agent.role}</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {agent.expertiseAreas.slice(0, 3).map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                    {agent.expertiseAreas.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.expertiseAreas.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedAgents.length > 0 && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          {selectedAgents.length} agent{selectedAgents.length > 1 ? 's' : ''} selected — 
          Each will provide specialized insights for your website
        </p>
      )}
    </Card>
  );
};
