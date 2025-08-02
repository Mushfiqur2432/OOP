import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter} from "react-router";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./config/routes";
import { ChatProvider } from "./context/ChatContext.jsx";



createRoot(document.getElementById('root')).render(
  
  <BrowserRouter>
    <Toaster position="top-center"/>
    <ChatProvider>
      <AppRoutes />
    </ChatProvider>
  </BrowserRouter>
  
);
