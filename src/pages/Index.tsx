import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/types/analysis';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AICapabilitiesSection } from '@/components/landing/AICapabilitiesSection';
import { IntegrationsSection } from '@/components/landing/IntegrationsSection';
import { RolesSection } from '@/components/landing/RolesSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { BottomCTA } from '@/components/landing/BottomCTA';
import { LoadingState } from '@/components/LoadingState';
import { ResultsDashboard } from '@/components/ResultsDashboard';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setAnalysisResult(null);
    
    // Scroll to top to show loading state
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url }
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
      toast.success(`Analysis complete! Found ${data.improvements?.length || 0} improvement suggestions.`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20">
          <LoadingState />
        </main>
      </div>
    );
  }

  // Show results
  if (analysisResult) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <ResultsDashboard result={analysisResult} onReset={handleReset} />
        </main>
      </div>
    );
  }

  // Show landing page
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onAnalyze={handleAnalyze} isLoading={isLoading} />
        <FeaturesSection />
        <AICapabilitiesSection />
        <IntegrationsSection />
        <RolesSection />
        <UseCasesSection />
        <BottomCTA onAnalyze={handleAnalyze} isLoading={isLoading} />
      </main>
      <footer className="py-8 border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          © 2024 ScanIQ. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
