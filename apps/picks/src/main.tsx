import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@aws-amplify/ui-react/styles.css";
import "./lib/amplify";
import Root from "./pages/Root";
import "./styles/app.css";
import "./styles/auth.css";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
