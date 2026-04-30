import { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';

// Live barcode scanner driven by Quagga. The caller passes in a ref to a
// container <div>; we attach the live camera feed there and emit each detected
// code via onDetected. Re-detections of the same code are debounced.

export function useScanner({ targetRef, enabled, onDetected }) {
  const lastCodeRef = useRef({ code: null, at: 0 });
  const onDetectedRef = useRef(onDetected);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  // Keep the latest callback in a ref so the init effect doesn't depend on
  // identity-unstable closures from the parent. Without this, every parent
  // re-render tore down and re-initialised Quagga, which manifested as a
  // rapidly blinking camera feed.
  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    let cancelled = false;
    setError(null);

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: targetRef.current,
          constraints: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        locator: { patchSize: 'medium', halfSample: true },
        numOfWorkers: navigator.hardwareConcurrency ? Math.min(4, navigator.hardwareConcurrency) : 2,
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader', 'code_128_reader'],
        },
        locate: true,
      },
      (err) => {
        if (cancelled) return;
        if (err) {
          setError(err);
          return;
        }
        Quagga.start();
        setRunning(true);
      },
    );

    const handler = (result) => {
      const code = result?.codeResult?.code;
      if (!code) return;
      const now = Date.now();
      if (lastCodeRef.current.code === code && now - lastCodeRef.current.at < 1500) return;
      lastCodeRef.current = { code, at: now };
      onDetectedRef.current?.(code);
    };

    Quagga.onDetected(handler);

    return () => {
      cancelled = true;
      try {
        Quagga.offDetected(handler);
        Quagga.stop();
      } catch {
        // already stopped
      }
      setRunning(false);
    };
  }, [enabled, targetRef]);

  return { running, error };
}
