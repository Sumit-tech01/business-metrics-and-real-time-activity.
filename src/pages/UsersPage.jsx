import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import { useCompany } from '../hooks/useCompany';
import { useUiStore } from '../store/uiStore';
import { formatDate } from '../utils/formatters';

const UsersPage = () => {
  const { users, loading, saving, error, changeRole, removeUser } = useUsers();
  const currentUser = useAuthStore((state) => state.user);
  const { companyName } = useCompany();
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

  const tableRows = useMemo(
    () =>
      users.map((item) => ({
        ...item,
        company: companyName || item.companyId || '---',
        created: formatDate(item.createdAt, 'MMM dd, yyyy HH:mm'),
      })),
    [companyName, users],
  );

  const openDeleteConfirm = (userRow) => {
    if (!userRow?.uid) {
      return;
    }

    if (currentUser?.uid === userRow.uid) {
      toast.error('You cannot delete your own account from this page.');
      return;
    }

    setPendingDeleteUser(userRow);
  };

  const closeDeleteConfirm = () => {
    setPendingDeleteUser(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteUser?.uid) {
      return;
    }

    await removeUser(pendingDeleteUser.uid);
    closeDeleteConfirm();
  };

  const handleRoleChange = async (userRow, nextRole) => {
    const uid = userRow?.uid;
    const currentRole = userRow?.role || 'staff';

    if (!uid || nextRole === currentRole) {
      return;
    }

    if (currentUser?.uid === uid) {
      toast.error('You cannot change your own role here.');
      return;
    }

    await changeRole(uid, nextRole);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage company users, access roles, and account permissions.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <p className="font-medium">{currentUser?.email || 'Unknown user'}</p>
          <p className="mt-1">
            Role:{' '}
            <Badge tone="blue" className="ml-1">
              {currentUser?.role || 'admin'}
            </Badge>
          </p>
        </div>
      </header>

      {error ? <p className="rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <Card title="User Directory" subtitle="Realtime user role management" className="p-5">
        <Table
          rows={tableRows}
          loading={loading}
          emptyMessage="No users found."
          columns={[
            { key: 'email', header: 'Email' },
            {
              key: 'role',
              header: 'Role',
              searchable: false,
              render: (row) => (
                <select
                  value={row.role}
                  onChange={(event) => {
                    void handleRoleChange(row, event.target.value);
                  }}
                  disabled={saving || currentUser?.uid === row.uid}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="admin">admin</option>
                  <option value="staff">staff</option>
                </select>
              ),
            },
            { key: 'company', header: 'Company' },
            { key: 'created', header: 'Created' },
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
              onClick: () => toast(`${row.email} • ${row.role} • ${row.company}`),
            },
            {
              label: 'Delete',
              tone: 'danger',
              onClick: () => {
                openDeleteConfirm(row);
              },
            },
          ]}
          toolbar={{
            searchValue: searchQuery,
            onSearchChange: setSearchQuery,
            searchPlaceholder: 'Search users...',
            onFilterClick: () => toast('Search by email, company, or created date.'),
            showFilter: true,
          }}
        />
      </Card>

      <Modal
        open={Boolean(pendingDeleteUser)}
        onClose={closeDeleteConfirm}
        title="Delete User"
        description="This action removes the user profile from Firestore."
        maxWidthClassName="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <span className="font-semibold">{pendingDeleteUser?.email}</span>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeDeleteConfirm} disabled={saving}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void confirmDelete()} disabled={saving}>
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
