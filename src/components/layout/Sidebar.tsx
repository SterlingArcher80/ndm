
import { LogOut, Settings, Sun, Moon, Monitor, Package, FileText, Factory } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { useThemePreference } from '../hooks/useThemePreference';

// Helper to validate theme
const allowedThemes = ["light", "dark", "system"] as const;
type Theme = typeof allowedThemes[number];
function normalizeTheme(theme: string): Theme {
  return allowedThemes.includes(theme as Theme) ? (theme as Theme) : "system";
}

const ThemeSelector = () => {
  const { theme, setTheme } = useThemePreference();
  const options = [
    { name: 'System', value: 'system' as Theme, icon: Monitor },
    { name: 'Light', value: 'light' as Theme, icon: Sun },
    { name: 'Dark', value: 'dark' as Theme, icon: Moon },
  ];

  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-500 pl-1 mb-1">Theme</label>
      <div className="flex gap-1">
        {options.map(({ name, value, icon: Icon }) => (
          <button
            key={value}
            aria-label={`Switch to ${name} mode`}
            className={`flex-1 flex items-center gap-1 px-2 py-1 rounded transition
              ${theme === value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}
            `}
            onClick={() => setTheme(value)}
            type="button"
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs">{name}</span>
          </button>
        ))}
      </div>
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
    title: "Work Orders",
    url: "/work-orders",
    icon: FileText,
  },
  {
    title: "Manufacturing",
    url: "/analytics",
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
        <h2 className="text-lg font-semibold">Nucleus</h2>
        <p className="text-sm text-gray-600">- powered by DMSI</p>
      </SidebarHeader>
      <SidebarContent className="bg-gray-100 dark:bg-gray-900">
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
      <SidebarFooter className="p-4 bg-gray-100 dark:bg-gray-900">
        <div className="mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</p>
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
