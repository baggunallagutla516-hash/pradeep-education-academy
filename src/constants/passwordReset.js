import { authApi } from '../api/authApi';
import { parentApi } from '../api/parentApi';
import { educatorApi } from '../api/educatorApi';
import { adminApi } from '../api/adminApi';

export const PASSWORD_RESET_ROLES = {
  student: {
    key: 'student',
    label: 'Student',
    loginPath: '/login',
    basePath: '/forgot-password',
    emailKey: 'studentPasswordResetEmail',
    tokenKey: 'studentPasswordResetToken',
    api: authApi,
  },
  parent: {
    key: 'parent',
    label: 'Parent',
    loginPath: '/parent/login',
    basePath: '/parent/forgot-password',
    emailKey: 'parentPasswordResetEmail',
    tokenKey: 'parentPasswordResetToken',
    api: parentApi,
  },
  educator: {
    key: 'educator',
    label: 'Educator',
    loginPath: '/educator/login',
    basePath: '/educator/forgot-password',
    emailKey: 'educatorPasswordResetEmail',
    tokenKey: 'educatorPasswordResetToken',
    api: educatorApi,
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    loginPath: '/admin/login',
    basePath: '/admin/forgot-password',
    emailKey: 'adminPasswordResetEmail',
    tokenKey: 'adminPasswordResetToken',
    api: adminApi,
  },
};

export function getPasswordResetRole(roleKey = 'student') {
  return PASSWORD_RESET_ROLES[roleKey] || PASSWORD_RESET_ROLES.student;
}
