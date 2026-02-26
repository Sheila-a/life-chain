import axios from "axios";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const API_KEY = import.meta.env.VITE_APP_API_KEY;

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
    // return response;
    throw new Error(`Request failed with status ${response.status}`);
  }
};

export const createHospital = async (params) => {
  try {
    const url = `${BASE_URL}/register-hospital`;
    const response = await axios.post(url, params, axiosConfigJustAPI());

    return handleResponse(response);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const loginUser = async (params) => {
  try {
    const url = `${BASE_URL}/login`;
    const response = await axios.post(url, params, axiosConfigJustAPI());

    return handleResponse(response);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
