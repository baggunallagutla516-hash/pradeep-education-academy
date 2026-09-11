import { QuizAttemptPage } from '../QuizAttemptPage';
import { parentApi } from '../../api/parentApi';

export function ParentQuizAttemptPage() {
  return <QuizAttemptPage api={parentApi.quizzes} basePath="/parent/quizzes" />;
}
