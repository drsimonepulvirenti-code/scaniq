import { Check, Globe, FileText, Users, Target, Bot } from 'lucide-react';

interface OnboardingStepperProps {
  currentStep: number;
  isScrapingComplete: boolean;
}

const steps = [
  { id: 0, label: 'Add Page', icon: Globe },
  { id: 1, label: 'Context', icon: FileText },
  { id: 2, label: 'Customers', icon: Users },
  { id: 3, label: 'Objectives', icon: Target },
  { id: 4, label: 'Agents', icon: Bot },
];

export const OnboardingStepper = ({ currentStep, isScrapingComplete }: OnboardingStepperProps) => {
  return (
    <div className="px-8 py-6 border-b border-border">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep || (step.id === 0 && isScrapingComplete && currentStep > 0);
          const isCurrent = step.id === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary/10 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-16 mx-2 mt-[-20px] ${
                    step.id < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
