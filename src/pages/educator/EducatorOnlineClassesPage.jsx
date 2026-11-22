import { educatorApi } from '../../api/educatorApi';
import { OnlineClassesAttendPage } from '../../components/onlineClasses/OnlineClassesAttendPage';

export function EducatorOnlineClassesPage() {
  return (
    <OnlineClassesAttendPage
      listApi={() => educatorApi.onlineClasses()}
      eyebrow="Staff"
      title="Online classes"
      description="Join live Google Meet or Zoom classes with students and parents. Tap Join to open the meeting."
    />
  );
}
