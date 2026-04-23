"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // MUST match multer field name

    const response = await fetch("http://localhost:3000/uploadImage", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleUpload} style={{ marginTop: 12 }}>
        Upload Image
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
