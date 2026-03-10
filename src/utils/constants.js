export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', roles: ['admin', 'staff'] },
  { name: 'Company', path: '/company', roles: ['admin'] },
  { name: 'Users', path: '/users', roles: ['admin'] },
  { name: 'Money', path: '/money', roles: ['admin'] },
  { name: 'Customers', path: '/customers', roles: ['admin'] },
  { name: 'Products', path: '/products', roles: ['admin'] },
  { name: 'Orders', path: '/orders', roles: ['admin', 'staff'] },
  { name: 'Activity', path: '/activity', roles: ['admin'] },
  { name: 'Reports', path: '/reports', roles: ['admin'] },
  { name: 'Backup', path: '/backup', roles: ['admin'] },
  { name: 'Settings', path: '/settings', roles: ['admin'] },
];

export const TRANSACTION_CATEGORIES = [
  'Sales',
  'Services',
  'Payroll',
  'Rent',
  'Software',
  'Utilities',
  'Marketing',
  'Taxes',
  'Logistics',
  'Other',
];

export const INVENTORY_CATEGORIES = ['Electronics', 'Office', 'Furniture', 'Accessories', 'Supplies', 'Other'];

export const APPOINTMENT_STATUS = ['scheduled', 'completed', 'cancelled'];

export const CUSTOMER_STATUS = ['active', 'inactive', 'lead'];

export const CHART_COLORS = ['#0f766e', '#0369a1', '#ca8a04', '#b91c1c', '#6d28d9', '#334155'];
