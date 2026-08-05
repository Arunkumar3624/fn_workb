
  import { createRoot } from "react-dom/client";
  import App from "./app/App.jsx";
  import { initMonitoring } from "./app/lib/monitoring.js";
  import { initAnalytics } from "./app/lib/analytics.js";
  import { registerServiceWorker } from "./app/lib/pushNotifications.js";
  import "./styles/index.css";
  import "./styles/main.css";

  initMonitoring();
  initAnalytics();
  registerServiceWorker();

  createRoot(document.getElementById("root")).render(<App />);
