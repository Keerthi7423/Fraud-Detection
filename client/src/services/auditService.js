import { auditAPI } from './api';

export const getAuditLogs = async (filters = {}) => {
  const response = await auditAPI.get('/', { params: filters });
  return response.data;
};

export const getTransactionAuditLog = async (id) => {
  const response = await auditAPI.get(`/${id}`);
  return response.data;
};
