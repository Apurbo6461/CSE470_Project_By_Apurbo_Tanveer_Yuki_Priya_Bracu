import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api/doctors" });

export const createDoctor = (data) => API.post("/create", data);
export const updateAvailability = (id, data) => API.put(`/availability/${id}`, data);
export const getDoctors = () => API.get("/");