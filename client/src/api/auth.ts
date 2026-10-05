import { apiClient } from "./client";

export interface AuthUser {
  id: string;
  username: string;
  role: "admin" | "user";
}

interface AuthResponse {
  user: AuthUser;
}

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await apiClient<AuthResponse>("/auth/me");

  return response.user;
};

export const login = async (
  username: string,
  password: string,
): Promise<AuthUser> => {
  const response = await apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });

  return response.user;
};

export const logout = async (): Promise<void> => {
  await apiClient("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
};
