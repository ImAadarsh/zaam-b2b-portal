'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Flashlight, RefreshCw, Barcode, Search, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { zaamApi } from '@/lib/api';
import { Product, ProductVariant } from '@/types';
import Link from 'next/link';

interface CameraScannerProps {
  onScanResult: (product: Product, variant: ProductVariant) => void;
}

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike;
  }
}

const DETECTOR_FORMATS = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39',
  'itf',
  'qr_code',
  'data_matrix'
];

const ZXING_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.ITF,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX
];

function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.05;
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 120);
  } catch {
    /* ignore */
  }
}

function hapticPulse() {
  try {
    if (navigator.vibrate) navigator.vibrate(40);
  } catch {
    /* ignore */
  }
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onScanResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<IScannerControls | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastDetectAt = useRef(0);
  const lastCodeRef = useRef('');
  const lookingUpRef = useRef(false);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [engine, setEngine] = useState<'native' | 'zxing' | null>(null);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      zxingControlsRef.current?.stop();
    } catch {
      /* ignore */
    }
    zxingControlsRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setIsScanning(false);
    setTorchOn(false);
  }, []);

  const handleBarcodeLookup = useCallback(
    async (code: string) => {
      const cleanCode = code.trim();
      if (!cleanCode || lookingUpRef.current) return;
      lookingUpRef.current = true;
      setLookupBusy(true);
      setErrorMessage(null);
      try {
        const prod = await zaamApi.getProductByBarcode(cleanCode);
        const matched = prod?.variants.find((v) => v.barcode === cleanCode) || prod?.variants[0];
        if (prod && matched) {
          setNotFoundCode(null);
          playBeep();
          hapticPulse();
          onScanResult(prod, matched);
          setManualBarcode('');
          return;
        }
        setNotFoundCode(cleanCode);
      } catch (e: any) {
        setErrorMessage(e?.message || 'Lookup failed');
      } finally {
        lookingUpRef.current = false;
        setLookupBusy(false);
      }
    },
    [onScanResult]
  );

  const onDetectedCode = useCallback(
    (raw: string) => {
      const code = String(raw || '').trim();
      if (!code) return;
      const now = Date.now();
      if (now - lastDetectAt.current < 1500 && lastCodeRef.current === code) return;
      lastDetectAt.current = now;
      lastCodeRef.current = code;
      void handleBarcodeLookup(code);
    },
    [handleBarcodeLookup]
  );

  const startNativeLoop = useCallback(
    (detector: BarcodeDetectorLike) => {
      const tick = async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const codes = await detector.detect(video);
          if (codes?.[0]?.rawValue) onDetectedCode(codes[0].rawValue);
        } catch {
          /* frame miss */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [onDetectedCode]
  );

  const startZxing = useCallback(
    async (deviceId?: string) => {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS);
      hints.set(DecodeHintType.TRY_HARDER, true);
      const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 250 });
      const controls = await reader.decodeFromVideoDevice(deviceId ?? undefined, videoRef.current!, (result) => {
        if (result) onDetectedCode(result.getText());
      });
      zxingControlsRef.current = controls;
    },
    [onDetectedCode]
  );

  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    setNotFoundCode(null);
    stopCamera();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setHasPermission(false);
        setErrorMessage('Camera access is not supported in this browser. Use manual barcode entry.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const caps = track?.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      setTorchSupported(Boolean(caps?.torch));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      setIsCameraActive(true);
      setIsScanning(true);

      if (typeof window !== 'undefined' && window.BarcodeDetector) {
        try {
          const detector = new window.BarcodeDetector({ formats: DETECTOR_FORMATS });
          setEngine('native');
          startNativeLoop(detector);
          return;
        } catch {
          /* fall through to zxing */
        }
      }

      setEngine('zxing');
      const deviceId = track?.getSettings?.().deviceId;
      // ZXing opens its own stream; release ours first to avoid double-cam
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      await startZxing(deviceId);
    } catch (err: any) {
      console.warn('Camera start failed', err);
      setHasPermission(false);
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Allow camera access or enter the barcode manually.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setErrorMessage('No camera was found on this device. Enter the barcode manually.');
      } else {
        setErrorMessage(err?.message || 'Could not start the camera. Enter the barcode manually.');
      }
    }
  }, [startNativeLoop, startZxing, stopCamera]);

  useEffect(() => {
    void startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const toggleTorch = async () => {
    const track =
      streamRef.current?.getVideoTracks()[0] ||
      (videoRef.current?.srcObject as MediaStream | null)?.getVideoTracks()?.[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorchOn(next);
    } catch {
      setErrorMessage('Torch is not supported on this camera.');
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="relative aspect-square sm:aspect-video max-h-[520px] w-full rounded-3xl bg-neutral-950 overflow-hidden shadow-2xl border border-neutral-800 flex items-center justify-center">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
          playsInline
          muted
        />

        {!isCameraActive && (
          <div className="text-center p-6 text-white space-y-3 z-10 max-w-sm">
            <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto text-zaam-gold-400">
              <Camera className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className="text-base font-bold">Barcode Scanner</h4>
            <p className="text-xs text-neutral-400">
              {errorMessage || 'Point your camera at any EAN, UPC, Code-128/39, ITF, QR, or DataMatrix barcode.'}
            </p>
            <button
              onClick={() => void startCamera()}
              className="bg-zaam-green-600 hover:bg-zaam-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-glow-green btn-press transition-all"
            >
              Start Camera
            </button>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
            <div className="relative w-64 h-64 sm:w-80 sm:h-52 border-2 border-zaam-green-400/80 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(13,120,68,0.4)]">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-zaam-gold-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-zaam-gold-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-zaam-gold-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-zaam-gold-400 rounded-br-lg" />
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-zaam-green-400 to-transparent shadow-glow-green animate-scan-beam" />
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <span className="bg-black/60 backdrop-blur text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-zaam-green-400 animate-ping" />
            {engine === 'native' ? 'BarcodeDetector' : engine === 'zxing' ? 'ZXing fallback' : 'Starting…'}
            {lookupBusy ? ' · Looking up…' : ''}
          </span>

          <div className="flex items-center space-x-2">
            {torchSupported && (
              <button
                onClick={() => void toggleTorch()}
                className={`p-2.5 rounded-full backdrop-blur transition-colors ${
                  torchOn ? 'bg-zaam-gold-500 text-zaam-dark-950' : 'bg-black/60 text-white hover:bg-black/80'
                }`}
                title="Toggle Torch"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => void startCamera()}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-colors"
              title="Restart Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4">
        <div>
          <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
            Manual Barcode Entry
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleBarcodeLookup(manualBarcode)}
                placeholder="Scan failed? Type barcode here"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-zaam-green-600 focus:bg-white font-mono"
              />
            </div>
            <button
              onClick={() => void handleBarcodeLookup(manualBarcode)}
              disabled={lookupBusy}
              className="bg-zaam-dark-900 hover:bg-zaam-dark-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl btn-press disabled:opacity-50"
            >
              Lookup
            </button>
          </div>
        </div>

        {errorMessage && hasPermission !== false && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}

        {notFoundCode && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <p className="text-xs font-bold text-amber-900">Not in your wholesale catalog</p>
            <p className="text-xs text-amber-800">
              Scanned code <span className="font-mono font-semibold">{notFoundCode}</span> was not found in the ERP B2B
              catalog. No product was invented.
            </p>
            <Link
              href={`/shop?search=${encodeURIComponent(notFoundCode)}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zaam-green-800 hover:underline"
            >
              <Search className="w-3.5 h-3.5" />
              Search catalog for this code
            </Link>
          </div>
        )}

        <p className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
          Supported: EAN-13, EAN-8, UPC-A, UPC-E, Code-128, Code-39, ITF, QR, DataMatrix. Uses the browser BarcodeDetector
          API when available, otherwise ZXing.
        </p>
      </div>
    </div>
  );
};
