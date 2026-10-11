import { adminApi } from '../../api/adminApi';
import { ClassroomRoomPage } from '../ClassroomRoomPage';

export function AdminClassroomPage() {
  return <ClassroomRoomPage mode="host" api={adminApi.classroom} backTo="/admin/quizzes" />;
}
