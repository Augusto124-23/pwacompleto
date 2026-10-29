import Task from "../models/Task.js";

const allowedStatuses = ["Pendiente", "En Progreso", "Completada"];

function parsePriority(p) {
  if (!p) return "Media";
  // Si por error llega un objeto o evento, intentamos extraer su valor
  const val = typeof p === "object" && p !== null ? (p.value ?? p.target?.value ?? "Media") : p;
  const lower = String(val).toLowerCase().trim();
  if (lower === "alta") return "Alta";
  if (lower === "baja") return "Baja";
  if (lower === "media") return "Media";
  return "Media";
}

export async function list(req, res) {
  const items = await Task.find({ user: req.userId, deleted: false }).sort({ createdAt: -1 });
  res.json({ items });
}

export async function create(req, res) {
  const { title, description = "", status = "Pendiente", priority, dueDate, clienteId } = req.body;
  if (!title) return res.status(400).json({ message: "El título es requerido" });

  const task = await Task.create({
    user: req.userId,
    title,
    description,
    status: allowedStatuses.includes(status) ? status : "Pendiente",
    priority: parsePriority(priority),
    dueDate: dueDate ? new Date(dueDate) : null,
    clienteId,
  });

  res.status(201).json({ task });
}

export async function update(req, res) {
  const { id } = req.params;
  let { title, description, status, completed, priority, dueDate } = req.body;

  if (typeof completed === "boolean") {
    status = completed ? "Completada" : "Pendiente";
  }

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  const set = {};
  if (typeof title === "string") set.title = title.trim();
  if (typeof description === "string") set.description = description.trim();
  if (status) set.status = status;
  if (priority !== undefined) set.priority = parsePriority(priority);
  if (dueDate !== undefined) set.dueDate = dueDate ? new Date(dueDate) : null;

  const task = await Task.findOneAndUpdate(
    { _id: id, user: req.userId },
    { $set: set },
    { new: true }
  );

  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
  res.json({ task });
}

export async function remove(req, res) {
  const { id } = req.params;
  const task = await Task.findOneAndUpdate(
    { _id: id, user: req.userId },
    { deleted: true },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
  res.json({ ok: true });
}

/** Sincronización offline (bulksync) */
export async function bulksync(req, res) {
  const { tasks = [] } = req.body;
  const mapping = [];

  for (const t of tasks) {
    if (!t?.clienteId || !t?.title) continue;

    const cleanPriority = parsePriority(t.priority);
    const cleanDueDate = t.dueDate ? new Date(t.dueDate) : null;
    const cleanStatus = allowedStatuses.includes(t.status) ? t.status : "Pendiente";

    let doc = await Task.findOne({ user: req.userId, clienteId: t.clienteId });
    if (!doc) {
      doc = await Task.create({
        user: req.userId,
        title: t.title,
        description: t.description ?? "",
        status: cleanStatus,
        priority: cleanPriority,
        dueDate: cleanDueDate,
        clienteId: t.clienteId,
      });
    } else {
      doc.title = t.title ?? doc.title;
      doc.description = t.description ?? doc.description;
      doc.status = cleanStatus;
      doc.priority = cleanPriority;
      doc.dueDate = cleanDueDate;
      await doc.save();
    }

    mapping.push({ clienteId: t.clienteId, serverId: String(doc._id) });
  }

  res.json({ mapping });
}