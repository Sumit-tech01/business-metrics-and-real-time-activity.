import { useMemo } from 'react';
import { Boxes, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { InlineLoader } from '../components/common/Loader';
import { MonthlySalesChart } from '../components/charts/MonthlySalesChart';
import { RevenueExpenseChart } from '../components/charts/RevenueExpenseChart';
import { ActivityLogWidget } from '../components/dashboard/ActivityLogWidget';
import { AlertsWidget } from '../components/dashboard/AlertsWidget';
import { ChartCard } from '../components/dashboard/ChartCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { StatCard } from '../components/dashboard/StatCard';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useNotifications } from '../hooks/useNotifications';
import { useUiStore } from '../store/uiStore';
import { formatCurrency } from '../utils/formatters';

const DashboardPage = () => {
  const { isLoading, hasError, kpiData, transactionsData, customersData, inventoryData, appointmentsData } =
    useDashboardMetrics();
  const {
    notifications,
    loading: notificationsLoading,
    lowStockItems,
    upcomingAppointments,
  } = useNotifications();
  const { logs: recentLogs, loading: logsLoading } = useActivityLogs({ limit: 5 });
  const searchQuery = useUiStore((state) => state.searchQuery);
  const todayDate = new Date().toISOString().slice(0, 10);

  const todayOrders = useMemo(
    () => appointmentsData.appointments.filter((appointment) => appointment.date === todayDate).length,
    [appointmentsData.appointments, todayDate],
  );

  const ordersChartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateKey = date.toISOString().slice(0, 10);
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        month: label,
        dateKey,
        sales: 0,
      };
    });

    const mapByDate = Object.fromEntries(days.map((item) => [item.dateKey, item]));

    appointmentsData.appointments.forEach((item) => {
      if (mapByDate[item.date]) {
        mapByDate[item.date].sales += 1;
      }
    });

    return days.map(({ month, sales }) => ({ month, sales }));
  }, [appointmentsData.appointments]);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="space-y-6">
        <header className="rounded-xl border border-slate-200 bg-white p-4 shadow dark:bg-gray-800">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Clean SaaS view of your business metrics and real-time activity.
          </p>
        </header>

        {hasError ? <p className="rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700">{hasError}</p> : null}

        <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Sales" value={formatCurrency(kpiData.revenue)} icon={DollarSign} accent="emerald" />
          <StatCard title="Total Customers" value={customersData.customers.length} icon={Users} accent="blue" />
          <StatCard title="Total Products" value={inventoryData.products.length} icon={Boxes} accent="amber" />
          <StatCard title="Today Orders" value={todayOrders} icon={ShoppingCart} accent="slate" />
        </section>

        {isLoading ? <InlineLoader label="Loading dashboard analytics..." /> : null}

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Revenue Chart" subtitle="Revenue vs expense (last 6 months)">
            {transactionsData.monthlyOverview.length ? (
              <RevenueExpenseChart data={transactionsData.monthlyOverview} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-500 dark:text-slate-300">No revenue data available.</div>
            )}
          </ChartCard>

          <ChartCard title="Orders Chart" subtitle="Last 7 days">
            {ordersChartData.length ? (
              <MonthlySalesChart data={ordersChartData} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-500 dark:text-slate-300">No orders data available.</div>
            )}
          </ChartCard>
        </section>

        <section className="mt-6">
          <AlertsWidget
            lowStockItems={lowStockItems}
            upcomingAppointments={upcomingAppointments}
            notifications={notifications}
            loading={notificationsLoading}
          />
        </section>

        <section className="mt-6">
          <ActivityLogWidget logs={recentLogs} loading={logsLoading} />
        </section>

        <section className="mt-6">
          <RecentActivity
            transactions={transactionsData.recentTransactions}
            query={searchQuery}
          />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
