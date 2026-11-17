import { instance } from '../../shared/api/axiosInstance';

export const loginAdmin = async (email, password) => {
  const response = await instance.post('api/auth/admin/login', {
    email,
    password,
  });
  console.log('Admin Login Response:', response.data); // Log the response for debugging
  return { data: response.data, error: null };
};
