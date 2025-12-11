import { UrlInput } from '@/components/UrlInput';

interface BottomCTAProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const BottomCTA = ({ onAnalyze, isLoading }: BottomCTAProps) => {
  return (
    <section className="py-20 md:py-32 gradient-section">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to boost{' '}
                <span className="text-gradient">something amazing?</span>
              </h2>
              <p className="text-muted-foreground">
                Try ScanIQ for free and get instant feedback on your website.
              </p>
            </div>
            
            <div>
              <UrlInput onAnalyze={onAnalyze} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
