import { createRoot } from "react-dom/client";
import { ProfilePhoto } from "../../../examples/profile-photo/web/ProfilePhoto";
import "./unravel-base.css";
import "./unravel.css";
createRoot(document.getElementById("photo-root")!).render(<ProfilePhoto />);
