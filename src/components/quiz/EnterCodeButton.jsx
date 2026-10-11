import { useState } from 'react';
import { Button } from '../ui/Button';
import { JoinQuizDialog } from './JoinQuizDialog';

export function EnterCodeButton({ basePath = '/quizzes' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Enter code
      </Button>
      <JoinQuizDialog open={open} onClose={() => setOpen(false)} basePath={basePath} />
    </>
  );
}
