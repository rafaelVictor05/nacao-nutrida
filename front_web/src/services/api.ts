import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Interceptor para adicionar o token em cada requisição
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Se a resposta for sucesso (status 2xx), apenas retorne-a
    return response;
  },
  (error) => {
    // Se a resposta for um erro
    if (error.response && error.response.status === 401) {
      console.error("Interceptor: Token expirado ou inválido. Fazendo logout.");

      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
