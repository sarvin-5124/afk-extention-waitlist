import WaitlistPage from "./components/WaitlistPage";
import DataPage from "./components/DataPage";
import "./index.css";

export default function App() {
  return window.location.pathname === "/data" ? <DataPage /> : <WaitlistPage />;
}
