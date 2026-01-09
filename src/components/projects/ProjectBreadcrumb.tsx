import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface ProjectBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const ProjectBreadcrumb = ({ items }: ProjectBreadcrumbProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
            onClick={items[0]?.onClick}
          >
            <Home className="w-4 h-4" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            {index === items.length - 1 ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={item.onClick}
              >
                {item.label}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
