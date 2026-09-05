import { Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { SearchX } from 'lucide-react';

export function NotFoundPage() {
  return (
    <PageShell title="Page not found" description="That link does not match any page on this site.">
      <EmptyState
        icon={SearchX}
        title="Nothing here"
        description="The page may have moved, or the URL might be mistyped."
        action={
          <Link to="/">
            <Button>Back to home</Button>
          </Link>
        }
      />
    </PageShell>
  );
}
