import { Link } from 'react-router-dom';
import { ArrowRight, FileStack } from 'lucide-react';
import { useEducatorAuth } from '../../context/EducatorAuthContext';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function EducatorDashboardPage() {
  const { educator } = useEducatorAuth();

  return (
    <PageShell
      embedded
      eyebrow="Educator"
      title={`Hello, ${educator?.fullName?.split(' ')[0] || 'teacher'}`}
      description="Browse published worksheets and study resources for every class."
    >
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lagoon-100 text-lagoon-700">
              <FileStack className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">All-class resources</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-900/60">
                View and download worksheets tagged for Class 6 through Class 12 (and Other). Filter
                by class when you need a focused list.
              </p>
            </div>
          </div>
          <Link to="/educator/worksheets" className="shrink-0">
            <Button>
              Open worksheets
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}
