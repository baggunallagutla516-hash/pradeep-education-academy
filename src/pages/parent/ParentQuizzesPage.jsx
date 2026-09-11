import { QuizzesPage } from '../QuizzesPage';
import { parentApi } from '../../api/parentApi';

export function ParentQuizzesPage() {
  return (
    <QuizzesPage api={parentApi.quizzes} basePath="/parent/quizzes" badgeLabel="Parent" />
  );
}
