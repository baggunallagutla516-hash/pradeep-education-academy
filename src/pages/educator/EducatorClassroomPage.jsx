import { educatorApi } from '../../api/educatorApi';
import { ClassroomRoomPage } from '../ClassroomRoomPage';

export function EducatorClassroomPage() {
  return (
    <ClassroomRoomPage mode="host" api={educatorApi.classroom} backTo="/educator/quizzes" />
  );
}
