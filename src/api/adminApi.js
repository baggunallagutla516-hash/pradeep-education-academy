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
  setStudentActive(id, isActive) {
    return api.patch(`/admin/students/${id}/active`, { isActive });
  },
  addParentToStudent(studentId, payload) {
    return api.post(`/admin/students/${studentId}/parents`, payload);
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
  posts() {
    return api.get('/admin/posts');
  },
  post(id) {
    return api.get(`/admin/posts/${id}`);
  },
  createPost(formData) {
    return api.post('/admin/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updatePost(id, formData) {
    return api.patch(`/admin/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deletePost(id) {
    return api.delete(`/admin/posts/${id}`);
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
};

export const worksheetApi = {
  list() {
    return api.get('/worksheets');
  },
  get(id) {
    return api.get(`/worksheets/${id}`);
  },
};
