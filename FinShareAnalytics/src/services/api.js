import axios from "axios";

// Conexión con el backend de FinShare Analytics para realizar solicitudes API

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});


// Pega aquí el token que te devolvió Thunder Client
const tokenTemporal = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OWQ5ZjU0NGMzOGY2NmM0YTExZmI3MWMiLCJlbWFpbCI6ImNvcnJlb0BlamVtcGxvLmNvbSIsImlhdCI6MTc3NTg5MTc4MCwiZXhwIjoxNzc1OTc4MTgwfQ.J0SbsICIW3cG_5Kh0_0vYq_b7anPRKBaQBYWDxZGnI0";

// Le decimos a Axios que siempre envíe este token en la cabecera de autorización
if (tokenTemporal) {
  API.defaults.headers.common["Authorization"] = `Bearer ${tokenTemporal}`;
}

export default API;