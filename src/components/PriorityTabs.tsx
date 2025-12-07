import { cn } from '@/lib/utils';
import { Priority, PRIORITY_CONFIG } from '@/types/analysis';

interface PriorityTabsProps {
  activePriority: Priority | 'all';
  onPriorityChange: (priority: Priority | 'all') => void;
  counts: Record<Priority | 'all', number>;
}

export const PriorityTabs = ({ activePriority, onPriorityChange, counts }: PriorityTabsProps) => {
  const tabs: Array<{ id: Priority | 'all'; label: string; color: string }> = [
    { id: 'all', label: 'All', color: 'bg-foreground text-background' },
    { id: 'high', label: 'High', color: 'bg-coral text-primary-foreground' },
    { id: 'medium', label: 'Medium', color: 'bg-electric text-primary-foreground' },
    { id: 'low', label: 'Low', color: 'bg-teal text-primary-foreground' },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onPriorityChange(tab.id)}
          className={cn(
            'px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover-bounce',
            activePriority === tab.id
              ? tab.color
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {tab.label}
          <span className={cn(
            'ml-2 px-2 py-0.5 rounded-full text-xs',
            activePriority === tab.id
              ? 'bg-background/20'
              : 'bg-background'
          )}>
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  );
};
