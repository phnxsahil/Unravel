import { createRoot } from "react-dom/client";
import { Search } from "../../../examples/search-flow/Search";
import "./ravel.css";
import "./unravel.css";
createRoot(document.getElementById("search-root")!).render(<Search />);
