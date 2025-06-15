
import { Bell, FileText, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';

const TopNavbar = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/work-orders':
        return 'Work Orders';
      case '/inventory':
        return 'Inventory System';
      case '/':
        return 'Dashboard';
      case '/analytics':
        return 'Analytics';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/work-orders">
          <Button variant="ghost" className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Work Orders
          </Button>
        </Link>
        
        <Link to="/inventory">
          <Button variant="ghost" className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory System
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default TopNavbar;
