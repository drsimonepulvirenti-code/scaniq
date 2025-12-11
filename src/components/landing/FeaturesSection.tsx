import { MessageSquare, BarChart3, ListTodo, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: MessageSquare,
    title: 'Collect Feedback',
    description: 'Gather visual and contextual feedback from any website automatically.',
  },
  {
    icon: BarChart3,
    title: 'Analyze Feedback',
    description: 'Use AI-powered analysis to gain deep insights into your product.',
  },
  {
    icon: ListTodo,
    title: 'Prioritize Feedback',
    description: 'Organize improvements based on impact, urgency and feasibility.',
  },
  {
    icon: Map,
    title: 'Build Roadmaps',
    description: 'Create action plans and track progress over time.',
    highlighted: true,
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need{' '}
            <span className="text-gradient">to scale faster</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className={`relative overflow-hidden transition-all hover:shadow-card ${
                feature.highlighted 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card hover:bg-accent/50'
              }`}
            >
              <CardContent className="pt-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  feature.highlighted 
                    ? 'bg-primary-foreground/20' 
                    : 'bg-primary/10'
                }`}>
                  <feature.icon className={`w-5 h-5 ${
                    feature.highlighted ? 'text-primary-foreground' : 'text-primary'
                  }`} />
                </div>
                <h3 className={`font-semibold mb-2 ${
                  feature.highlighted ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${
                  feature.highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'
                }`}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
