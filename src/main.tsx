import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { GameProvider } from "./contexts/GameContext.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <GameProvider>
      <App />
    </GameProvider>
  </Provider>
);
