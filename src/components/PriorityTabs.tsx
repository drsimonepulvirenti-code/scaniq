import { cn } from '@/lib/utils';
import { Priority } from '@/types/analysis';

interface PriorityTabsProps {
  activePriority: Priority | 'all';
  onPriorityChange: (priority: Priority | 'all') => void;
  counts: Record<Priority | 'all', number>;
}

export const PriorityTabs = ({ activePriority, onPriorityChange, counts }: PriorityTabsProps) => {
  const tabs: Array<{ id: Priority | 'all'; label: string; activeClass: string }> = [
    { id: 'all', label: 'All', activeClass: 'bg-foreground text-background' },
    { id: 'high', label: 'High', activeClass: 'bg-destructive text-destructive-foreground' },
    { id: 'medium', label: 'Medium', activeClass: 'bg-primary text-primary-foreground' },
    { id: 'low', label: 'Low', activeClass: 'bg-brand-green text-primary-foreground' },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onPriorityChange(tab.id)}
          className={cn(
            'px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
            activePriority === tab.id
              ? tab.activeClass
              : 'bg-muted text-muted-foreground hover:bg-accent'
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
