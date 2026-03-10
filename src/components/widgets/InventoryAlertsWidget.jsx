import { AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

export const InventoryAlertsWidget = ({ products }) => {
  return (
    <Card title="Inventory Alerts" subtitle="Products below threshold" className="p-5">
      {!products.length ? (
        <EmptyState title="Inventory healthy" message="No low-stock products right now." />
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
            >
              <span className="font-medium">{product.name}</span>
              <span className="inline-flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {product.stock} left
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
