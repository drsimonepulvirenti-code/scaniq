import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AICapabilitiesSection } from '@/components/landing/AICapabilitiesSection';
import { IntegrationsSection } from '@/components/landing/IntegrationsSection';
import { RolesSection } from '@/components/landing/RolesSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { BottomCTA } from '@/components/landing/BottomCTA';

const Index = () => {
  const navigate = useNavigate();

  const handleAnalyze = (url: string) => {
    // Navigate to scan page with the URL pre-filled
    navigate('/scan', { state: { url } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onAnalyze={handleAnalyze} isLoading={false} />
        <FeaturesSection />
        <AICapabilitiesSection />
        <IntegrationsSection />
        <RolesSection />
        <UseCasesSection />
        <BottomCTA onAnalyze={handleAnalyze} isLoading={false} />
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
