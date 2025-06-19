
import { FileText, Package, Factory, Layers, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "BOM", path: "/bom", icon: Layers },
  { label: "Work Orders", path: "/work-orders", icon: FileText },
  { label: "Documents", path: "/documents", icon: FolderOpen },
  { label: "Manufacturing", path: "/analytics", icon: Factory },
];

const TopNavbar = () => {
  const location = useLocation();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white dark:bg-gray-950 px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        {/* Page title removed as requested */}
      </div>
      <div className="flex items-center gap-2">
        {NAV_LINKS.map(({ label, path, icon: Icon }) => {
          const isActive =
            location.pathname === path ||
            (label === "Manufacturing" && location.pathname === "/analytics");
          return (
            <Link to={path} key={label}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`flex items-center gap-2 ${
                  isActive
                    ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-50"
                    : ""
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405C18.21 15.206 18 14.698 18 14.167V11A6.002 6.002 0 006 11v3.167c0 .53-.21 1.039-.595 1.428L4 17h5"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.73 21a2 2 0 01-3.46 0"
            />
          </svg>
        </Button>
      </div>
    </header>
  );
};

export default TopNavbar;
