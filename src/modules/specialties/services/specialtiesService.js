import { instance } from "../../shared/api/axiosInstance";

export const getSpecialties = async (pageSize = 10, pageIndex = 1, name = '') => {
    const params = { pageSize, pageIndex };
    if (name && name.length >= 3) {
        params.name = name;
    }
    const response = await instance.get('api/specialties', { params });
    return response.data;
};

export const createSpecialty = async (name, description) => {
    const response = await instance.post('api/specialties', { name, description });
    return response.data;
};

export const updateSpecialty = async (id, name, description) => {
    const response = await instance.put(`api/specialties/${id}`, { name, description });
    return response.data;
};

export const deleteSpecialty = async (id) => {
    const response = await instance.delete(`api/specialties/${id}`);
    return response.data;
};