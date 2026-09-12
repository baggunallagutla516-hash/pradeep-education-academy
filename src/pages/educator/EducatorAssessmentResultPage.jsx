import { AssessmentResultPage } from '../AssessmentResultPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorAssessmentResultPage() {
  return (
    <AssessmentResultPage
      api={educatorApi.assessments}
      basePath="/educator/assessments"
      role="educator"
    />
  );
}
