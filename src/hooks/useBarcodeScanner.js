import { useEffect, useRef, useState } from 'react';

// Live barcode scanner. Tries the native BarcodeDetector API first (Safari
// 17+, all modern Chromium) and falls back to Quagga.js for old browsers.
// Lifecycle is bulletproof: a single init effect keyed only on `enabled` and
// the target ref, with the latest callback held in a ref so identity-unstable
// closures from the parent never re-trigger camera teardown.

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'];

export function useBarcodeScanner({ targetRef, enabled, onDetected }) {
  const onDetectedRef = useRef(onDetected);
  const lastCodeRef = useRef({ code: null, at: 0 });
  const [running, setRunning] = useState(false);
  const [engine, setEngine] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    let cancelled = false;
    let stream = null;
    let video = null;
    let rafId = null;
    let quaggaActive = false;
    setError(null);
    setRunning(false);
    setEngine(null);

    function emitCode(code) {
      if (!code) return;
      const now = Date.now();
      if (lastCodeRef.current.code === code && now - lastCodeRef.current.at < 1500) return;
      lastCodeRef.current = { code, at: now };
      onDetectedRef.current?.(code);
    }

    async function startNative() {
      const Detector = window.BarcodeDetector;
      // Filter formats by what the platform actually supports.
      let supported = FORMATS;
      try {
        const list = await Detector.getSupportedFormats?.();
        if (Array.isArray(list) && list.length) supported = FORMATS.filter((f) => list.includes(f));
      } catch {
        // older implementations don't expose getSupportedFormats; use defaults.
      }
      const detector = new Detector({ formats: supported });

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (cancelled) return;

      video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000';
      targetRef.current.appendChild(video);
      await video.play();
      if (cancelled) return;

      setRunning(true);
      setEngine('native');

      const tick = async () => {
        if (cancelled || !video) return;
        try {
          if (video.readyState >= 2) {
            const codes = await detector.detect(video);
            if (codes && codes[0]) emitCode(codes[0].rawValue);
          }
        } catch {
          // transient frame errors are fine
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    async function startQuagga() {
      const Quagga = (await import('quagga')).default;
      await new Promise((resolve, reject) => {
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
            numOfWorkers: navigator.hardwareConcurrency
              ? Math.min(4, navigator.hardwareConcurrency)
              : 2,
            decoder: {
              readers: [
                'ean_reader',
                'ean_8_reader',
                'upc_reader',
                'upc_e_reader',
                'code_128_reader',
              ],
            },
            locate: true,
          },
          (err) => {
            if (err) return reject(err);
            Quagga.start();
            quaggaActive = true;
            setRunning(true);
            setEngine('quagga');
            resolve();
          },
        );
      });
      Quagga.onDetected((res) => emitCode(res?.codeResult?.code));
    }

    (async () => {
      try {
        if ('BarcodeDetector' in window) {
          await startNative();
        } else {
          await startQuagga();
        }
      } catch (e) {
        if (cancelled) return;
        // If native failed for any reason, try Quagga.
        try {
          if (engine !== 'quagga') await startQuagga();
        } catch (e2) {
          setError(e2 ?? e);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (video) {
        video.pause();
        video.srcObject = null;
        video.remove();
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (quaggaActive) {
        // dynamic import path: pull from window if cached
        import('quagga').then(({ default: Q }) => {
          try {
            Q.stop();
          } catch {
            // already stopped
          }
        });
      }
      setRunning(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, targetRef]);

  return { running, error, engine };
}
