import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Alert } from '../../components/ui/Alert';

export function AdminEducatorEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [educator, setEducator] = useState(null);
  const [form, setForm] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const [eduRes, classRes] = await Promise.all([
        adminApi.educator(id),
        authApi.classes(),
      ]);
      const item = eduRes.data.data.educator;
      setEducator(item);
      setClassOptions(classRes.data.data.classes || []);
      const firstClass = (item.classes || [])[0];
      setForm({
        fullName: item.fullName || '',
        email: item.email || '',
        phone: item.phone || '',
        schoolName: item.schoolName || '',
        studentClass: firstClass?.id || firstClass || '',
      });
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load educator.'));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      next.fullName = 'Full name must be at least 2 characters.';
    }
    if (!form.email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    const phone = form.phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      next.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (!form.studentClass) {
      next.studentClass = 'Please select a class.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaveError('');
    if (!validate()) return;

    setSaving(true);
    try {
      await adminApi.updateEducator(id, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        schoolName: form.schoolName.trim(),
        classes: [form.studentClass],
      });
      navigate(`/admin/educators/${id}`);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not update educator.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Educators"
      title={educator?.fullName || 'Edit educator'}
      description="Update educator profile and the class they can access."
      actions={
        <Link to={educator ? `/admin/educators/${educator.id}` : '/admin/educators'}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' && form ? (
        <Card>
          <div className="mb-4">
            <Badge tone={educator.isActive ? 'lagoon' : 'ink'}>
              {educator.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {saveError ? (
            <Alert type="error" title="Could not save" onClose={() => setSaveError('')} className="mb-4">
              {saveError}
            </Alert>
          ) : null}

          <form className="space-y-4" onSubmit={handleSave}>
            <Input
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={updateField}
              error={fieldErrors.fullName}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              error={fieldErrors.email}
              required
            />
            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={updateField}
              error={fieldErrors.phone}
              required
            />
            <Input
              label="School name"
              name="schoolName"
              value={form.schoolName}
              onChange={updateField}
            />
            <Select
              label="Class"
              name="studentClass"
              value={form.studentClass}
              onChange={updateField}
              required
              error={fieldErrors.studentClass}
              hint="Educator will only see content for this class."
            >
              <option value="">Select class</option>
              {classOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
              <Link to={`/admin/educators/${id}`}>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      ) : null}
    </PageShell>
  );
}
