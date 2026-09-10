import api from './client';

export const adminApi = {
  login(payload) {
    return api.post('/admin/login', payload);
  },
  logout() {
    return api.post('/admin/logout');
  },
  me() {
    return api.get('/admin/me');
  },
  dashboard() {
    return api.get('/admin/dashboard');
  },
  students(params) {
    return api.get('/admin/students', { params });
  },
  student(id) {
    return api.get(`/admin/students/${id}`);
  },
  updateStudent(id, payload) {
    return api.patch(`/admin/students/${id}`, payload);
  },
  setStudentActive(id, isActive) {
    return api.patch(`/admin/students/${id}/active`, { isActive });
  },
  deleteStudent(id) {
    return api.delete(`/admin/students/${id}`);
  },
  addParentToStudent(studentId, payload) {
    return api.post(`/admin/students/${studentId}/parents`, payload);
  },
  educators(params) {
    return api.get('/admin/educators', { params });
  },
  educator(id) {
    return api.get(`/admin/educators/${id}`);
  },
  updateEducator(id, payload) {
    return api.patch(`/admin/educators/${id}`, payload);
  },
  setEducatorActive(id, isActive) {
    return api.patch(`/admin/educators/${id}/active`, { isActive });
  },
  deleteEducator(id) {
    return api.delete(`/admin/educators/${id}`);
  },
  parents(params) {
    return api.get('/admin/parents', { params });
  },
  parent(id) {
    return api.get(`/admin/parents/${id}`);
  },
  createParent(payload) {
    return api.post('/admin/parents', payload);
  },
  setParentActive(id, isActive) {
    return api.patch(`/admin/parents/${id}/active`, { isActive });
  },
  linkParentStudent(payload) {
    return api.post('/admin/parents/link', payload);
  },
  unlinkParentStudent(payload) {
    return api.post('/admin/parents/unlink', payload);
  },
  news() {
    return api.get('/admin/news');
  },
  createNews(payload) {
    return api.post('/admin/news', payload);
  },
  updateNews(id, payload) {
    return api.patch(`/admin/news/${id}`, payload);
  },
  deleteNews(id) {
    return api.delete(`/admin/news/${id}`);
  },
  worksheets() {
    return api.get('/admin/worksheets');
  },
  worksheet(id) {
    return api.get(`/admin/worksheets/${id}`);
  },
  createWorksheet(formData) {
    return api.post('/admin/worksheets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateWorksheet(id, formData) {
    return api.patch(`/admin/worksheets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteWorksheet(id) {
    return api.delete(`/admin/worksheets/${id}`);
  },
  unitTests() {
    return api.get('/admin/unit-tests');
  },
  unitTest(id) {
    return api.get(`/admin/unit-tests/${id}`);
  },
  createUnitTest(formData) {
    return api.post('/admin/unit-tests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateUnitTest(id, formData) {
    return api.patch(`/admin/unit-tests/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteUnitTest(id) {
    return api.delete(`/admin/unit-tests/${id}`);
  },
  cets() {
    return api.get('/admin/cets');
  },
  cet(id) {
    return api.get(`/admin/cets/${id}`);
  },
  createCet(formData) {
    return api.post('/admin/cets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateCet(id, formData) {
    return api.patch(`/admin/cets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteCet(id) {
    return api.delete(`/admin/cets/${id}`);
  },
  assessments() {
    return api.get('/admin/assessments');
  },
  assessment(id) {
    return api.get(`/admin/assessments/${id}`);
  },
  assessmentResults(id) {
    return api.get(`/admin/assessments/${id}/results`);
  },
  releaseAssessmentResults(id) {
    return api.post(`/admin/assessments/${id}/release-results`);
  },
  createAssessment(payload) {
    return api.post('/admin/assessments', payload);
  },
  updateAssessment(id, payload) {
    return api.patch(`/admin/assessments/${id}`, payload);
  },
  deleteAssessment(id) {
    return api.delete(`/admin/assessments/${id}`);
  },
  dpps() {
    return api.get('/admin/dpps');
  },
  dpp(id) {
    return api.get(`/admin/dpps/${id}`);
  },
  dppResults(id) {
    return api.get(`/admin/dpps/${id}/results`);
  },
  createDpp(payload) {
    return api.post('/admin/dpps', payload);
  },
  updateDpp(id, payload) {
    return api.patch(`/admin/dpps/${id}`, payload);
  },
  deleteDpp(id) {
    return api.delete(`/admin/dpps/${id}`);
  },
  slipTests() {
    return api.get('/admin/slip-tests');
  },
  slipTest(id) {
    return api.get(`/admin/slip-tests/${id}`);
  },
  slipTestResults(id) {
    return api.get(`/admin/slip-tests/${id}/results`);
  },
  createSlipTest(payload) {
    return api.post('/admin/slip-tests', payload);
  },
  updateSlipTest(id, payload) {
    return api.patch(`/admin/slip-tests/${id}`, payload);
  },
  deleteSlipTest(id) {
    return api.delete(`/admin/slip-tests/${id}`);
  },
  contactQueries(params) {
    return api.get('/admin/contact-queries', { params });
  },
  contactQuery(id) {
    return api.get(`/admin/contact-queries/${id}`);
  },
  updateContactQuery(id, payload) {
    return api.patch(`/admin/contact-queries/${id}`, payload);
  },
  deleteContactQuery(id) {
    return api.delete(`/admin/contact-queries/${id}`);
  },
  settings() {
    return api.get('/admin/settings');
  },
  uploadLogo(formData) {
    return api.post('/admin/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeLogo() {
    return api.delete('/admin/settings/logo');
  },
  createClass(payload) {
    return api.post('/admin/settings/classes', payload);
  },
  updateClass(id, payload) {
    return api.patch(`/admin/settings/classes/${id}`, payload);
  },
  deleteClass(id) {
    return api.delete(`/admin/settings/classes/${id}`);
  },
};

export const contentApi = {
  posts() {
    return api.get('/content/posts');
  },
  post(id) {
    return api.get(`/content/posts/${id}`);
  },
  news() {
    return api.get('/content/news');
  },
  site() {
    return api.get('/content/site');
  },
};

export const worksheetApi = {
  list() {
    return api.get('/worksheets');
  },
  get(id) {
    return api.get(`/worksheets/${id}`);
  },
};

export const unitTestApi = {
  list() {
    return api.get('/unit-tests');
  },
  get(id) {
    return api.get(`/unit-tests/${id}`);
  },
};

export const cetApi = {
  list() {
    return api.get('/cets');
  },
  get(id) {
    return api.get(`/cets/${id}`);
  },
};

export const assessmentApi = {
  list() {
    return api.get('/assessments');
  },
  get(id) {
    return api.get(`/assessments/${id}`);
  },
  start(id) {
    return api.post(`/assessments/${id}/start`);
  },
  fullscreenExit(id) {
    return api.post(`/assessments/${id}/fullscreen-exit`);
  },
  submit(id, payload) {
    return api.post(`/assessments/${id}/submit`, payload);
  },
  result(id) {
    return api.get(`/assessments/${id}/result`);
  },
};

export const dppApi = {
  list() {
    return api.get('/dpps');
  },
  get(id) {
    return api.get(`/dpps/${id}`);
  },
  start(id) {
    return api.post(`/dpps/${id}/start`);
  },
  submit(id, payload) {
    return api.post(`/dpps/${id}/submit`, payload);
  },
  result(id) {
    return api.get(`/dpps/${id}/result`);
  },
};

export const slipTestApi = {
  list() {
    return api.get('/slip-tests');
  },
  get(id) {
    return api.get(`/slip-tests/${id}`);
  },
  start(id) {
    return api.post(`/slip-tests/${id}/start`);
  },
  submit(id, payload) {
    return api.post(`/slip-tests/${id}/submit`, payload);
  },
  result(id) {
    return api.get(`/slip-tests/${id}/result`);
  },
};
