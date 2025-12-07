import { Compass, Lightbulb, Rocket, Target } from 'lucide-react';

export const EmptyState = () => {
  const features = [
    { icon: Target, label: 'Visual Design', color: 'bg-coral/20 text-coral' },
    { icon: Compass, label: 'Usability', color: 'bg-electric/20 text-electric' },
    { icon: Lightbulb, label: 'Accessibility', color: 'bg-sunny/20 text-sunny' },
    { icon: Rocket, label: 'Performance', color: 'bg-teal/20 text-teal' },
  ];

  return (
    <div className="text-center py-16 animate-fade-up">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-coral/20 via-electric/20 to-sunny/20 mb-8">
        <span className="text-5xl">🔍</span>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-fredoka font-bold mb-4">
        Ready to analyze your website?
      </h2>
      <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
        Enter a URL above and get AI-powered suggestions to improve your user experience
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {features.map(({ icon: Icon, label, color }) => (
          <div 
            key={label}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-card hover-bounce cursor-default"
          >
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
