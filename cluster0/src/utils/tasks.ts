import { STATUSES, type Filter, type Priority, type Sort, type Status, type Task } from "../types";

/** Los ids de Mongo son 24 caracteres hex; cualquier otro es un id local (offline). */
export const isLocalId = (id: string) => !/^[a-f0-9]{24}$/i.test(id);

export function newId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parsePriorityFrontend(p: unknown): Priority {
  if (!p) return "Media";
  const val = typeof p === "object" && p !== null ? (p as any).value ?? (p as any).target?.value ?? "Media" : p;
  const lower = String(val).toLowerCase().trim();
  if (lower === "alta") return "Alta";
  if (lower === "baja") return "Baja";
  if (lower === "media") return "Media";
  return "Media";
}

/** Normaliza lo que venga del backend o del cache local */
export function normalizeTask(x: any): Task {
  return {
    _id: String(x?._id ?? x?.id ?? x?.clienteId),
    title: String(x?.title ?? "(sin título)"),
    description: String(x?.description ?? ""),
    status: STATUSES.includes(x?.status) ? (x.status as Status) : "Pendiente",
    priority: parsePriorityFrontend(x?.priority),
    dueDate: x?.dueDate ? new Date(x.dueDate).toISOString() : null,
    clienteId: x?.clienteId,
    createdAt: x?.createdAt,
    pending: !!x?.pending,
  };
}

export const isDone = (t: Task) => t.status === "Completada";
export const isOverdue = (t: Task, now = Date.now()) =>
  !!t.dueDate && !isDone(t) && new Date(t.dueDate).getTime() < now;

export const statusSlug = (s: Status) =>
  s === "En Progreso" ? "progreso" : s === "Completada" ? "completada" : "pendiente";

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const abs = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

export function dueRelative(iso: string) {
  const mins = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}
export const dueAbsolute = (iso: string) => abs.format(new Date(iso));

export function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
export const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

// ---------- Filtros y orden ----------
const PRIORITY_WEIGHT: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };
const dueTime = (t: Task) => (t.dueDate ? new Date(t.dueDate).getTime() : Number.MAX_SAFE_INTEGER);

export function filterTasks(tasks: Task[], search: string, filter: Filter) {
  const s = search.trim().toLowerCase();
  const now = Date.now();
  return tasks.filter((t) => {
    if (s && !t.title.toLowerCase().includes(s) && !t.description?.toLowerCase().includes(s)) return false;
    if (filter === "active") return !isDone(t);
    if (filter === "completed") return isDone(t);
    if (filter === "overdue") return isOverdue(t, now);
    return true;
  });
}

export function sortTasks(tasks: Task[], sort: Sort) {
  return [...tasks].sort((a, b) => {
    if (isDone(a) !== isDone(b)) return isDone(a) ? 1 : -1;
    if (sort === "dueDate") return dueTime(a) - dueTime(b);
    if (sort === "priority") {
      const pA = parsePriorityFrontend(a.priority);
      const pB = parsePriorityFrontend(b.priority);
      return (PRIORITY_WEIGHT[pA] ?? 1) - (PRIORITY_WEIGHT[pB] ?? 1) || dueTime(a) - dueTime(b);
    }
    return String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
  });
}