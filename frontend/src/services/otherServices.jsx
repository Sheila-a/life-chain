import axios from "axios";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const API_KEY = import.meta.env.VITE_APP_API_KEY;

// const axiosConfig2 = (token) => ({
//   headers: {
//     Authorization: `Bearer ${token}`,
//     // api_key: 'test_98805e8a-003a-4327-80a2-67d197a30188',
//     Accept: "application/json",
//     "Content-Type": "multipart/form-data'",
//   },
// });

const axiosConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    // api_key: 'test_98805e8a-003a-4327-80a2-67d197a30188',
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const axiosConfigJustAPI = () => ({
  headers: {
    // api_key: "test_98805e8a-003a-4327-80a2-67d197a30188",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const handleResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    throw new Error(`Request failed with status ${response.status}`);
  }
};

export const updateResource = async (token, params) => {
  try {
    const url = `${BASE_URL}/resource/update`;
    const response = await axios.post(url, params, axiosConfig(token));

    return handleResponse(response);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const searchResource = async (token, hid, type) => {
  try {
    const url = `${BASE_URL}/resources/search?resourceType=${type}&hospitalId=${hid}`;
    const response = await axios.get(url, axiosConfigJustAPI());

    return handleResponse(response);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const createEqSlot = async (token, params) => {
  try {
    const url = `${BASE_URL}/equipment/create`;
    const response = await axios.post(url, params, axiosConfig(token));

    return handleResponse(response);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const listEqSlot = async () => {
  try {
    const url = `${BASE_URL}/equipment/list?onlyAvailable=true`;
    const response = await axios.get(url, axiosConfigJustAPI());

    return handleResponse(response);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const createBooking = async (token, params) => {
  try {
    const url = `${BASE_URL}/booking/create`;
    const response = await axios.post(url, params, axiosConfig(token));

    return handleResponse(response);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const uploadVaultEntry = async (token, params) => {
  try {
    const url = `${BASE_URL}/vault/upload`;
    const response = await axios.post(url, params, axiosConfig(token));

    return handleResponse(response);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
