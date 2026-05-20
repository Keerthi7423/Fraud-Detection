import { authAPI } from './api';

export const getUsers = async () => {
  const response = await authAPI.get('/users');
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await authAPI.patch(`/users/${id}/toggle`);
  return response.data;
};
