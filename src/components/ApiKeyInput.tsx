import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { KeyRound, Check, ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: () => void;
}

export const ApiKeyInput = ({ onApiKeySet }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    FirecrawlService.saveApiKey(apiKey.trim());
    
    setTimeout(() => {
      setIsLoading(false);
      onApiKeySet();
    }, 500);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-up">
      <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sunny/20 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-sunny" />
          </div>
          <div>
            <h3 className="text-lg font-fredoka font-semibold">Firecrawl API Key</h3>
            <p className="text-sm text-muted-foreground">Required to fetch website content</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="fc-xxxxxxxxxxxxxxxx"
            className="h-12 rounded-xl text-base"
          />
          
          <Button 
            type="submit" 
            disabled={!apiKey.trim() || isLoading}
            className="w-full h-12 rounded-xl text-base font-semibold hover-bounce shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse-soft">Saving...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Save API Key
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <a 
            href="https://www.firecrawl.dev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Get your free API key at firecrawl.dev
          </a>
        </div>
      </div>
    </div>
  );
};
