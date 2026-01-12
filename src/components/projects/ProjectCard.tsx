import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ExternalLink, Trash2, Edit, Globe } from 'lucide-react';
import { Project } from '@/hooks/useProjects';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const getScreenshotUrl = (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    return `https://image.thum.io/get/width/600/crop/400/noanimate/${encodedUrl}`;
  };

  const screenshotSrc = project.screenshot_url || 
    (project.primary_url ? getScreenshotUrl(project.primary_url) : null);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/projects/${project.id}`}>
        <div className="aspect-video bg-muted relative overflow-hidden">
          {screenshotSrc ? (
            <img
              src={screenshotSrc}
              alt={project.name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Globe className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link to={`/projects/${project.id}`}>
              <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                {project.name}
              </h3>
            </Link>
            {project.primary_url && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {project.primary_url}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{project.url_count || 0} URLs</span>
              <span>•</span>
              <span>Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {project.primary_url && (
                <DropdownMenuItem asChild>
                  <a href={project.primary_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open URL
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(project.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
