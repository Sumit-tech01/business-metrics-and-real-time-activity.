import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { InlineLoader } from '../components/ui/Loader';
import { useCompany } from '../hooks/useCompany';
import { updateCompany } from '../services/companyService';

const CompanyPage = () => {
  const { companyId, company, loading } = useCompany();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    logoUrl: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!company) {
      return;
    }

    setFormData({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      logoUrl: company.logoUrl || '',
    });
  }, [company]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!companyId) {
      toast.error('Company context is missing.');
      return;
    }

    setSaving(true);

    try {
      await updateCompany(companyId, formData);
      toast.success('Company settings updated.');
    } catch (error) {
      toast.error(error?.message || 'Failed to save company settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <InlineLoader label="Loading company settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Company</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your company profile details used across the ERP workspace.
        </p>
      </header>

      <Card title="Company Profile" subtitle="Update core business information" className="p-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Company Name"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="Acme Inc."
              required
            />
            <Input
              label="Company Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="hello@company.com"
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="+1 000 000 0000"
            />
            <Input
              label="Logo URL"
              value={formData.logoUrl}
              onChange={handleChange('logoUrl')}
              placeholder="https://..."
            />
          </div>

          <Textarea
            label="Address"
            value={formData.address}
            onChange={handleChange('address')}
            placeholder="Company address"
            rows={4}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setFormData({
                  name: company?.name || '',
                  email: company?.email || '',
                  phone: company?.phone || '',
                  address: company?.address || '',
                  logoUrl: company?.logoUrl || '',
                })
              }
              disabled={saving}
            >
              Reset
            </Button>
            <Button type="submit" disabled={saving}>
              Save Company
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CompanyPage;
