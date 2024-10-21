import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:11434'; // Replace with the correct base URL

export const sendMessageToLLM = async (message: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      message: message,
      api_key: process.env.REACT_APP_LLM_API_KEY, // Ensure your API key is in the .env file
    });
    return response.data;
  } catch (error) {
    console.error("Error communicating with LLM API", error);
    throw error;
  }
};
