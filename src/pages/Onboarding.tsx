import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OnboardingData, ScrapedData } from '@/types/onboarding';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { OnboardingStep0 } from '@/components/onboarding/OnboardingStep0';
import { OnboardingStep1 } from '@/components/onboarding/OnboardingStep1';
import { OnboardingStep2 } from '@/components/onboarding/OnboardingStep2';
import { OnboardingStep3 } from '@/components/onboarding/OnboardingStep3';
import { OnboardingStep4 } from '@/components/onboarding/OnboardingStep4';
import { OnboardingPreview } from '@/components/onboarding/OnboardingPreview';

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial URL from navigation state (from homepage) - do this synchronously
  const initialUrl = useMemo(() => {
    const state = location.state as { url?: string } | null;
    return state?.url || '';
  }, [location.state]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isScrapingComplete, setIsScrapingComplete] = useState(false);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    url: initialUrl,
    scrapedData: null,
    context: '',
    selectedPersonas: [],
    selectedObjectives: [],
    selectedAgents: [],
    workEmail: '',
  });

  const handleUrlSubmit = (url: string) => {
    setOnboardingData(prev => ({ ...prev, url }));
  };

  const handleScrapingComplete = (data: ScrapedData) => {
    setOnboardingData(prev => ({
      ...prev,
      scrapedData: data,
      context: data.summary,
    }));
    setIsScrapingComplete(true);
  };

  const handleContextChange = (context: string) => {
    setOnboardingData(prev => ({ ...prev, context }));
  };

  const handlePersonaToggle = (personaId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedPersonas: prev.selectedPersonas.includes(personaId)
        ? prev.selectedPersonas.filter(id => id !== personaId)
        : [...prev.selectedPersonas, personaId],
    }));
  };

  const handleObjectiveToggle = (objectiveId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedObjectives: prev.selectedObjectives.includes(objectiveId)
        ? prev.selectedObjectives.filter(id => id !== objectiveId)
        : [...prev.selectedObjectives, objectiveId],
    }));
  };

  const handleAgentToggle = (agentId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedAgents: prev.selectedAgents.includes(agentId)
        ? prev.selectedAgents.filter(id => id !== agentId)
        : [...prev.selectedAgents, agentId],
    }));
  };

  const handleEmailChange = (email: string) => {
    setOnboardingData(prev => ({ ...prev, workEmail: email }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // Navigate back to homepage when on step 0
      navigate('/');
    }
  };

  const handleComplete = () => {
    // Save to localStorage for dashboard
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    navigate('/dashboard');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return isScrapingComplete;
      case 1:
        return onboardingData.context.length > 10;
      case 2:
        return onboardingData.selectedPersonas.length > 0;
      case 3:
        return onboardingData.selectedObjectives.length > 0;
      case 4:
        return onboardingData.selectedAgents.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <OnboardingStep0
            initialUrl={initialUrl}
            url={onboardingData.url}
            onUrlSubmit={handleUrlSubmit}
            onScrapingComplete={handleScrapingComplete}
            isComplete={isScrapingComplete}
          />
        );
      case 1:
        return (
          <OnboardingStep1
            context={onboardingData.context}
            onContextChange={handleContextChange}
            scrapedData={onboardingData.scrapedData}
          />
        );
      case 2:
        return (
          <OnboardingStep2
            selectedPersonas={onboardingData.selectedPersonas}
            onPersonaToggle={handlePersonaToggle}
            scrapedData={onboardingData.scrapedData}
          />
        );
      case 3:
        return (
          <OnboardingStep3
            selectedObjectives={onboardingData.selectedObjectives}
            onObjectiveToggle={handleObjectiveToggle}
            selectedPersonas={onboardingData.selectedPersonas}
            scrapedData={onboardingData.scrapedData}
          />
        );
      case 4:
        return (
          <OnboardingStep4
            selectedAgents={onboardingData.selectedAgents}
            onAgentToggle={handleAgentToggle}
            workEmail={onboardingData.workEmail}
            onEmailChange={handleEmailChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left panel - Form */}
        <div className="w-1/2 flex flex-col border-r border-border">
          <OnboardingStepper
            currentStep={currentStep}
            isScrapingComplete={isScrapingComplete}
          />
          
          <div className="flex-1 overflow-y-auto p-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-border flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Back
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Start Analysis
              </button>
            )}
          </div>
        </div>

        {/* Right panel - Preview */}
        <div className="w-1/2 bg-muted/30">
          <OnboardingPreview
            url={onboardingData.url}
            scrapedData={onboardingData.scrapedData}
            isScrapingComplete={isScrapingComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;