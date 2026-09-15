import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Link2, Search, Unlink } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';

export function AdminParentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parent, setParent] = useState(null);
  const [form, setForm] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkMessage, setLinkMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyChildId, setBusyChildId] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [linkingId, setLinkingId] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const [parentRes, classRes] = await Promise.all([
        adminApi.parent(id),
        authApi.classes(),
      ]);
      const item = parentRes.data.data.parent;
      setParent(item);
      setClassOptions(classRes.data.data.classes || []);
      const firstClass = (item.classes || [])[0];
      setForm({
        fullName: item.fullName || '',
        email: item.email || '',
        phone: item.phone || '',
        studentClass: firstClass?.id || firstClass || '',
      });
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load parent.'));
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
      await adminApi.updateParent(id, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        classes: [form.studentClass],
      });
      navigate(`/admin/parents/${id}`);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not update parent.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleUnlink(child) {
    if (!window.confirm(`Unlink ${child.fullName} from this parent?`)) return;
    setLinkError('');
    setLinkMessage('');
    setBusyChildId(child.id);
    try {
      await adminApi.unlinkParentStudent({ parentId: id, studentId: child.id });
      setParent((prev) => ({
        ...prev,
        children: (prev.children || []).filter((c) => c.id !== child.id),
        studentIds: (prev.studentIds || []).filter((sid) => String(sid) !== String(child.id)),
      }));
      setLinkMessage(`${child.fullName} unlinked.`);
    } catch (err) {
      setLinkError(getErrorMessage(err, 'Could not unlink student.'));
    } finally {
      setBusyChildId('');
    }
  }

  async function searchStudents(event) {
    event.preventDefault();
    setLinkError('');
    setLinkMessage('');
    const q = studentQuery.trim();
    if (!q) {
      setLinkError('Enter a name, email, phone, or registration ID.');
      return;
    }
    setSearchingStudents(true);
    try {
      const { data } = await adminApi.students({ page: 1, limit: 10, q, status: 'active' });
      setStudentResults(data.data.students || []);
      if ((data.data.students || []).length === 0) {
        setLinkMessage('No active students matched that search.');
      }
    } catch (err) {
      setLinkError(getErrorMessage(err, 'Could not search students.'));
    } finally {
      setSearchingStudents(false);
    }
  }

  async function handleLink(student) {
    setLinkError('');
    setLinkMessage('');
    setLinkingId(student.id);
    try {
      await adminApi.linkParentStudent({ parentId: id, studentId: student.id });
      await load();
      setStudentResults([]);
      setStudentQuery('');
      setLinkMessage(`${student.fullName} linked successfully.`);
    } catch (err) {
      setLinkError(getErrorMessage(err, 'Could not link student.'));
    } finally {
      setLinkingId('');
    }
  }

  const children = parent?.children || [];

  return (
    <PageShell
      embedded
      eyebrow="Parents"
      title={parent?.fullName || 'Edit parent'}
      description="Update parent profile and manage linked students."
      actions={
        <Link to={parent ? `/admin/parents/${parent.id}` : '/admin/parents'}>
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
        <div className="space-y-4">
          <Card>
            <div className="mb-4">
              <Badge tone={parent.isActive ? 'lagoon' : 'ink'}>
                {parent.isActive ? 'Active' : 'Inactive'}
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
              <Select
                label="Class"
                name="studentClass"
                value={form.studentClass}
                onChange={updateField}
                required
                error={fieldErrors.studentClass}
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
                <Link to={`/admin/parents/${id}`}>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold text-ink-900">Linked students</h2>

            {linkError ? (
              <Alert type="error" title="Link action failed" onClose={() => setLinkError('')} className="mt-3">
                {linkError}
              </Alert>
            ) : null}
            {linkMessage ? (
              <Alert type="success" title="Updated" onClose={() => setLinkMessage('')} className="mt-3">
                {linkMessage}
              </Alert>
            ) : null}

            {children.length === 0 ? (
              <div className="mt-3">
                <EmptyState title="No linked students" description="Search below to link a student." />
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {children.map((child) => (
                  <li
                    key={child.id}
                    className="flex flex-col gap-2 rounded-xl border border-ink-900/8 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink-900">{child.fullName}</p>
                        {classLabel(child) ? <Badge>{classLabel(child)}</Badge> : null}
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-900/60">
                        {child.registrationId ? `${child.registrationId} · ` : ''}
                        {child.email}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={busyChildId === child.id}
                      onClick={() => handleUnlink(child)}
                    >
                      <Unlink className="h-3.5 w-3.5" />
                      Unlink
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={searchStudents}>
              <div className="flex-1">
                <Input
                  label="Link a student"
                  name="studentQuery"
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Search by name, email, phone, or Registration ID"
                />
              </div>
              <Button type="submit" variant="secondary" loading={searchingStudents}>
                <Search className="h-4 w-4" />
                Search
              </Button>
            </form>

            {studentResults.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {studentResults.map((student) => {
                  const alreadyLinked = (parent.studentIds || []).some(
                    (sid) => String(sid) === String(student.id)
                  );
                  return (
                    <li
                      key={student.id}
                      className="flex flex-col gap-2 rounded-xl border border-ink-900/8 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900">{student.fullName}</p>
                        <p className="mt-1 truncate text-sm text-ink-900/60">
                          {student.registrationId ? `${student.registrationId} · ` : ''}
                          {student.email}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={alreadyLinked}
                        loading={linkingId === student.id}
                        onClick={() => handleLink(student)}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {alreadyLinked ? 'Already linked' : 'Link'}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </Card>
        </div>
      ) : null}
    </PageShell>
  );
}
