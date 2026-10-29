// Avisa cuando hay una versión nueva de la app (service worker en espera)
/// <reference types="vite-plugin-pwa/client" />
import { type Dispatch, type SetStateAction } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

declare module "virtual:pwa-register/react" {
  type SWStateTuple = [boolean, Dispatch<SetStateAction<boolean>>];

  interface RegisterSWReturn {
    needRefresh: SWStateTuple;
    offlineReady: SWStateTuple;
    updateServiceWorker: (reload?: boolean) => Promise<void> | void;
  }

  interface RegisterSWOptions {
    onRegisteredSW?: (
      url: string,
      reg: ServiceWorkerRegistration | undefined,
    ) => void;
  }

  export function useRegisterSW(
    options?: RegisterSWOptions,
  ): RegisterSWReturn;
}

export default function PwaUpdater() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url: string, reg: ServiceWorkerRegistration | undefined) {
      // Revisa si hay versión nueva cada hora (útil si la app queda abierta todo el día)
      if (reg) setInterval(() => void reg.update(), 60 * 60 * 1000);
    },
  });

  return (
    <>
      {offlineReady && (
        <div className="update-bar" role="status">
          <span>Lista para usarse sin conexión.</span>
          <button className="btn ghost" onClick={() => setOfflineReady(false)}>
            Cerrar
          </button>
        </div>
      )}
      {needRefresh && (
        <div className="update-bar" role="alert">
          <span>Hay una versión nueva de la app.</span>
          <div className="update-actions">
            <button className="btn ghost" onClick={() => setNeedRefresh(false)}>Después</button>
            <button className="btn primary" onClick={() => updateServiceWorker(true)}>Actualizar</button>
          </div>
        </div>
      )}
    </>
  );
}