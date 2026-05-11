import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Settings, 
  Store, 
  ShoppingBag, 
  BarChart, 
  Globe,
  CreditCard,
  Users,
  FileText,
  Bot,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Stores', href: '/admin/stores', icon: Store },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
    { name: 'Countries', href: '/admin/countries', icon: Globe },
    { name: 'Auto-Pilot', href: '/admin/auto-pilot', icon: Bot },
    { name: 'Shopify', href: '/admin/shopify', icon: ShoppingBag },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="bg-white shadow-sm py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/admin">
            <a className="font-bold text-xl text-blue-600 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Tesco Compare Admin
            </a>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/">
            <a className="text-sm text-gray-600 hover:text-gray-900">View Site</a>
          </Link>
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
            A
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <nav className={cn(
          "w-64 border-r bg-white p-4 hidden lg:block",
        )}>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
            <nav className="fixed top-0 left-0 bottom-0 w-64 bg-white p-4 z-50">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-xl text-blue-600">Admin</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className={cn(
                          "mr-3 h-5 w-5",
                          isActive ? "text-blue-600" : "text-gray-400"
                        )} />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}