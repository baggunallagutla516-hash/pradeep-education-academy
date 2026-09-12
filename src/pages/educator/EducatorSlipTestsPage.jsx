import { SlipTestsPage } from '../SlipTestsPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorSlipTestsPage() {
  return (
    <SlipTestsPage
      api={educatorApi.slipTests}
      basePath="/educator/slip-tests"
      badgeLabel="Educator"
      enableClassFilter
    />
  );
}
