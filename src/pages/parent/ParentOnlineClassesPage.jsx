import { parentApi } from '../../api/parentApi';
import { OnlineClassesAttendPage } from '../../components/onlineClasses/OnlineClassesAttendPage';

export function ParentOnlineClassesPage() {
  return (
    <OnlineClassesAttendPage
      listApi={() => parentApi.onlineClasses()}
      eyebrow="Parent"
      title="Online classes"
      description="Join live Google Meet or Zoom sessions. Tap Join to open the meeting link."
    />
  );
}
