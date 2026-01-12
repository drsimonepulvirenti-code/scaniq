import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ProjectBreadcrumbProps {
  projectId?: string;
  projectName?: string;
  urlId?: string;
  urlName?: string;
}

export const ProjectBreadcrumb = ({
  projectId,
  projectName,
  urlId,
  urlName,
}: ProjectBreadcrumbProps) => {
  // Truncate long names
  const truncate = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {projectId ? (
            <BreadcrumbLink asChild>
              <Link to="/projects">All Projects</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>All Projects</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {projectId && projectName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {urlId ? (
                <BreadcrumbLink asChild>
                  <Link to={`/projects/${projectId}`} title={projectName}>
                    {truncate(projectName)}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage title={projectName}>
                  {truncate(projectName)}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {urlId && urlName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage title={urlName}>
                {truncate(urlName, 40)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
