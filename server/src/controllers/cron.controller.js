import Task from "../models/Task.js";
import { pushEnabled, sendToUser } from "../services/push.service.js";

const WINDOW_MIN = Number(process.env.REMINDER_WINDOW_MIN || 60);
const TZ = process.env.APP_TIMEZONE || "America/Mexico_City";

export async function reminders(req, res) {
  // Validar autorización
  const secret = process.env.CRON_SECRET;

  if (!secret || req.get("authorization") !== `Bearer ${secret}`) {
    return res.status(401).json({
      message: "No autorizado",
    });
  }

  try {
    console.log("CRON: Iniciando procesamiento de recordatorios");

    // Verificar configuración de Web Push
    if (!pushEnabled()) {
      console.error("CRON: Faltan claves VAPID");

      return res.status(503).json({
        message: "Push no configurado",
      });
    }

    console.log("CRON: Configuración VAPID correcta");

    const now = new Date();
    const limit = new Date(
      now.getTime() + WINDOW_MIN * 60_000
    );

    // Consultar tareas pendientes
    const tasks = await Task.find({
      deleted: false,
      status: { $ne: "Completada" },
      remindedAt: null,
      dueDate: {
        $ne: null,
        $lte: limit,
      },
    })
      .sort({ dueDate: 1 })
      .limit(500);

    console.log("CRON: Tareas encontradas:", tasks.length);

    // Agrupar tareas por usuario
    const byUser = new Map();

    for (const task of tasks) {
      const userId = String(task.user);

      if (!byUser.has(userId)) {
        byUser.set(userId, []);
      }

      byUser.get(userId).push(task);
    }

    const fmt = new Intl.DateTimeFormat("es-MX", {
      timeZone: TZ,
      dateStyle: "medium",
      timeStyle: "short",
    });

    const totals = {
      notified: 0,
      failed: 0,
      removed: 0,
      usersWithoutDevices: 0,
    };

    // Enviar notificaciones
    for (const [userId, list] of byUser) {
      let payload;

      if (list.length === 1) {
        const [task] = list;
        const overdue = task.dueDate < now;

        payload = {
          title: overdue
            ? "Tarea vencida"
            : "Tarea por vencer",
          body: `${task.title} — ${
            overdue ? "venció" : "vence"
          } el ${fmt.format(task.dueDate)}`,
          url: "/dashboard",
          tag: `task-${task._id}`,
        };
      } else {
        payload = {
          title: `Tienes ${list.length} tareas por vencer`,
          body:
            list
              .slice(0, 3)
              .map((task) => `• ${task.title}`)
              .join("\n") +
            (list.length > 3 ? "\n…" : ""),
          url: "/dashboard",
          tag: "reminders",
        };
      }

      const result = await sendToUser(userId, payload);

      totals.notified += result.sent;
      totals.failed += result.failed;
      totals.removed += result.removed;

      if (
        !result.sent &&
        !result.failed &&
        !result.removed
      ) {
        totals.usersWithoutDevices++;
      }
    }

    // Marcar tareas recordadas
    if (tasks.length > 0) {
      await Task.updateMany(
        {
          _id: {
            $in: tasks.map((task) => task._id),
          },
        },
        {
          $set: {
            remindedAt: now,
          },
        }
      );
    }

    console.log("CRON: Finalizado", totals);

    return res.json({
      ok: true,
      checked: tasks.length,
      users: byUser.size,
      remindersMarked: tasks.length,
      ...totals,
    });

  } catch (error) {
    console.error("Error ejecutando recordatorios:", error);

    return res.status(500).json({
      message: "Error interno al procesar recordatorios",
    });
  }
}