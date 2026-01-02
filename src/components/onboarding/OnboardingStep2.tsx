import { Users, Building2, Briefcase, GraduationCap, ShoppingBag, Code, Megaphone, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CustomerPersona, ScrapedData } from '@/types/onboarding';
import { cn } from '@/lib/utils';

interface OnboardingStep2Props {
  selectedPersonas: string[];
  onPersonaToggle: (personaId: string) => void;
  scrapedData: ScrapedData | null;
}

const personas: CustomerPersona[] = [
  // B2B
  { id: 'project-managers', name: 'Project Managers', description: 'Looking for productivity and collaboration tools', icon: 'Briefcase', category: 'b2b' },
  { id: 'dev-teams', name: 'Development Teams', description: 'Need technical solutions and integrations', icon: 'Code', category: 'b2b' },
  { id: 'marketing-teams', name: 'Marketing Teams', description: 'Focused on growth and customer acquisition', icon: 'Megaphone', category: 'b2b' },
  { id: 'executives', name: 'Executives', description: 'Looking for strategic business value', icon: 'Building2', category: 'b2b' },
  // B2C
  { id: 'individual-users', name: 'Individual Users', description: 'Personal use and productivity', icon: 'User', category: 'b2c' },
  { id: 'small-business', name: 'Small Business Owners', description: 'Running their own businesses', icon: 'ShoppingBag', category: 'b2c' },
  { id: 'freelancers', name: 'Freelancers', description: 'Independent professionals', icon: 'Briefcase', category: 'b2c' },
  { id: 'students', name: 'Students', description: 'Learning and education focused', icon: 'GraduationCap', category: 'b2c' },
];

const iconMap: Record<string, React.ElementType> = {
  Briefcase,
  Code,
  Megaphone,
  Building2,
  User,
  ShoppingBag,
  GraduationCap,
  Users,
};

export const OnboardingStep2 = ({
  selectedPersonas,
  onPersonaToggle,
  scrapedData,
}: OnboardingStep2Props) => {
  const b2bPersonas = personas.filter(p => p.category === 'b2b');
  const b2cPersonas = personas.filter(p => p.category === 'b2c');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Who are your customers?
        </h2>
        <p className="text-muted-foreground">
          Select all the customer personas that apply to your business. This helps us tailor objectives.
        </p>
      </div>

      {scrapedData?.targetAudience && scrapedData.targetAudience.length > 0 && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary mb-2">AI-Detected Audience</p>
          <div className="flex flex-wrap gap-2">
            {scrapedData.targetAudience.map((audience, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Business (B2B)</h3>
          <div className="grid grid-cols-2 gap-3">
            {b2bPersonas.map((persona) => {
              const Icon = iconMap[persona.icon];
              const isSelected = selectedPersonas.includes(persona.id);

              return (
                <Card
                  key={persona.id}
                  onClick={() => onPersonaToggle(persona.id)}
                  className={cn(
                    'p-4 cursor-pointer transition-all hover:border-primary/50',
                    isSelected && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{persona.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {persona.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Consumer (B2C)</h3>
          <div className="grid grid-cols-2 gap-3">
            {b2cPersonas.map((persona) => {
              const Icon = iconMap[persona.icon];
              const isSelected = selectedPersonas.includes(persona.id);

              return (
                <Card
                  key={persona.id}
                  onClick={() => onPersonaToggle(persona.id)}
                  className={cn(
                    'p-4 cursor-pointer transition-all hover:border-primary/50',
                    isSelected && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{persona.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {persona.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {selectedPersonas.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedPersonas.length} persona{selectedPersonas.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};
