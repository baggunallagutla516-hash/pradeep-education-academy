import { SlipTestAttemptPage } from '../SlipTestAttemptPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorSlipTestAttemptPage() {
  return (
    <SlipTestAttemptPage api={educatorApi.slipTests} basePath="/educator/slip-tests" />
  );
}
