import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { contentApi } from '../api/adminApi';
import { mediaUrl } from '../utils/media';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

function formatDate(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return '';
  }
}

export function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await contentApi.post(id);
      setPost(data.data.post);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load this post.'));
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  return (
    <PageShell
      eyebrow="Post"
      title={post?.title || 'Post'}
      description={formatDate(post?.publishedAt || post?.createdAt)}
      actions={
        <Link to="/">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </Link>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading post…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && post ? (
        <Card className="overflow-hidden p-0">
          <img
            src={mediaUrl(post.posterImage)}
            alt=""
            className="max-h-[420px] w-full object-cover"
          />
          <div className="space-y-4 p-6">
            {post.summary ? <p className="text-base text-ink-900/70">{post.summary}</p> : null}
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink-900">{post.body}</div>
          </div>
        </Card>
      ) : null}
    </PageShell>
  );
}
