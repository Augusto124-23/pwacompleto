// src/db/connect.js — conexión cacheada (segura en serverless)
import mongoose from "mongoose";

let cached = global._mongooseConn;
if (!cached) cached = global._mongooseConn = { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) throw new Error("Falta MONGO_URI");

    cached.promise = mongoose
      .connect(MONGO_URI, {
        dbName: "BackPWA",
        // En Vercel no construimos índices en cada arranque en frío;
        // se crean una vez con `npm run db:indexes`.
        autoIndex: !process.env.VERCEL,
      })
      .then((m) => m.connection)
      .catch((err) => {
        // Si falla, borramos la promesa para que el siguiente request reintente.
        // (Antes, una falla dejaba la API rota hasta el siguiente cold start.)
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}