import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const items = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/tickets', icon: Ticket, label: 'Tickets' },
  { path: '/tickets/new', icon: Plus, label: 'New' },
  { path: '/admin/users', icon: Users, label: 'Users', adminOnly: true },
];

export default function MobileNav() {
  const location = useLocation();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center justify-around h-14">
      {items.filter((i) => !i.adminOnly || isAdmin).map((item) => {
        let active = false;
        if (item.path === '/tickets') {
          // Highlight for both /tickets and /tickets?view=all, but NOT /tickets/new or /tickets/:id
          active = location.pathname === '/tickets';
        } else if (item.path === '/tickets/new') {
          active = location.pathname === '/tickets/new';
        } else {
          active = location.pathname === item.path;
        }
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-0.5 text-xs transition-colors',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
