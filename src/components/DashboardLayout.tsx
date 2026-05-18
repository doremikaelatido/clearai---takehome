import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex h-full gap-0">
      <Sidebar />

      {/* Main content area - offset by sidebar width */}
      <main className="ml-64 flex-1">
        <div className="p-8 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
