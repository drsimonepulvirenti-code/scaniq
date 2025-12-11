import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput = ({ onAnalyze, isLoading }: UrlInputProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

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
            placeholder="Enter your website URL..."
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
              Analyzing...
            </>
          ) : (
            <>
              Start analysis
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
