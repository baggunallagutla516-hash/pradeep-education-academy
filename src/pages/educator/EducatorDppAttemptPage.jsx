import { DppAttemptPage } from '../DppAttemptPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorDppAttemptPage() {
  return <DppAttemptPage api={educatorApi.dpps} basePath="/educator/dpps" />;
}
