import { Palette, Search, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';

export const AICapabilitiesSection = () => {
  const { t } = useLanguage();

  const capabilities = [
    { icon: Palette, title: t.aiCapabilities.aiPerformance, description: t.aiCapabilities.aiPerformanceDesc },
    { icon: Search, title: t.aiCapabilities.seo, description: t.aiCapabilities.seoDesc },
    { icon: Zap, title: t.aiCapabilities.performance, description: t.aiCapabilities.performanceDesc },
  ];

  return (
    <section className="py-20 md:py-32 gradient-section">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.aiCapabilities.title}{' '}
            <span className="text-gradient">{t.aiCapabilities.titleHighlight}</span>
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
