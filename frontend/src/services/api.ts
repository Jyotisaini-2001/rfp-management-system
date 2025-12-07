import axios from 'axios';
import type { RFP, Vendor, Proposal, ComparisonResult } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// RFP APIs
export const rfpAPI = {
  create: (input: string) => api.post<RFP>('/rfps', { input }),
  getAll: () => api.get<RFP[]>('/rfps'),
  getOne: (id: string) => api.get<RFP>(`/rfps/${id}`),
  update: (id: string, data: Partial<RFP>) => api.put<RFP>(`/rfps/${id}`, data),
  delete: (id: string) => api.delete(`/rfps/${id}`),
  send: (id: string, vendorIds: string[]) => api.post(`/rfps/${id}/send`, { vendorIds }),
  compare: (id: string) => api.post<ComparisonResult>(`/rfps/${id}/compare`),
};

// Vendor APIs
export const vendorAPI = {
  create: (data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Vendor>('/vendors', data),
  getAll: () => api.get<Vendor[]>('/vendors'),
  getOne: (id: string) => api.get<Vendor>(`/vendors/${id}`),
  update: (id: string, data: Partial<Vendor>) => api.put<Vendor>(`/vendors/${id}`, data),
  delete: (id: string) => api.delete(`/vendors/${id}`),
};

// Proposal APIs
export const proposalAPI = {
  receiveInbound: (data: {
    rfpId: string;
    vendorId: string;
    email: string;
    subject?: string;
  }) => api.post<Proposal>('/proposals/inbound', data),
  getByRFP: (rfpId: string) => api.get<Proposal[]>(`/proposals/rfp/${rfpId}`),
  getOne: (id: string) => api.get<Proposal>(`/proposals/${id}`),
  reparse: (id: string) => api.post<Proposal>(`/proposals/${id}/reparse`),
  updateStatus: (id: string, status: string) =>
    api.put<Proposal>(`/proposals/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/proposals/${id}`),
};

export default api;
