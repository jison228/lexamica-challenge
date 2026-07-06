import { apiClient } from '@/api/client';
import type { User } from './types';

/** Client-side: fetch the current user (throws on 401). */
export const getMe = () => apiClient.get<User>('/me');
