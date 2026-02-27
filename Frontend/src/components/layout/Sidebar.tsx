import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard, Ticket, LayoutList, Users, LogOut, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Tickets', path: '/tickets', icon: Ticket },
  { label: 'All Tickets', path: '/tickets?view=all', icon: LayoutList, adminOnly: true },
  { label: 'Users', path: '/admin/users', icon: Users, adminOnly: true },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const currentFull = location.pathname + location.search;

  const isActive = (itemPath: string) => {
    if (itemPath === '/tickets?view=all') {
      return currentFull === '/tickets?view=all';
    }
    if (itemPath === '/tickets') {
      // Active when on /tickets WITHOUT ?view=all
      return location.pathname === '/tickets' && location.search !== '?view=all';
    }
    return location.pathname === itemPath;
  };

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-card border-r border-border h-screen sticky top-0 shrink-0">
      {/* Branding */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-foreground tracking-tight">TicketFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.filter((i) => !i.adminOnly || isAdmin).map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

