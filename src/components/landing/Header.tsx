import { Button } from '@/components/ui/button';
import { Sparkles, Globe } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">ScanIQ</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Globe className="w-4 h-4" />
            <span>EN</span>
          </button>
          <Button variant="ghost" size="sm">
            Log in
          </Button>
          <Button size="sm">
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
};
