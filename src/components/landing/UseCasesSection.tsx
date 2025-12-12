import { Layout, LayoutDashboard, Smartphone, ShoppingCart, Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export const UseCasesSection = () => {
  const { t } = useLanguage();

  const useCases = [
    { icon: Layout, title: t.useCases.landingPage },
    { icon: LayoutDashboard, title: t.useCases.dashboard },
    { icon: Smartphone, title: t.useCases.mobile },
    { icon: ShoppingCart, title: t.useCases.ecommerce },
    { icon: Globe, title: t.useCases.webApp },
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.useCases.title}{' '}
            <span className="text-gradient">{t.useCases.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.useCases.description}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="flex flex-col items-center gap-3 p-4">
              <div className="w-48 h-32 bg-muted/50 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
                <useCase.icon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <useCase.icon className="w-4 h-4" />
                {useCase.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
