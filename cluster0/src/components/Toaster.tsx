import { useEffect, useState } from "react";

type ToastItem = {
  id: string | number;
  kind: string;
  message: string;
};

function onToast(callback: (toast: ToastItem) => void) {
  const handleToast = (event: Event) => {
    callback((event as CustomEvent<ToastItem>).detail);
  };

  window.addEventListener("toast", handleToast);
  return () => window.removeEventListener("toast", handleToast);
}

export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(
    () =>
      onToast((t: ToastItem) => {
        setItems((prev) => [...prev, t]);
        setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3500);
      }),
    []
  );

  return (
    <div className="toaster" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>{t.message}</div>
      ))}
    </div>
  );
}