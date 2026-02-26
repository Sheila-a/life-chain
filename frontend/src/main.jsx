import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import CustomToastContainer from "./components/Toast.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter basename="/">
    <AuthProvider>
      <App />
      <CustomToastContainer />
    </AuthProvider>
  </BrowserRouter>,
  // </StrictMode>
);
