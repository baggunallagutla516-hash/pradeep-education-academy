import { AssessmentsPage } from '../AssessmentsPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorAssessmentsPage() {
  return (
    <AssessmentsPage
      api={educatorApi.assessments}
      basePath="/educator/assessments"
      badgeLabel="Educator"
      enableClassFilter
    />
  );
}
