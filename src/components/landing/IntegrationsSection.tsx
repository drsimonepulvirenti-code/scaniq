import { Button } from '@/components/ui/button';
import { Figma, Github } from 'lucide-react';

const integrations = [
  { name: 'Figma', icon: Figma },
  { name: 'GitHub', icon: Github },
  { name: 'Notion', icon: () => <span className="text-2xl font-bold">N</span> },
  { name: 'Amplitude', icon: () => <span className="text-2xl font-bold">A</span> },
];

export const IntegrationsSection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tuning feedback with{' '}
                <span className="text-gradient">your knowledge</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Seamlessly integrate with the tools you already use. Connect your design files, 
                documentation, and analytics for deeper insights.
              </p>
              <Button variant="outline">
                See all integrations
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <div 
                  key={integration.name}
                  className="flex items-center justify-center h-24 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <integration.icon className="w-10 h-10 text-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
