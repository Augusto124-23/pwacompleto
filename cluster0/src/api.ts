import axios from "axios";

export const api = axios.create({
    baseURL: "https://pwacompleto-dun.vercel.app/api",
    timeout: 15_000,
});

export function setAuth(token: string | null){
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete api.defaults.headers.common["Authorization"];
}

setAuth(localStorage.getItem("token"));

api.interceptors.response.use(
    (r) => r,
    (err) => {
        const url = String(err.config?.url ?? "");
        if (err.response?.status === 401 && !url.startsWith("/auth")) {
            localStorage.removeItem("token");
            setAuth(null);
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export function errorMessage(err: unknown, fallback = "Error de conexión con el servidor.") {
    if (axios.isAxiosError(err)) {
        if (!err.response) return "sin conexión con el servidor.";
        return (err.response.data as {message?: string}).message ?? fallback;
    }
    return err instanceof Error ? err.message : fallback;
}