import { SlipTestResultPage } from '../SlipTestResultPage';
import { educatorApi } from '../../api/educatorApi';

export function EducatorSlipTestResultPage() {
  return (
    <SlipTestResultPage
      api={educatorApi.slipTests}
      basePath="/educator/slip-tests"
      role="educator"
    />
  );
}
