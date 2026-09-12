import { createContext, useContext, useMemo } from 'react';
import { adminApi } from '../api/adminApi';

const StaffContentContext = createContext({
  basePath: '/admin',
  api: adminApi,
});

export function StaffContentProvider({ basePath = '/admin', api = adminApi, children }) {
  const value = useMemo(() => ({ basePath, api }), [basePath, api]);
  return <StaffContentContext.Provider value={value}>{children}</StaffContentContext.Provider>;
}

export function useStaffContent() {
  return useContext(StaffContentContext);
}
