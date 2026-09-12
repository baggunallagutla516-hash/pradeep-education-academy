import { AssessmentAttemptPage } from '../AssessmentAttemptPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorAssessmentAttemptPage() {
  return (
    <AssessmentAttemptPage
      api={educatorApi.assessments}
      basePath="/educator/assessments"
    />
  );
}
