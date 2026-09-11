import { QuizResultPage } from '../QuizResultPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorQuizResultPage() {
  return (
    <QuizResultPage api={educatorApi.quizzes} basePath="/educator/quizzes" role="educator" />
  );
}
