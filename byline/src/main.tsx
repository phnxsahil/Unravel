import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./ravel/App.tsx";

const root = document.getElementById("root")!;
if (root.dataset.prerendered === (location.pathname.replace(/\/$/, "") || "/"))
  hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
