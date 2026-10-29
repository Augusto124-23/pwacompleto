export type Filter = "all" | "active" | "completed" | "overdue";

export type Sort = "recent" | "oldest" | "alphabetical" | "dueDate" | "priority"; // <-- Añadido aquí

// Alineado con las mayúsculas de tu modelo de Mongoose
export const PRIORITIES = ["Baja", "Media", "Alta"] as const; 
export type Priority = typeof PRIORITIES[number];

export const STATUSES = ["Pendiente", "En Progreso", "Completada"] as const;
export type Status = typeof STATUSES[number];

export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed?: boolean;
  clienteId?: string;
  status?: string;
  priority?: Priority;
  pending?: boolean;
  dueDate?: string | Date | null;
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