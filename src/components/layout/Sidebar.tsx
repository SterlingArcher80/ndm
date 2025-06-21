
import { LogOut, Settings, Sun, Moon, Monitor, Package, FileText, Factory, Layers, FolderOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useThemePreference } from '../hooks/useThemePreference';

// Helper to validate theme
const allowedThemes = ["light", "dark", "default"] as const;
type Theme = typeof allowedThemes[number];

const ThemeSelector = () => {
  const { theme, setTheme } = useThemePreference();
  
  const themeOptions = [
    { name: 'Default', value: 'default' as Theme, icon: Monitor },
    { name: 'Light', value: 'light' as Theme, icon: Sun },
    { name: 'Dark', value: 'dark' as Theme, icon: Moon },
  ];

  const currentTheme = themeOptions.find(option => option.value === theme);

  return (
    <div className="mb-4">
      <label className="block text-xs text-muted-foreground pl-1 mb-2">Theme</label>
      <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              {currentTheme && <currentTheme.icon className="w-4 h-4" />}
              <span>{currentTheme?.name || 'Default'}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {themeOptions.map(({ name, value, icon: Icon }) => (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Navigation menu items - matching top navigation
const navigationItems = [
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "BOM",
    url: "/bom",
    icon: Layers,
  },
  {
    title: "Work Orders",
    url: "/work-orders",
    icon: FileText,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FolderOpen,
  },
  {
    title: "Manufacturing",
    url: "/manufacturing",
    icon: Factory,
  },
];

const AppSidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 pb-0">
        <h2 className="text-lg font-semibold text-foreground">Nucleus</h2>
        <p className="text-sm text-muted-foreground">- powered by DMSI</p>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        {/* Theme selector above main navigation */}
        <ThemeSelector />
        
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-sidebar">
        <div className="mb-2">
          <p className="text-sm text-sidebar-foreground">{user?.email}</p>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
