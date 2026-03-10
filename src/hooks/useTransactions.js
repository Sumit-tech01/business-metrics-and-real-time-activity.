import { useMemo } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { useCollection } from './useCollection';
import {
  createTransaction,
  deleteTransaction,
  normalizeTransactions,
  updateTransaction,
} from '../services/transactionsService';

export const useTransactions = () => {
  const resource = useCollection('transactions', {
    mapData: normalizeTransactions,
    createFn: createTransaction,
    updateFn: updateTransaction,
    removeFn: deleteTransaction,
    entityName: 'Transaction',
  });

  const totals = useMemo(() => {
    return resource.items.reduce(
      (accumulator, item) => {
        if (item.type === 'income') {
          accumulator.revenue += Number(item.amount) || 0;
        }

        if (item.type === 'expense') {
          accumulator.expenses += Number(item.amount) || 0;
        }

        return accumulator;
      },
      { revenue: 0, expenses: 0 },
    );
  }, [resource.items]);

  const monthlyOverview = useMemo(() => {
    const monthBuckets = Array.from({ length: 6 }, (_, index) => {
      const monthDate = startOfMonth(subMonths(new Date(), 5 - index));
      return {
        key: format(monthDate, 'yyyy-MM'),
        month: format(monthDate, 'MMM'),
        revenue: 0,
        expenses: 0,
      };
    });

    const byMonthKey = Object.fromEntries(monthBuckets.map((month) => [month.key, month]));

    resource.items.forEach((item) => {
      const rawDate = item.date || item.createdAt;
      const parsedDate = rawDate ? new Date(rawDate) : null;

      if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        return;
      }

      const key = format(parsedDate, 'yyyy-MM');

      if (!byMonthKey[key]) {
        return;
      }

      if (item.type === 'income') {
        byMonthKey[key].revenue += Number(item.amount) || 0;
      } else {
        byMonthKey[key].expenses += Number(item.amount) || 0;
      }
    });

    return monthBuckets;
  }, [resource.items]);

  const monthlySales = useMemo(
    () => monthlyOverview.map((item) => ({ month: item.month, sales: item.revenue })),
    [monthlyOverview],
  );

  const expenseByCategory = useMemo(() => {
    const categoryMap = new Map();

    resource.items.forEach((item) => {
      if (item.type !== 'expense') {
        return;
      }

      const category = item.category || 'Other';
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + (Number(item.amount) || 0));
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [resource.items]);

  const recentTransactions = useMemo(() => resource.items.slice(0, 8), [resource.items]);

  return {
    ...resource,
    transactions: resource.items,
    totals,
    netProfit: totals.revenue - totals.expenses,
    monthlyOverview,
    monthlySales,
    expenseByCategory,
    recentTransactions,
  };
};
