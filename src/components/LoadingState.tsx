import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const messages = [
  "Fetching website content...",
  "Analyzing visual design...",
  "Checking usability patterns...",
  "Reviewing accessibility...",
  "Evaluating performance...",
  "Generating recommendations...",
];

export const LoadingState = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" 
          style={{ animationDuration: '1s' }} 
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">Analyzing Website</h3>
      <p className="text-muted-foreground animate-pulse" key={messageIndex}>
        {messages[messageIndex]}
      </p>
    </div>
  );
};
