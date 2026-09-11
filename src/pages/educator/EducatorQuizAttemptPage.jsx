import { QuizAttemptPage } from '../QuizAttemptPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorQuizAttemptPage() {
  return <QuizAttemptPage api={educatorApi.quizzes} basePath="/educator/quizzes" />;
}
