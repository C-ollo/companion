import { useRegisterSW } from "virtual:pwa-register/react"

// Look for a new version whenever Companion comes back to the screen.
function checkWhenVisible(registration: ServiceWorkerRegistration) {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") registration.update()
  })
}

/**
 * Tells Maya when a new version is ready. It never reloads on its own, so she
 * doesn't lose her place mid-task: she chooses "Update now" or "Later".
 */
export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) checkWhenVisible(registration)
    },
  })

  if (!needRefresh) return null
  return (
    <section className="update-banner" role="status" aria-live="polite">
      <p>
        <b>A new version of Companion is ready.</b>
        <span>Update when you are ready. It takes a moment.</span>
      </p>
      <div>
        <button className="primary-button" onClick={() => updateServiceWorker(true)}>
          Update now
        </button>
        <button className="soft-button" onClick={() => setNeedRefresh(false)}>
          Later
        </button>
      </div>
    </section>
  )
}
