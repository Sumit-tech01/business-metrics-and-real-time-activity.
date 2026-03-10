import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Minus, Plus } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProductForm } from '../components/forms/ProductForm';
import { useInventory } from '../hooks/useInventory';
import { logActivity } from '../services/activityService';
import { useUiStore } from '../store/uiStore';
import { formatCurrency } from '../utils/formatters';
import { exportToExcel } from '../utils/exportExcel';
import { exportToPDF } from '../utils/exportPDF';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';

const InventoryPage = () => {
  const { products, lowStockItems, inventoryValue, addItem, updateItem, removeItem, saving, loading, error } =
    useInventory();
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) || null,
    [editingProductId, products],
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  const inventoryExportRows = useMemo(
    () =>
      filteredProducts.map((product) => ({
        name: product.name || '',
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
      })),
    [filteredProducts],
  );

  const closeProductFormModal = () => {
    setIsProductFormOpen(false);
    setEditingProductId(null);
  };

  const handleSubmit = async (payload) => {
    if (editingProduct) {
      await updateItem(editingProduct.id, payload);
      if (payload.stock !== undefined && Number(payload.stock) !== Number(editingProduct.stock)) {
        await logActivity(
          'update_stock',
          'product',
          editingProduct.id,
          `Updated stock for ${editingProduct.name || 'product'} from ${Number(editingProduct.stock) || 0} to ${
            Number(payload.stock) || 0
          }.`,
        );
      }
      closeProductFormModal();
      return;
    }

    const createdProduct = await addItem(payload);
    await logActivity(
      'add',
      'product',
      createdProduct?.id || '',
      `Added product ${payload.name || 'Unnamed product'} with stock ${Number(payload.stock) || 0}.`,
    );
    closeProductFormModal();
  };

  const openCreateProductModal = () => {
    setEditingProductId(null);
    setIsProductFormOpen(true);
  };

  const openEditProductModal = (productId) => {
    setEditingProductId(productId);
    setIsProductFormOpen(true);
  };

  const adjustStock = async (product, delta) => {
    const nextStock = Math.max(0, Number(product.stock) + delta);
    await updateItem(product.id, { stock: nextStock });
    await logActivity(
      'update_stock',
      'product',
      product.id,
      `Updated stock for ${product.name || 'product'} from ${Number(product.stock) || 0} to ${nextStock}.`,
    );
  };

  const handleExportExcel = async () => {
    setExporting(true);

    try {
      await exportToExcel(inventoryExportRows, 'inventory');
      toast.success(`Exported ${inventoryExportRows.length} products to Excel.`);
    } catch (exportError) {
      toast.error(exportError?.message || 'Unable to export inventory data.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);

    try {
      await exportToPDF(
        [
          { header: 'Name', key: 'name' },
          { header: 'Price', key: 'price' },
          { header: 'Stock', key: 'stock' },
        ],
        inventoryExportRows,
        'inventory',
      );
      toast.success(`Exported ${inventoryExportRows.length} products to PDF.`);
    } catch (exportError) {
      toast.error(exportError?.message || 'Unable to export inventory data.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Inventory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage product catalog, stock levels, and low-inventory alerts.
          </p>
        </div>
        <Button onClick={openCreateProductModal}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </header>

      {error ? <p className="rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <Card title="Inventory Snapshot" className="p-5 xl:col-span-2">
          <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">{products.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Products tracked</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">Total value: {formatCurrency(inventoryValue)}</p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-300">Low stock items: {lowStockItems.length}</p>
        </Card>

        <Card title="Product Actions" subtitle="Create and edit products in modal forms" className="p-5">
          <Button className="w-full" onClick={openCreateProductModal}>
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Use table actions to adjust stock and update item details.
          </p>
        </Card>
      </section>

      <Card
        title="Product List"
        subtitle="Update stock and remove obsolete SKUs"
        className="p-5"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportExcel} disabled={exporting}>
              Export Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportPdf} disabled={exporting}>
              Export PDF
            </Button>
          </div>
        }
      >
        <Table
          rows={filteredProducts}
          loading={loading}
          emptyMessage="No inventory records yet."
          columns={[
            { key: 'name', header: 'Product' },
            { key: 'sku', header: 'SKU' },
            { key: 'category', header: 'Category' },
            {
              key: 'price',
              header: 'Price',
              render: (row) => formatCurrency(row.price),
            },
            {
              key: 'stock',
              header: 'Stock',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <span>{row.stock}</span>
                  {Number(row.stock) <= Number(row.lowStockThreshold) ? <Badge tone="yellow">Low</Badge> : null}
                </div>
              ),
            },
            {
              key: 'stockControl',
              header: 'Stock Control',
              searchable: false,
              render: (row) => (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => adjustStock(row, -1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => adjustStock(row, 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              searchable: false,
              className: 'w-20',
            },
          ]}
          rowActions={(row) => [
            {
              label: 'View',
              onClick: () =>
                toast(`${row.name || 'Product'} • Stock ${Number(row.stock) || 0} • ${formatCurrency(row.price)}`),
            },
            {
              label: 'Edit',
              onClick: () => openEditProductModal(row.id),
            },
            {
              label: 'Delete',
              tone: 'danger',
              onClick: () => {
                void removeItem(row.id);
              },
            },
          ]}
          toolbar={{
            searchValue: searchQuery,
            onSearchChange: setSearchQuery,
            searchPlaceholder: 'Search products...',
            onFilterClick: () => toast('Search by product name, SKU, or category to filter records.'),
            onAddClick: openCreateProductModal,
            addLabel: 'Add Product',
          }}
        />
      </Card>

      <Card title="Low Stock Alerts" className="p-5">
        {!lowStockItems.length ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No low stock alerts.</p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {lowStockItems.map((product) => (
              <li
                key={product.id}
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
              >
                <span className="font-semibold">{product.name}</span> has {product.stock} left (threshold{' '}
                {product.lowStockThreshold})
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={isProductFormOpen}
        onClose={closeProductFormModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        description="Enter product details and save your inventory record."
        maxWidthClassName="max-w-3xl"
      >
        <ProductForm
          key={editingProduct?.id || 'new-product'}
          onSubmit={handleSubmit}
          loading={saving}
          initialValues={editingProduct}
          onCancel={closeProductFormModal}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;
