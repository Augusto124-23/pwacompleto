import { Navigate } from "react-router-dom";
import React from "react";

export default function PublicRoute({children}: {children: React.ReactNode}) {
    const token=localStorage.getItem("token");
    return token ? <Navigate to="/dashboard" replace /> : children;
}