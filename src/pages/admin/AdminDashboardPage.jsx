import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Newspaper, Users, Eye } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAdminAuth } from '../../context/AdminAuthContext';

function StatCard({ icon: Icon, label, value, hint, to }) {
  const content = (
    <Card className="h-full transition hover:border-lagoon-300">
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lagoon-100 text-lagoon-700">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-ink-900/55">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-ink-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-ink-900/50">{hint}</p> : null}
    </Card>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

export function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.dashboard();
      setStats(data.data);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load dashboard.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title={`Hello, ${admin?.fullName?.split(' ')[0] || 'Admin'}`}
      description="Overview of students, visitors, contact queries, and published content."
    >
      {status === 'loading' ? <LoadingState label="Loading stats…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Users}
            label="Students"
            value={stats.students.total}
            hint={`${stats.students.active} active`}
            to="/admin/students"
          />
          <StatCard
            icon={Eye}
            label="Visitors"
            value={stats.visitors.total}
            hint="Unique visit count"
          />
          <StatCard
            icon={MessageSquare}
            label="Contact queries"
            value={stats.contactQueries.total}
            hint={`${stats.contactQueries.new} new`}
            to="/admin/contact-queries"
          />
          <StatCard
            icon={Newspaper}
            label="Active news"
            value={stats.news.active}
            to="/admin/news"
          />
        </div>
      ) : null}
    </PageShell>
  );
}
