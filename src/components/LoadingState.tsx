import { useEffect, useState } from 'react';

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
      <div className="relative w-32 h-32 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-coral border-r-electric animate-spin" 
          style={{ animationDuration: '1.5s' }} 
        />
        
        {/* Inner glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-coral/20 via-electric/20 to-sunny/20 animate-pulse-soft" />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>✨</span>
        </div>
      </div>

      <h3 className="text-xl font-fredoka font-semibold mb-2">Analyzing Website</h3>
      <p className="text-muted-foreground animate-pulse-soft" key={messageIndex}>
        {messages[messageIndex]}
      </p>
    </div>
  );
};
