import mongoose from "mongoose";

let cached = global._mongooseConn;

if (!cached) {
  cached = global._mongooseConn = {
    conn: null,
    promise: null,
  };
}

export async function connectToDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const { MONGO_URI } = process.env;

    if (!MONGO_URI) {
      throw new Error("Falta MONGO_URI en las variables de entorno");
    }

    console.log("Intentando conectar a MongoDB Atlas...");

    cached.promise = mongoose
      .connect(MONGO_URI, {
        dbName: "BackPWA",
        autoIndex: !process.env.VERCEL,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB conectado correctamente");
        return mongooseInstance.connection;
      })
      .catch((error) => {
        console.error("Error de conexión MongoDB:", error.message);
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}