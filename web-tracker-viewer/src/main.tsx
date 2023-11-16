import React from "react";
import ReactDOM from "react-dom/client";

// Chakra-UI
import { ChakraProvider } from "@chakra-ui/react";

import theme from "./theme.ts";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider resetCSS theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
