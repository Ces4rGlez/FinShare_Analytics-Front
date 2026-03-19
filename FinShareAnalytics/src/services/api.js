import axios from "axios";

// Conexión con el backend de FinShare Analytics para realizar solicitudes API

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export default API;