import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import UpdateBanner from "./UpdateBanner"
import "./index.css"

// The earlier hand-written service worker cached everything under these names
// forever. The new one manages its own versioned caches, so clear the old ones.
if ("caches" in window) {
  for (const legacy of ["companion-v1", "alongside-v1"]) caches.delete(legacy)
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <UpdateBanner />
  </React.StrictMode>,
)
