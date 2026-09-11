import { QuizzesPage } from '../QuizzesPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorQuizzesPage() {
  return (
    <QuizzesPage
      api={educatorApi.quizzes}
      basePath="/educator/quizzes"
      badgeLabel="Educator"
    />
  );
}
