import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}
export const UrlInput = ({
  onAnalyze,
  isLoading
}: UrlInputProps) => {
  const [url, setUrl] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Add https if not present
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    onAnalyze(formattedUrl);
  };
  return <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input type="text" value={url} onChange={e => setUrl(e.target.value)} className="h-14 pl-12 pr-4 rounded-2xl text-lg border-2 focus:border-primary transition-colors" disabled={isLoading} placeholder="Enter a website URL\n" />
        </div>
        <Button type="submit" disabled={!url.trim() || isLoading} className="h-14 px-8 rounded-2xl text-lg font-semibold hover-bounce shadow-lg shadow-primary/30">
          {isLoading ? <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse-soft" />
              Analyzing...
            </span> : <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Analyze
            </span>}
        </Button>
      </div>
    </form>;
};