import apiClient from "./client";

export const registerUser = async (userData) => {
  const response = await apiClient.post(
    "/register/",
    userData
  );

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post(
    "/token/",
    credentials
  );

  localStorage.setItem(
    "access_token",
    response.data.access
  );

  localStorage.setItem(
    "refresh_token",
    response.data.refresh
  );

  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get("/profile/");
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};