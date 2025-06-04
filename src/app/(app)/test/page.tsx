"use client";

import { useEffect, useRef, useState } from "react";

export default function WebcamTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e: any) {
        setLog((l) => [...l, `${e.name}: ${e.message}`]);
      }
    }
    setupCamera();
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-video bg-black"
      />
      <div style={{ marginTop: 12 }}>
        {log.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
}
