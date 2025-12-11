import { Code, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const roles = [
  {
    icon: Code,
    title: 'Founders',
    description: 'Launch faster with AI-guided product decisions. Understand what matters most to your users.',
    benefits: ['AI-Powered Decisions', 'Performance Insights', 'User Behavior Analysis'],
  },
  {
    icon: Users,
    title: 'Product Managers',
    description: 'Make data-driven decisions and prioritize features that drive the biggest impact.',
    benefits: ['AI-Powered Prioritization', 'Feature Roadmapping', 'User Feedback Analysis'],
  },
];

export const RolesSection = () => {
  return (
    <section className="py-20 md:py-32 gradient-section">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Whatever your role, ScanIQ{' '}
            <span className="text-gradient">gives your priorities</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {roles.map((role) => (
            <Card key={role.title} className="bg-card hover:shadow-card transition-all">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <role.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                <p className="text-muted-foreground mb-4">{role.description}</p>
                <ul className="space-y-2">
                  {role.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
