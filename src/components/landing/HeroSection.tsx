import { UrlInput } from '@/components/UrlInput';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface HeroSectionProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const HeroSection = ({ onAnalyze, isLoading }: HeroSectionProps) => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden gradient-hero py-20 md:py-32">
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6 gap-2">
            <Sparkles className="w-3 h-3" />
            {t.hero.badge}
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t.hero.titlePart1}{' '}
            <span className="text-gradient">{t.hero.titleHighlight}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
            {t.hero.description}
          </p>
          
          <div className="w-full max-w-xl">
            <UrlInput onAnalyze={onAnalyze} isLoading={isLoading} />
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">{t.hero.trustedBy}</p>
            <div className="flex items-center gap-8 opacity-50">
              <div className="h-6 w-20 bg-muted-foreground/20 rounded" />
              <div className="h-6 w-24 bg-muted-foreground/20 rounded" />
              <div className="h-6 w-16 bg-muted-foreground/20 rounded" />
              <div className="h-6 w-20 bg-muted-foreground/20 rounded hidden sm:block" />
              <div className="h-6 w-24 bg-muted-foreground/20 rounded hidden md:block" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </section>
  );
};
