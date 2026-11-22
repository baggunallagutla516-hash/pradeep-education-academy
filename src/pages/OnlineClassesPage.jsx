import api from '../api/client';
import { OnlineClassesAttendPage } from '../components/onlineClasses/OnlineClassesAttendPage';

export function OnlineClassesPage() {
  return (
    <OnlineClassesAttendPage
      listApi={() => api.get('/online-classes')}
      eyebrow="Student"
      title="Online classes"
      description="Join live Google Meet or Zoom classes. Tap Join to open the meeting."
    />
  );
}
