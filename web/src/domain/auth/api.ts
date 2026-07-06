import { apiClient } from '@/api/client';
import type { User } from '@/domain/user/types';
import type { LoginInput } from './types';

/** Exchange credentials for a session cookie; returns the authenticated user. */
export const login = (input: LoginInput) =>
  apiClient.post<User>('/auth/login', input);

/** Clear the session cookie server-side. */
export const logout = () => apiClient.post<{ success: true }>('/auth/logout');
