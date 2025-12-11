import { Palette, Search, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const capabilities = [
  {
    icon: Palette,
    title: 'AI Performance',
    description: 'Analyze visual hierarchy, color contrast, and design consistency automatically.',
  },
  {
    icon: Search,
    title: 'SEO',
    description: 'Optimize for search engines with AI-powered recommendations and audits.',
  },
  {
    icon: Zap,
    title: 'Performance',
    description: 'Identify bottlenecks and optimize loading speed for better user experience.',
  },
];

export const AICapabilitiesSection = () => {
  return (
    <section className="py-20 md:py-32 gradient-section">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Empower your product with{' '}
            <span className="text-gradient">the most powerful AI team</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {capabilities.map((capability) => (
            <Card key={capability.title} className="bg-card border hover:shadow-card transition-all">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <capability.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{capability.title}</h3>
                <p className="text-sm text-muted-foreground">{capability.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
