import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 md:py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
