import apiClient from "./client";

export const getProfile = async () => {
  const response = await apiClient.get("/profile/");
  return response.data;
};