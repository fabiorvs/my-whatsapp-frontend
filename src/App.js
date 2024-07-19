import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import Status from "./components/Status";
import "./App.css";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState("");
  const [isClientReady, setIsClientReady] = useState(true);
  const [initialClientReady, setInitialClientReady] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/qrcode`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus(response.data.message);
        if (response.data.qrcode) {
          setQrCode(response.data.qrcode);
          setIsClientReady(false);
        } else {
          setIsClientReady(true);
        }
      } catch (error) {
        console.error("Error fetching QR code:", error);
      }
    };

    const checkConnection = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/check-connection`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentClientReady = response.data.isClientReady;
        if (initialClientReady === null) {
          setInitialClientReady(currentClientReady);
        } else if (currentClientReady !== initialClientReady) {
          window.location.reload();
        }
        setIsClientReady(currentClientReady);
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    if (token) {
      fetchQrCode();
      const checkConnectionInterval = setInterval(checkConnection, 5000); // Verificar a cada 5 segundos
      const refreshQrCodeInterval = setInterval(() => {
        if (!isClientReady) {
          fetchQrCode();
        }
      }, 30000); // Recarregar QR code a cada 30 segundos se o cliente não estiver pronto

      return () => {
        clearInterval(checkConnectionInterval);
        clearInterval(refreshQrCodeInterval);
      }; // Limpar intervalos ao desmontar
    }
  }, [token, isClientReady, backendUrl, initialClientReady]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setIsClientReady(true);
  };

  return (
    <div className="app-container">
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <div className="status-container">
          <Status status={status} qrCode={qrCode} />
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
