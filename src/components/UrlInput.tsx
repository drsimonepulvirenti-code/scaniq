import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const EXAMPLE_URLS = [
  'https://stripe.com',
  'https://airbnb.com',
  'https://spotify.com',
  'https://notion.so',
  'https://figma.com',
];

const isValidUrl = (url: string): boolean => {
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
  return urlPattern.test(url.trim());
};

export const UrlInput = ({ onAnalyze, isLoading }: UrlInputProps) => {
  const [url, setUrl] = useState('');
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (url) return; // Don't animate if user is typing

    const currentUrl = EXAMPLE_URLS[currentUrlIndex];
    let charIndex = isTyping ? animatedPlaceholder.length : currentUrl.length;

    const typingSpeed = isTyping ? 80 : 40;
    const pauseDuration = 2000;

    const timeout = setTimeout(() => {
      if (isTyping) {
        if (charIndex < currentUrl.length) {
          setAnimatedPlaceholder(currentUrl.slice(0, charIndex + 1));
        } else {
          setTimeout(() => setIsTyping(false), pauseDuration);
        }
      } else {
        if (charIndex > 0) {
          setAnimatedPlaceholder(currentUrl.slice(0, charIndex - 1));
        } else {
          setCurrentUrlIndex((prev) => (prev + 1) % EXAMPLE_URLS.length);
          setIsTyping(true);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [animatedPlaceholder, isTyping, currentUrlIndex, url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!isValidUrl(url)) {
      toast({
        title: t.urlInput.invalidUrl || "URL non valida",
        description: t.urlInput.invalidUrlDescription || "Inserisci un URL valido (es. esempio.com)",
        variant: "destructive",
      });
      return;
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    onAnalyze(formattedUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 px-4 rounded-xl bg-background border-border text-base"
            disabled={isLoading}
            placeholder={url ? t.urlInput.placeholder : animatedPlaceholder || t.urlInput.placeholder}
          />
        </div>
        <Button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="h-12 px-6 rounded-xl text-base font-medium gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.urlInput.analyzing}
            </>
          ) : (
            <>
              {t.urlInput.startAnalysis}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
