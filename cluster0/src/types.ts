export type Filter = "all" | "active" | "completed" | "overdue";

export type Sort = "recent" | "oldest" | "alphabetical" | "dueDate";

// Agrega estas constantes que te está reclamando la consola:
export const PRIORITIES = ["baja", "media", "alta"] as const; // O los valores que utilices en tu app
export const STATUSES = ["Pendiente", "En proceso", "Completada"] as const;

export interface Task {
  _id: string;
  title: string;
  completed?: boolean;
  clienteId?: string;
  status?: string;
  pending?: boolean;
  dueDate?: string | Date;
  createdAt?: string | Date;
}

export type TaskInput = Omit<Task, "_id" | "clienteId" | "status" | "createdAt" | "pending">;

export type TaskPatch = Partial<Task>;

export interface Stats {
  total: number;
  active: number;
  done: number;
  overdue: number;
  unsynced: number;
  progress: number;
}