import { useState } from 'react';
import { CommentBalloon } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { MessageCircle, X } from 'lucide-react';

interface DashboardPreviewProps {
  url: string;
  balloons: CommentBalloon[];
  selectedBalloon: string | null;
  onBalloonClick: (id: string) => void;
}

export const DashboardPreview = ({
  url,
  balloons,
  selectedBalloon,
  onBalloonClick,
}: DashboardPreviewProps) => {
  const [isAddingBalloon, setIsAddingBalloon] = useState(false);

  const getScreenshotUrl = (siteUrl: string) => {
    const encodedUrl = encodeURIComponent(siteUrl);
    return `https://image.thum.io/get/width/1200/crop/800/noanimate/${encodedUrl}`;
  };

  const getPriorityColor = (priority: CommentBalloon['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-brand-orange text-primary-foreground';
      case 'low':
        return 'bg-brand-green text-primary-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Browser chrome */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-brand-orange/60" />
            <div className="w-3 h-3 rounded-full bg-brand-green/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-background rounded-md px-3 py-1.5 text-sm text-muted-foreground truncate">
              {url}
            </div>
          </div>
          <button
            onClick={() => setIsAddingBalloon(!isAddingBalloon)}
            className={cn(
              'p-2 rounded-md transition-colors',
              isAddingBalloon
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            )}
            title="Add comment"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Preview with balloons */}
        <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
          <img
            src={getScreenshotUrl(url)}
            alt="Website preview"
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />

          {/* Comment balloons overlay */}
          {balloons.map((balloon) => (
            <div
              key={balloon.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${balloon.x}%`, top: `${balloon.y}%` }}
            >
              {/* Balloon pin */}
              <button
                onClick={() => onBalloonClick(balloon.id)}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer',
                  getPriorityColor(balloon.priority),
                  selectedBalloon === balloon.id && 'ring-4 ring-primary/30 scale-110'
                )}
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              {/* Expanded balloon */}
              {selectedBalloon === balloon.id && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 bg-card rounded-lg shadow-xl border border-border p-4 z-20 animate-fade-in">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{balloon.agentName}</p>
                      <h4 className="font-medium text-foreground">{balloon.title}</h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBalloonClick(balloon.id);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{balloon.content}</p>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs',
                        balloon.priority === 'high' && 'bg-destructive/10 text-destructive',
                        balloon.priority === 'medium' && 'bg-brand-orange/10 text-brand-orange',
                        balloon.priority === 'low' && 'bg-brand-green/10 text-brand-green'
                      )}
                    >
                      {balloon.priority} priority
                    </span>
                    <button className="text-xs text-primary hover:underline">
                      View details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
