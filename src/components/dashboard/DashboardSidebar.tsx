import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  FolderOpen, 
  Route, 
  FlaskConical, 
  Brain, 
  LogOut, 
  Settings,
  ChevronDown,
  Database,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ViewType = 'projects' | 'journeys' | 'experiments' | 'intelligence';

interface DashboardSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const DashboardSidebar = ({ currentView, onViewChange }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { id: 'projects' as const, label: 'My Projects', icon: FolderOpen },
    { id: 'journeys' as const, label: 'Journeys', icon: Route },
    { id: 'experiments' as const, label: 'Experiments', icon: FlaskConical },
  ];

  const intelligenceItems = [
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-sidebar-foreground">Collabase</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      'w-full',
                      currentView === item.id && 'bg-sidebar-accent text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Intelligence with nested items */}
              <Collapsible open={intelligenceOpen} onOpenChange={setIntelligenceOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        'w-full',
                        currentView === 'intelligence' && 'bg-sidebar-accent text-sidebar-accent-foreground'
                      )}
                    >
                      <Brain className="w-5 h-5" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">Intelligence</span>
                          <ChevronDown className={cn(
                            'w-4 h-4 transition-transform',
                            intelligenceOpen && 'rotate-180'
                          )} />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  {!isCollapsed && (
                    <CollapsibleContent className="pl-6 mt-1 space-y-1">
                      {intelligenceItems.map((subItem) => (
                        <SidebarMenuButton
                          key={subItem.id}
                          onClick={() => onViewChange('intelligence')}
                          className="w-full text-sm"
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.label}</span>
                        </SidebarMenuButton>
                      ))}
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <SidebarMenuButton className="flex-1">
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span>Settings</span>}
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
