import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { InstallBanner } from '../InstallBanner';

export function AppShell() {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-gray-50">
      <main className="flex-1 overflow-y-auto">
        <InstallBanner />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
