import { Users, Building2, Briefcase, GraduationCap, ShoppingBag, Code, Megaphone, User, Sparkles } from 'lucide-react';
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
  Sparkles,
};

// Generate a unique ID for detected audience
const generateDetectedId = (audience: string) => `detected-${audience.toLowerCase().replace(/\s+/g, '-')}`;

export const OnboardingStep2 = ({
  selectedPersonas,
  onPersonaToggle,
  scrapedData,
}: OnboardingStep2Props) => {
  const b2bPersonas = personas.filter(p => p.category === 'b2b');
  const b2cPersonas = personas.filter(p => p.category === 'b2c');
  
  // Create selectable cards from detected audience
  const detectedAudienceCards = scrapedData?.targetAudience?.map((audience) => ({
    id: generateDetectedId(audience),
    name: audience,
    description: 'AI-detected from your website content',
    icon: 'Sparkles' as const,
    category: 'detected' as const,
  })) || [];

  const renderPersonaCard = (persona: { id: string; name: string; description: string; icon: string; category: string }, isDetected = false) => {
    const Icon = iconMap[persona.icon] || Sparkles;
    const isSelected = selectedPersonas.includes(persona.id);

    return (
      <Card
        key={persona.id}
        onClick={() => onPersonaToggle(persona.id)}
        className={cn(
          'p-4 cursor-pointer transition-all hover:border-primary/50',
          isSelected && 'border-primary bg-primary/5',
          isDetected && !isSelected && 'border-dashed border-primary/30 bg-primary/5'
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              isSelected 
                ? 'bg-primary text-primary-foreground' 
                : isDetected 
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">{persona.name}</h4>
              {isDetected && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                  AI
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {persona.description}
            </p>
          </div>
        </div>
      </Card>
    );
  };

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

      {/* Detected Audience Section */}
      {detectedAudienceCards.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-primary">Detected Audience</h3>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">
            Based on your website content, we identified these potential customer segments. Click to select.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {detectedAudienceCards.map((persona) => renderPersonaCard(persona, true))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Business (B2B)</h3>
          <div className="grid grid-cols-2 gap-3">
            {b2bPersonas.map((persona) => renderPersonaCard(persona))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Consumer (B2C)</h3>
          <div className="grid grid-cols-2 gap-3">
            {b2cPersonas.map((persona) => renderPersonaCard(persona))}
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
