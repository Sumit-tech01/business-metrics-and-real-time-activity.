import {
  BarChart3,
  Archive,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Package2,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useCompany } from '../hooks/useCompany';
import { NAV_ITEMS } from '../utils/constants';
import { useUiStore } from '../store/uiStore';
import { cn } from '../utils/cn';

const iconMap = {
  Dashboard: LayoutDashboard,
  Company: Building2,
  Users: User,
  Money: CreditCard,
  Customers: Users,
  Products: Package2,
  Orders: CalendarDays,
  Activity: ClipboardList,
  Reports: BarChart3,
  Backup: Archive,
  Settings,
};

const NavItem = ({ item, collapsed, onNavigate }) => {
  const Icon = iconMap[item.name] ?? LayoutDashboard;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-white/14 text-white shadow-sm ring-1 ring-white/20'
            : 'text-slate-300 hover:bg-gray-800 hover:text-white',
          collapsed && 'justify-center',
        )
      }
      end={item.path === '/'}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span>{item.name}</span> : null}
    </NavLink>
  );
};

export const Sidebar = () => {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen);
  const toggleSidebarCollapsed = useUiStore((state) => state.toggleSidebarCollapsed);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);
  const { role } = useCompany();
  const currentRole = role === 'admin' ? 'admin' : 'staff';
  const navItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(currentRole)),
    [currentRole],
  );

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/50 transition-opacity lg:hidden',
          mobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileSidebarOpen(false)}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-800 bg-gray-900 px-3 py-4 transition-transform lg:static lg:z-auto lg:translate-x-0',
          sidebarCollapsed && 'lg:w-24',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center lg:w-full')}>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-bold text-gray-900">
              E
            </div>
            {!sidebarCollapsed ? (
              <div>
                <p className="font-display text-lg font-semibold text-white">ERP Pulse</p>
                <p className="text-xs text-slate-400">SaaS Control</p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="hidden rounded-lg p-1.5 text-slate-300 hover:bg-gray-800 lg:inline-flex"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              collapsed={sidebarCollapsed}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          ))}
        </nav>

        {!sidebarCollapsed ? (
          <div className="mx-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-300">
            <p className="font-medium text-white">Workspace</p>
            <p className="mt-1 text-slate-400">Production ERP Panel</p>
          </div>
        ) : null}
      </aside>
    </>
  );
};
