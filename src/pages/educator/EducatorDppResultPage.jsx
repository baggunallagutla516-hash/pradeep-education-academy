import { DppResultPage } from '../DppResultPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorDppResultPage() {
  return (
    <DppResultPage api={educatorApi.dpps} basePath="/educator/dpps" role="educator" />
  );
}
