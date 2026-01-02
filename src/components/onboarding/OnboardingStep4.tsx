import { Palette, MousePointer, Search, Accessibility, Zap, Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SelectedAgent } from '@/types/onboarding';
import { cn } from '@/lib/utils';

interface OnboardingStep4Props {
  selectedAgents: string[];
  onAgentToggle: (agentId: string) => void;
  workEmail: string;
  onEmailChange: (email: string) => void;
}

const agents: SelectedAgent[] = [
  {
    id: 'ui-designer',
    name: 'UI Designer',
    role: 'Visual Design Expert',
    icon: 'Palette',
    expertise: ['Color Theory', 'Typography', 'Layout', 'Visual Hierarchy'],
  },
  {
    id: 'ux-designer',
    name: 'UX Designer',
    role: 'User Experience Expert',
    icon: 'MousePointer',
    expertise: ['User Flows', 'Usability', 'Navigation', 'Interaction Design'],
  },
  {
    id: 'seo-specialist',
    name: 'SEO Specialist',
    role: 'Search Optimization Expert',
    icon: 'Search',
    expertise: ['Keywords', 'Meta Tags', 'Content Structure', 'Technical SEO'],
  },
  {
    id: 'accessibility-expert',
    name: 'Accessibility Expert',
    role: 'A11y Specialist',
    icon: 'Accessibility',
    expertise: ['WCAG', 'Screen Readers', 'Color Contrast', 'Keyboard Navigation'],
  },
  {
    id: 'performance-engineer',
    name: 'Performance Engineer',
    role: 'Speed Optimization Expert',
    icon: 'Zap',
    expertise: ['Core Web Vitals', 'Load Time', 'Optimization', 'Caching'],
  },
];

const iconMap: Record<string, React.ElementType> = {
  Palette,
  MousePointer,
  Search,
  Accessibility,
  Zap,
  Bot,
};

export const OnboardingStep4 = ({
  selectedAgents,
  onAgentToggle,
  workEmail,
  onEmailChange,
}: OnboardingStep4Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Choose your AI agents
        </h2>
        <p className="text-muted-foreground">
          Select the specialists that will analyze your website and provide recommendations.
        </p>
      </div>

      <div className="grid gap-4">
        {agents.map((agent) => {
          const Icon = iconMap[agent.icon];
          const isSelected = selectedAgents.includes(agent.id);

          return (
            <Card
              key={agent.id}
              onClick={() => onAgentToggle(agent.id)}
              className={cn(
                'p-5 cursor-pointer transition-all hover:border-primary/50',
                isSelected && 'border-primary bg-primary/5'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground">{agent.name}</h4>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center',
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-primary-foreground"
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
                  <p className="text-sm text-muted-foreground mb-3">{agent.role}</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.expertise.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedAgents.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedAgents.length} agent{selectedAgents.length > 1 ? 's' : ''} selected
        </p>
      )}

      <div className="pt-4 border-t border-border space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Work Email (Optional)
        </label>
        <Input
          type="email"
          value={workEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@company.com"
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          Get notified when your analysis is ready and receive weekly insights.
        </p>
      </div>
    </div>
  );
};
