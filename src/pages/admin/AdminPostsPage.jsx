import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { mediaUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';

export function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.posts();
      setPosts(data.data.posts);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load posts.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return;
    setBusyId(id);
    setActionError('');
    try {
      await adminApi.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete post.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="Posts"
      description="Create and edit home-feed posts with poster images."
      actions={
        <Link to="/admin/posts/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New post
          </Button>
        </Link>
      }
    >
      {actionError ? (
        <Alert type="error" title="Action failed" onClose={() => setActionError('')} className="mb-4">
          {actionError}
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState label="Loading posts…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Create your first post with a poster image for the home feed."
          action={
            <Link to="/admin/posts/new">
              <Button>Create post</Button>
            </Link>
          }
        />
      ) : null}

      {status === 'ready' && posts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden p-0">
              <img
                src={mediaUrl(post.posterImage)}
                alt=""
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge tone={post.isPublished ? 'lagoon' : 'ink'}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <h3 className="font-display text-lg font-bold text-ink-900">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-ink-900/60">{post.summary || post.body}</p>
                <div className="mt-4 flex gap-2">
                  <Link to={`/admin/posts/${post.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={busyId === post.id}
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
