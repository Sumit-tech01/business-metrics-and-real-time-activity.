import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Download, FileJson, Upload } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { InlineLoader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { useCompany } from '../hooks/useCompany';
import { useAuthStore } from '../store/authStore';
import { logActivity } from '../services/activityService';
import { exportAllData, importBackup } from '../services/backupService';

const BACKUP_SECTIONS = [
  { key: 'customers', label: 'Customers' },
  { key: 'products', label: 'Products' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'orders', label: 'Orders' },
  { key: 'activityLogs', label: 'Activity Logs' },
];

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString();
};

const parseBackupSections = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  if (payload.data && typeof payload.data === 'object') {
    return payload.data;
  }

  return payload;
};

const getFileError = (error) => error?.message || 'Invalid backup file. Upload a valid JSON backup.';

const BackupPage = () => {
  const { companyId, companyName, loading: companyLoading } = useCompany();
  const user = useAuthStore((state) => state.user);
  const inputRef = useRef(null);
  const [backupFile, setBackupFile] = useState(null);
  const [backupPayload, setBackupPayload] = useState(null);
  const [backupMeta, setBackupMeta] = useState({ exportedAt: '', companyId: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const importPreview = useMemo(() => {
    const payload = parseBackupSections(backupPayload);

    return BACKUP_SECTIONS.map((section) => ({
      ...section,
      count: Array.isArray(payload[section.key]) ? payload[section.key].length : 0,
    }));
  }, [backupPayload]);

  const hasBackupPayload = Boolean(backupPayload);
  const isBusy = exporting || importing;
  const sourceCompanyMismatch =
    Boolean(backupMeta.companyId) && Boolean(companyId) && backupMeta.companyId !== companyId;

  const resetImportState = () => {
    setBackupFile(null);
    setBackupPayload(null);
    setBackupMeta({ exportedAt: '', companyId: '' });
    setConfirmOpen(false);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    if (!companyId) {
      toast.error('Company context is missing.');
      return;
    }

    setExporting(true);

    try {
      const backupData = await exportAllData(companyId);
      const dateStamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeCompany = (companyName || companyId || 'company').replace(/\s+/g, '-').toLowerCase();
      const fileName = `backup-${safeCompany}-${dateStamp}.json`;
      const json = JSON.stringify(backupData, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      await logActivity('backup_export', 'backup', companyId, `Exported company backup (${fileName}).`);
      toast.success('Backup exported successfully.');
    } catch (error) {
      toast.error(error?.message || 'Failed to export backup.');
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      resetImportState();
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parseBackupSections(parsed);

      if (!data || typeof data !== 'object') {
        throw new Error('Backup data is missing.');
      }

      setBackupFile(file);
      setBackupPayload(parsed);
      setBackupMeta({
        exportedAt: parsed.exportedAt || '',
        companyId: parsed.companyId || '',
      });
      toast.success('Backup file loaded.');
    } catch (error) {
      resetImportState();
      toast.error(getFileError(error));
    }
  };

  const handleOpenRestoreConfirm = () => {
    if (!companyId) {
      toast.error('Company context is missing.');
      return;
    }

    if (!hasBackupPayload) {
      toast.error('Upload a backup JSON file first.');
      return;
    }

    if (sourceCompanyMismatch) {
      toast.error('This backup belongs to another company.');
      return;
    }

    setConfirmOpen(true);
  };

  const handleRestore = async () => {
    if (!companyId || !user?.uid || !backupPayload) {
      toast.error('Restore context is missing.');
      return;
    }

    setImporting(true);

    try {
      const result = await importBackup(companyId, backupPayload, user.uid);
      const importedCounts = result?.importedCounts || {};
      const importedTotal = Object.values(importedCounts).reduce((sum, count) => sum + (Number(count) || 0), 0);

      await logActivity(
        'backup_import',
        'backup',
        companyId,
        `Imported backup for ${companyName || companyId}. Records restored: ${importedTotal}.`,
      );

      resetImportState();
      toast.success('Backup restored successfully.');
    } catch (error) {
      toast.error(error?.message || 'Failed to restore backup.');
    } finally {
      setImporting(false);
      setConfirmOpen(false);
    }
  };

  if (companyLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <InlineLoader label="Loading backup tools..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Backup & Restore</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Export and restore company data safely using JSON backups.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Export Backup" subtitle="Download current company data as JSON" className="p-5">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Company scope: <span className="font-medium">{companyName || companyId || 'Unknown company'}</span>
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Includes customers, products, transactions, orders, and activity logs for this company only.
            </div>
            <div className="flex justify-end">
              <Button onClick={handleExport} disabled={!companyId || isBusy}>
                <Download className="h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export Backup'}
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Restore Backup" subtitle="Import a JSON backup file" className="p-5">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="backup-file">
              Backup File (.json)
            </label>
            <input
              id="backup-file"
              ref={inputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:file:bg-slate-800 dark:file:text-slate-200"
            />

            {backupFile ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <p className="font-medium text-slate-700 dark:text-slate-100">{backupFile.name}</p>
                <p className="mt-1">Exported: {formatDateTime(backupMeta.exportedAt)}</p>
                <p>Source company ID: {backupMeta.companyId || 'Unknown'}</p>
              </div>
            ) : null}

            {sourceCompanyMismatch ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                This file belongs to a different company and cannot be restored here.
              </p>
            ) : null}

            {hasBackupPayload ? (
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Backup Preview
                </p>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {importPreview.map((section) => (
                    <div
                      key={section.key}
                      className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <span>{section.label}</span>
                      <span className="font-medium">{section.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={resetImportState} disabled={!hasBackupPayload || isBusy}>
                Reset
              </Button>
              <Button onClick={handleOpenRestoreConfirm} disabled={!hasBackupPayload || isBusy || sourceCompanyMismatch}>
                <Upload className="h-4 w-4" />
                {importing ? 'Restoring...' : 'Import Backup'}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Card title="Restore Warning" subtitle="Read before importing" className="p-5">
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p>Restore overwrites customers, products, transactions, and orders for this company.</p>
            <p>Activity logs are imported as new records to keep audit history immutable.</p>
          </div>
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => (importing ? null : setConfirmOpen(false))}
        title="Confirm restore"
        description="This operation replaces existing company records. Continue only if you trust this backup file."
        actions={[
          <Button key="cancel" variant="secondary" onClick={() => setConfirmOpen(false)} disabled={importing}>
            Cancel
          </Button>,
          <Button key="confirm" variant="danger" onClick={handleRestore} disabled={importing}>
            <FileJson className="h-4 w-4" />
            {importing ? 'Restoring...' : 'Restore Now'}
          </Button>,
        ]}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Company: <span className="font-medium">{companyName || companyId}</span>
        </p>
      </Modal>
    </div>
  );
};

export default BackupPage;
