import React, { useState, useEffect } from "react";
import Quagga from "quagga";
import axios from "axios";
// import { Card, Button, Input } from "@/components/ui";

export default function BarcodeScanner() {
  const [scannedCodes, setScannedCodes] = useState([]);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          constraints: { width: 640, height: 480, facingMode: "environment" },
        },
        decoder: { readers: ["ean_reader", "code_128_reader"] },
      },
      (err) => {
        if (err) {
          console.error("Error initializing Quagga", err);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((data) => {
      const code = data.codeResult.code;
      if (!scannedCodes.includes(code)) {
        setScannedCodes([...scannedCodes, code]);
        sendCodeToDatabase(code);
      }
    });

    return () => Quagga.stop();
  }, [scannedCodes]);

  const sendCodeToDatabase = async (code) => {
    try {
      await axios.post("http://localhost:5000/api/barcodes", { barcode: code });
    } catch (error) {
      console.error("Error saving barcode", error);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim() !== "") {
      setScannedCodes([...scannedCodes, manualCode]);
      sendCodeToDatabase(manualCode);
      setManualCode("");

      console.log(scannedCodes);
    }
  };

  return (
    <div className="p-4 w-full max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Multi Barcode Scanner</h2>
      <div id="interactive" className="viewport mb-4"></div>
      <input
        value={manualCode}
        onChange={(e) => setManualCode(e.target.value)}
        placeholder="Enter barcode manually"
        className="mb-2"
      />
      <button onClick={handleManualSubmit} className="mb-4">
        Submit
      </button>
      <h3 className="text-lg font-semibold">Scanned Codes:</h3>
      <ul>
        {scannedCodes.map((code, index) => (
          <li key={index} className="text-sm">
            {code}
          </li>
        ))}
      </ul>
    </div>
  );
}
