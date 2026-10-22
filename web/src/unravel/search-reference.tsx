import { createRoot } from "react-dom/client";
import { Search } from "../../../examples/search-flow/Search";
import "./unravel-base.css";
import "./unravel.css";
createRoot(document.getElementById("search-root")!).render(<Search />);
