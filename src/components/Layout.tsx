import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CircleUser, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu when location changes (mobile navigation)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu button */}
      {isMobile ? (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
              <Menu size={24} />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <aside className="hidden md:block w-64 border-r border-border h-screen sticky top-0">
          <Sidebar />
        </aside>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? (
                <div className="i-lucide-sun h-5 w-5" />
              ) : (
                <div className="i-lucide-moon h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="ghost" size="icon">
              <CircleUser size={24} />
              <span className="sr-only">User profile</span>
            </Button>
          </div>
        </Header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}