import { format, startOfMonth, subMonths } from 'date-fns';

const DEFAULT_MONTH_WINDOW = 6;

const toDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseRangeBoundary = (value, endOfDay = false) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeDateRange = (dateRange = {}) => {
  const fromDate = parseRangeBoundary(dateRange.from);
  const toDateValue = parseRangeBoundary(dateRange.to, true);

  if (fromDate && toDateValue && fromDate > toDateValue) {
    return {
      from: parseRangeBoundary(dateRange.to),
      to: parseRangeBoundary(dateRange.from, true),
    };
  }

  return {
    from: fromDate,
    to: toDateValue,
  };
};

const isInDateRange = (date, range) => {
  if (!range.from && !range.to) {
    return true;
  }

  if (!date) {
    return false;
  }

  if (range.from && date < range.from) {
    return false;
  }

  if (range.to && date > range.to) {
    return false;
  }

  return true;
};

const getRecordDate = (record, keys = []) => {
  for (const key of keys) {
    const parsed = toDate(record?.[key]);

    if (parsed) {
      return parsed;
    }
  }

  return null;
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const matchesCustomerFilter = (value, customerFilter) => {
  const normalizedFilter = normalizeText(customerFilter);

  if (!normalizedFilter || normalizedFilter === 'all') {
    return true;
  }

  return normalizeText(value) === normalizedFilter;
};

const toMonthKey = (date) => format(startOfMonth(date), 'yyyy-MM');

const buildMonthBuckets = (dates, range) => {
  const validDates = dates.filter(Boolean).sort((left, right) => left - right);

  let fromDate = range.from ? startOfMonth(range.from) : null;
  let toDateValue = range.to ? startOfMonth(range.to) : null;

  if (!fromDate && validDates.length) {
    fromDate = startOfMonth(validDates[0]);
  }

  if (!toDateValue && validDates.length) {
    toDateValue = startOfMonth(validDates.at(-1));
  }

  if (!fromDate || !toDateValue) {
    toDateValue = startOfMonth(new Date());
    fromDate = startOfMonth(subMonths(toDateValue, DEFAULT_MONTH_WINDOW - 1));
  }

  if (fromDate > toDateValue) {
    const temp = fromDate;
    fromDate = toDateValue;
    toDateValue = temp;
  }

  const buckets = [];
  const cursor = new Date(fromDate);

  while (cursor <= toDateValue && buckets.length < 24) {
    buckets.push({
      key: format(cursor, 'yyyy-MM'),
      month: format(cursor, 'MMM yyyy'),
      revenue: 0,
      expenses: 0,
      sales: 0,
      customers: 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
    cursor.setDate(1);
  }

  return buckets;
};

export const buildFinanceReport = (transactions = [], filters = {}) => {
  const dateRange = normalizeDateRange(filters.dateRange);
  const typeFilter = normalizeText(filters.type);

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = getRecordDate(transaction, ['date', 'createdAt', 'updatedAt']);

    if (!isInDateRange(transactionDate, dateRange)) {
      return false;
    }

    if (typeFilter && typeFilter !== 'all' && normalizeText(transaction.type) !== typeFilter) {
      return false;
    }

    if (!matchesCustomerFilter(transaction.customerName, filters.customer)) {
      return false;
    }

    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort((left, right) => {
    const leftDate = getRecordDate(left, ['date', 'createdAt', 'updatedAt'])?.getTime() || 0;
    const rightDate = getRecordDate(right, ['date', 'createdAt', 'updatedAt'])?.getTime() || 0;
    return rightDate - leftDate;
  });

  const monthBuckets = buildMonthBuckets(
    sortedTransactions.map((transaction) => getRecordDate(transaction, ['date', 'createdAt', 'updatedAt'])),
    dateRange,
  );

  const monthMap = Object.fromEntries(monthBuckets.map((bucket) => [bucket.key, bucket]));
  const expenseByCategory = new Map();

  let revenue = 0;
  let expenses = 0;

  sortedTransactions.forEach((transaction) => {
    const amount = Number(transaction.amount) || 0;
    const type = normalizeText(transaction.type) || 'expense';

    if (type === 'income') {
      revenue += amount;
    } else {
      expenses += amount;
      const category = transaction.category || 'Other';
      expenseByCategory.set(category, (expenseByCategory.get(category) || 0) + amount);
    }

    const date = getRecordDate(transaction, ['date', 'createdAt', 'updatedAt']);

    if (!date) {
      return;
    }

    const month = monthMap[toMonthKey(date)];

    if (!month) {
      return;
    }

    if (type === 'income') {
      month.revenue += amount;
      month.sales += amount;
    } else {
      month.expenses += amount;
    }
  });

  const chartRevenueExpense = monthBuckets.map((item) => ({
    month: item.month,
    revenue: item.revenue,
    expenses: item.expenses,
  }));

  const chartMonthlySales = monthBuckets.map((item) => ({
    month: item.month,
    sales: item.sales,
  }));

  const chartExpenseCategory = Array.from(expenseByCategory.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);

  const tableRows = sortedTransactions.map((transaction) => ({
    id: transaction.id,
    date: transaction.date || transaction.createdAt || '',
    title: transaction.title || 'Transaction',
    type: transaction.type || 'expense',
    category: transaction.category || 'Other',
    customer: transaction.customerName || 'General',
    amount: Number(transaction.amount) || 0,
    note: transaction.notes || '',
  }));

  return {
    totals: {
      revenue,
      expenses,
      netProfit: revenue - expenses,
    },
    chartRevenueExpense,
    chartMonthlySales,
    chartExpenseCategory,
    tableRows,
  };
};

export const buildCustomerReport = (customers = [], filters = {}) => {
  const dateRange = normalizeDateRange(filters.dateRange);

  const filteredCustomers = customers.filter((customer) => {
    const customerDate = getRecordDate(customer, ['createdAt', 'updatedAt']);

    if (!isInDateRange(customerDate, dateRange)) {
      return false;
    }

    if (!matchesCustomerFilter(customer.name, filters.customer)) {
      return false;
    }

    return true;
  });

  const sortedCustomers = [...filteredCustomers].sort((left, right) =>
    normalizeText(left.name).localeCompare(normalizeText(right.name)),
  );

  const monthBuckets = buildMonthBuckets(
    sortedCustomers.map((customer) => getRecordDate(customer, ['createdAt', 'updatedAt'])),
    dateRange,
  );
  const monthMap = Object.fromEntries(monthBuckets.map((bucket) => [bucket.key, bucket]));

  sortedCustomers.forEach((customer) => {
    const customerDate = getRecordDate(customer, ['createdAt', 'updatedAt']);

    if (!customerDate) {
      return;
    }

    const month = monthMap[toMonthKey(customerDate)];

    if (month) {
      month.customers += 1;
    }
  });

  const chartNewCustomers = monthBuckets.map((item) => ({
    month: item.month,
    count: item.customers,
  }));

  const tableRows = sortedCustomers.map((customer) => ({
    id: customer.id,
    name: customer.name || 'Customer',
    email: customer.email || '--',
    phone: customer.phone || '--',
    status: customer.status || 'active',
    createdAt: customer.createdAt || customer.updatedAt || '',
  }));

  return {
    totalCustomers: sortedCustomers.length,
    chartNewCustomers,
    tableRows,
  };
};

export const buildInventoryReport = (products = [], filters = {}) => {
  const dateRange = normalizeDateRange(filters.dateRange);

  const filteredProducts = products.filter((product) => {
    const productDate = getRecordDate(product, ['updatedAt', 'createdAt']);
    return isInDateRange(productDate, dateRange);
  });

  const sortedProducts = [...filteredProducts].sort((left, right) =>
    normalizeText(left.name).localeCompare(normalizeText(right.name)),
  );

  const lowStockItems = sortedProducts.filter(
    (product) => Number(product.stock) <= Number(product.lowStockThreshold ?? product.lowStockLimit ?? 10),
  );

  const stockValue = sortedProducts.reduce(
    (sum, product) => sum + (Number(product.stock) || 0) * (Number(product.price) || 0),
    0,
  );

  const stockByCategory = new Map();

  sortedProducts.forEach((product) => {
    const category = product.category || 'Other';
    const current = stockByCategory.get(category) || {
      category,
      stock: 0,
      value: 0,
    };

    current.stock += Number(product.stock) || 0;
    current.value += (Number(product.stock) || 0) * (Number(product.price) || 0);
    stockByCategory.set(category, current);
  });

  const chartStockByCategory = Array.from(stockByCategory.values()).sort((left, right) =>
    left.category.localeCompare(right.category),
  );

  const tableRows = sortedProducts.map((product) => ({
    id: product.id,
    name: product.name || 'Product',
    category: product.category || 'Other',
    stock: Number(product.stock) || 0,
    lowStockLimit: Number(product.lowStockThreshold ?? product.lowStockLimit ?? 10) || 10,
    price: Number(product.price) || 0,
    stockValue: (Number(product.stock) || 0) * (Number(product.price) || 0),
  }));

  return {
    totalProducts: sortedProducts.length,
    lowStockCount: lowStockItems.length,
    stockValue,
    chartStockByCategory,
    tableRows,
  };
};

export const buildCustomerFilterOptions = (customers = [], transactions = []) => {
  const names = new Set();

  customers.forEach((customer) => {
    if (customer.name) {
      names.add(customer.name.trim());
    }
  });

  transactions.forEach((transaction) => {
    if (transaction.customerName) {
      names.add(transaction.customerName.trim());
    }
  });

  return Array.from(names).filter(Boolean).sort((left, right) => left.localeCompare(right));
};

export const buildReportsExportRows = ({ financeRows = [], customerRows = [], inventoryRows = [] }) => [
  ...financeRows.map((row) => ({
    module: 'Finance',
    date: row.date,
    name: row.title,
    customer: row.customer,
    type: row.type,
    category: row.category,
    amount: row.amount,
    note: row.note,
  })),
  ...customerRows.map((row) => ({
    module: 'Customers',
    date: row.createdAt,
    name: row.name,
    customer: row.name,
    type: row.status,
    category: 'CRM',
    amount: '',
    note: `${row.email} | ${row.phone}`,
  })),
  ...inventoryRows.map((row) => ({
    module: 'Inventory',
    date: '',
    name: row.name,
    customer: '',
    type: '',
    category: row.category,
    amount: row.stockValue,
    note: `Stock: ${row.stock}, Limit: ${row.lowStockLimit}`,
  })),
];
