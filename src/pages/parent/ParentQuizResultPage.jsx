import { QuizResultPage } from '../QuizResultPage';
import { parentApi } from '../../api/parentApi';

export function ParentQuizResultPage() {
  return <QuizResultPage api={parentApi.quizzes} basePath="/parent/quizzes" role="parent" />;
}
