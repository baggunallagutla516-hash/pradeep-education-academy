import { quizApi } from '../api/adminApi';
import { ClassroomRoomPage } from './ClassroomRoomPage';

export function ClassroomPlayPage() {
  return <ClassroomRoomPage mode="player" api={quizApi.classroom} backTo="/quizzes" />;
}
