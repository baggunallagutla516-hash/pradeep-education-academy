import { DppsPage } from '../DppsPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorDppsPage() {
  return (
    <DppsPage
      api={educatorApi.dpps}
      basePath="/educator/dpps"
      badgeLabel="Educator"
      enableClassFilter
    />
  );
}
