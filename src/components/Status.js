import React from "react";

const Status = ({ status, qrCode }) => {
  return (
    <div className="status-container">
      <h2>{status}</h2>
      {qrCode && (
        <div className="qr-code">
          <img src={qrCode} alt="QR Code" />
        </div>
      )}
    </div>
  );
};

export default Status;
