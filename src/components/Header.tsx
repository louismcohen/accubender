import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const location = useLocation();
  
  // Generate title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Job Queue';
    if (path.includes('job-pending')) return 'Job Ready';
    if (path.includes('job-in-progress')) return 'Bending In Progress';
    if (path.includes('inspection-pending')) return 'Inspection Ready';
    if (path.includes('inspection-results')) return 'Inspection Results';
    if (path.includes('rework')) return 'Rework Job';
    return 'AccuBender';
  };

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 backdrop-blur",
      "transition-colors duration-200"
    )}>
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-accent" />
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
    </header>
  );
}