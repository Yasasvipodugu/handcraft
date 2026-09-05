import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../services/database';
import { api } from '../services/api';
import { generateAICatalog, CRAFT_PRESETS } from '../services/aiCatalogService';
import {
  processBackgroundReplacement,
  recompositeStudioBackdrop,
  BACKGROUND_STYLES,
  BackgroundStyle,
  ProcessingStage,
  PROCESSING_STAGES,
  determineSmartStudio,
  IsolationSensitivity
} from '../services/backgroundReplacementService';
import {
  translateTeluguToEnglish,
  TranslationResult
} from '../services/translationService';
import {
  calculatePriceRecommendation,
  PriceCalculation,
  REQUIRED_PRICING_DISCLAIMER
} from '../services/pricingService';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Camera,
  Upload,
  Mic,
  MicOff,
  Wand2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Info,
  Layers,
  Store,
  RefreshCw,
  Eye,
  Tag,
  Languages,
  Palette,
  Check,
  RotateCcw,
  Video,
  X,
  Edit3,
  SlidersHorizontal,
  Maximize2,
  Download,
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
  AlertTriangle
} from 'lucide-react';

export const AiProductStudio: React.FC = () => {
  const { currentUser, currentArtisan, switchRole } = useAuth();
  const { t, translate } = useLanguage();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Ensure user is an artisan for this page
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'artisan') {
      switchRole('artisan');
    }
  }, [currentUser?.role]);

  // Current Step in Wizard (1 to 7)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Image Upload / Camera State
  const [productImage, setProductImage] = useState<string>('./assets/products/artisan_watch.jpg');
  const [originalImage, setOriginalImage] = useState<string>('./assets/products/artisan_watch.jpg');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // STEP 3: Description & Translation State (Telugu -> English)
  const [descriptionInput, setDescriptionInput] = useState<string>(
    'ఇది చేతితో రూపొందించిన క్లాసిక్ రోజ్ గోల్డ్ అనలాగ్ వాచ్. సొగసైన రోజ్ గోల్డ్ ఫినిషింగ్ మరియు అత్యున్నత నాణ్యతతో కూడిన చేతి గడియారం.'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Telugu');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'completed'>('idle');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedEnglish, setTranslatedEnglish] = useState<string>(
    'This is a handcrafted classic rose gold analog watch with a minimalist dial, scratch-resistant crystal, and adjustable stainless steel mesh strap.'
  );
  const [isEditingTranslation, setIsEditingTranslation] = useState<boolean>(false);
  const teluguInputRef = useRef<HTMLTextAreaElement>(null);
  const englishInputRef = useRef<HTMLTextAreaElement>(null);

  // STEP 4: Generated Catalog Fields (Strictly no invented info)
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [productName, setProductName] = useState<string>('Classic Rose Gold Minimalist Artisan Watch');
  const [generatedDescription, setGeneratedDescription] = useState<string>(
    'A masterfully crafted analog timepiece uniting heritage minimalist metallurgy with contemporary luxury. Features a polished rose gold stainless casing, scratch-resistant mineral crystal glass, an ultra-quiet Japanese quartz movement, and an artisan-stitched mesh strap.'
  );
  const [category, setCategory] = useState<string>('Jewelry & Watches');
  const [material, setMaterial] = useState<string>('Surgical 316L Stainless Steel & Rose Gold Ion Plating');
  const [craftType, setCraftType] = useState<string>('Precision Horology & Hand-Assembled Metalwork');
  const [dimensions, setDimensions] = useState<string>('Case: 38mm, Lug-to-Lug: 20cm');
  const [keywords, setKeywords] = useState<string[]>(['rose gold watch', 'artisan wristwatch', 'minimalist timepiece', 'luxury jewelry watch']);
  const [tags, setTags] = useState<string[]>(['Jewelry & Watches', 'Luxury Finish', 'Precision Quartz']);
  const [productHighlights, setProductHighlights] = useState<string[]>([
    'Solid 316L stainless steel casing with durable rose gold PVD vacuum ion plating',
    'Scratch-resistant mineral crystal glass and water resistance up to 30 meters (3 ATM)',
    'Precision Japanese quartz caliber providing pinpoint timekeeping accuracy'
  ]);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [highlightInput, setHighlightInput] = useState<string>('');

  // STEP 2: Real Background Replacement & Interactive Slider State
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('smart-match');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('1:1');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [enhancedImageDataUrl, setEnhancedImageDataUrl] = useState<string>('');
  const [cutoutDataUrl, setCutoutDataUrl] = useState<string>('');
  const [activeStageMode, setActiveStageMode] = useState<'remove-bg' | 'change-bg'>('remove-bg');
  const [isProcessingBackground, setIsProcessingBackground] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<ProcessingStage>(PROCESSING_STAGES[0]);
  const [detectedStudioName, setDetectedStudioName] = useState<string>('Luxury Watch & Horology Studio');
  const [isolationSensitivity, setIsolationSensitivity] = useState<IsolationSensitivity>('deep-clean');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const lastProcessedKeyRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  // Manual Cutout Touch-Up State
  const [rawCutoutDataUrl, setRawCutoutDataUrl] = useState<string>('');
  const [isMaskEditing, setIsMaskEditing] = useState<boolean>(false);
  const [brushMode, setBrushMode] = useState<'restore' | 'erase'>('restore');
  const [brushSize, setBrushSize] = useState<number>(26);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const touchCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPaintingRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // STEP 5: Price Recommendation State
  const [materialCost, setMaterialCost] = useState<number>(850);
  const [laborCost, setLaborCost] = useState<number>(1000);
  const [otherCost, setOtherCost] = useState<number>(350);
  const [timeRequiredHours, setTimeRequiredHours] = useState<number>(4.0);
  const [desiredProfitMargin, setDesiredProfitMargin] = useState<number>(35);
  const [priceRecommendation, setPriceRecommendation] = useState<PriceCalculation>(() =>
    calculatePriceRecommendation(850, 4.0, 250, 350)
  );
  const [selectedPriceTier, setSelectedPriceTier] = useState<'minimum' | 'recommended' | 'premium' | 'custom'>('recommended');
  const [customFinalPrice, setCustomFinalPrice] = useState<number>(2450);

  // STEP 7: Publishing State
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [publishedProductId, setPublishedProductId] = useState<string>('');

  // Speech Recognition Check
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Update dynamic price calculations
  useEffect(() => {
    const calc = calculatePriceRecommendation(materialCost, timeRequiredHours, laborCost, otherCost);
    setPriceRecommendation(calc);
    if (selectedPriceTier === 'minimum') setCustomFinalPrice(calc.minimumPrice);
    else if (selectedPriceTier === 'recommended') setCustomFinalPrice(calc.recommendedPrice);
    else if (selectedPriceTier === 'premium') setCustomFinalPrice(calc.premiumPrice);
  }, [materialCost, laborCost, otherCost, timeRequiredHours, desiredProfitMargin, selectedPriceTier]);

  const origImgRef = useRef<HTMLImageElement | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const strokePatternRef = useRef<CanvasPattern | null>(null);

  // Synchronize manual touch-up edits to the studio compositing
  const applyTouchUpChange = useCallback(
    async (newCutoutUrl: string) => {
      setCutoutDataUrl(newCutoutUrl);
      try {
        const newComposited = await recompositeStudioBackdrop(
          newCutoutUrl,
          category,
          generatedDescription,
          backgroundStyle,
          aspectRatio
        );
        setEnhancedImageDataUrl(newComposited);
      } catch (err) {
        console.warn('Recomposite backdrop failed:', err);
      }
    },
    [category, generatedDescription, backgroundStyle, aspectRatio]
  );

  // Initialize and open Touch-up Editor
  const startTouchUpEditing = useCallback(() => {
    setIsMaskEditing(true);
    setTimeout(() => {
      const canvas = touchCanvasRef.current;
      if (!canvas) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        setUndoStack([canvas.toDataURL('image/png')]);
        setRedoStack([]);

        const origImg = new Image();
        origImg.crossOrigin = 'anonymous';
        origImg.onload = () => {
          origImgRef.current = origImg;
          const offCanvas = document.createElement('canvas');
          offCanvas.width = canvas.width;
          offCanvas.height = canvas.height;
          const offCtx = offCanvas.getContext('2d');
          if (offCtx && ctx) {
            offCtx.drawImage(origImg, 0, 0, canvas.width, canvas.height);
            strokePatternRef.current = ctx.createPattern(offCanvas, 'no-repeat');
          }
        };
        origImg.src = originalImage;
      };
      img.src = cutoutDataUrl || originalImage;
    }, 60);
  }, [cutoutDataUrl, originalImage]);

  // Pointer event helpers for Touch-up Canvas
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = touchCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = touchCanvasRef.current;
    if (!canvas) return;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    isPaintingRef.current = true;
    const { x, y } = getCanvasCoords(e);
    lastPosRef.current = { x, y };

    // Record undo state before this stroke
    const currentState = canvas.toDataURL('image/png');
    setUndoStack((prev) => [...prev.slice(-15), currentState]);
    setRedoStack([]);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const radius = brushSize / 2;
    if (brushMode === 'restore' && strokePatternRef.current) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = strokePatternRef.current;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (brushMode === 'erase') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current) return;
    const canvas = touchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    const lastPos = lastPosRef.current || { x, y };

    if (brushMode === 'restore' && strokePatternRef.current) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokePatternRef.current;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    } else if (brushMode === 'erase') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    }

    lastPosRef.current = { x, y };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current) return;
    isPaintingRef.current = false;
    lastPosRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const canvas = touchCanvasRef.current;
    if (canvas) {
      const newCutout = canvas.toDataURL('image/png');
      applyTouchUpChange(newCutout);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const canvas = touchCanvasRef.current;
    if (!canvas) return;
    const currentData = canvas.toDataURL('image/png');
    const prevState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, currentData]);

    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        applyTouchUpChange(prevState);
      }
    };
    img.src = prevState;
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = touchCanvasRef.current;
    if (!canvas) return;
    const currentData = canvas.toDataURL('image/png');
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, currentData]);

    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        applyTouchUpChange(nextState);
      }
    };
    img.src = nextState;
  };

  const handleResetToAiCutout = () => {
    if (!rawCutoutDataUrl) return;
    const canvas = touchCanvasRef.current;
    if (!canvas) return;
    const currentState = canvas.toDataURL('image/png');
    setUndoStack((prev) => [...prev.slice(-15), currentState]);

    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        applyTouchUpChange(rawCutoutDataUrl);
        showToast('Cutout Reset', 'Reverted to initial AI segmentation.', 'info');
      }
    };
    img.src = rawCutoutDataUrl;
  };

  const handleDoneTouchUp = () => {
    setIsMaskEditing(false);
    showToast('Cutout Saved ✨', 'Studio backdrop refreshed with your fine-tuned cutout.', 'success');
  };

  // Trigger Real Background Replacement
  const executeBackgroundReplacement = useCallback(
    async (
      imgSrc: string,
      cat: string,
      desc: string,
      bgStyle: BackgroundStyle,
      ratio: '1:1' | '4:5' | '16:9',
      sens: IsolationSensitivity = isolationSensitivity,
      force: boolean = false
    ) => {
      if (!imgSrc) return;
      const imageSig = `${imgSrc.length}_${imgSrc.slice(-30)}`;
      const processingKey = `${imageSig}-${cat}-${desc}-${bgStyle}-${ratio}-${sens}`;
      if (!force && lastProcessedKeyRef.current === processingKey) {
        return; // Already generated for these exact parameters
      }
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      lastProcessedKeyRef.current = processingKey;

      setIsProcessingBackground(true);
      setProcessingError(null);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imgSrc;
        await new Promise((res, rej) => {
          img.onload = () => res(true);
          img.onerror = () => rej(new Error('Failed to load image for processing'));
        });

        const result = await processBackgroundReplacement(
          img,
          cat,
          desc,
          bgStyle,
          ratio,
          (stage) => setCurrentStage(stage),
          sens
        );

        const cutout = result.cutoutDataUrl || result.foregroundDataUrl;
        setCutoutDataUrl(cutout);
        setRawCutoutDataUrl(cutout);
        setEnhancedImageDataUrl(result.compositedDataUrl);
        setDetectedStudioName(result.studioName);
        setUndoStack([]);
        setRedoStack([]);
        showToastRef.current('Studio Backdrop Created ✨', `${result.studioName} ready.`, 'success');
      } catch (err: any) {
        console.error('Background replacement failed:', err);
        setProcessingError(err?.message || 'Image processing failed. Please try again.');
        showToastRef.current(
          'Processing Notice',
          'Could not isolate product background. You can try again or use another photo.',
          'warning'
        );
      } finally {
        setIsProcessingBackground(false);
        isProcessingRef.current = false;
      }
    },
    [isolationSensitivity]
  );

  // One-time initial processing for default demo image when entering Step 2
  const hasInitializedDemoRef = useRef<boolean>(false);
  useEffect(() => {
    if (
      currentStep === 2 &&
      !hasInitializedDemoRef.current &&
      !enhancedImageDataUrl &&
      !cutoutDataUrl &&
      !isProcessingRef.current
    ) {
      hasInitializedDemoRef.current = true;
      executeBackgroundReplacement(
        originalImage,
        category,
        generatedDescription,
        backgroundStyle,
        aspectRatio,
        isolationSensitivity
      );
    }
  }, [
    currentStep,
    enhancedImageDataUrl,
    cutoutDataUrl,
    originalImage,
    category,
    generatedDescription,
    backgroundStyle,
    aspectRatio,
    isolationSensitivity,
    executeBackgroundReplacement
  ]);

  // Camera Management
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        setCameraStream(stream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        showToast('Camera Unavailable', 'Camera access is not supported on this browser/device.', 'warning');
      }
    } catch (err) {
      console.warn('Camera permission error:', err);
      showToast('Camera Permission', 'Please allow camera access or choose a photo from device/samples.', 'info');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      lastProcessedKeyRef.current = '';
      setCutoutDataUrl('');
      setRawCutoutDataUrl('');
      setEnhancedImageDataUrl('');
      setUndoStack([]);
      setRedoStack([]);
      setOriginalImage(dataUrl);
      setProductImage(dataUrl);
      stopCamera();
      showToast('Photo Captured! 📸', 'Your product image was captured successfully.', 'success');
      executeBackgroundReplacement(
        dataUrl,
        category,
        generatedDescription,
        backgroundStyle,
        aspectRatio,
        isolationSensitivity,
        true
      );
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        lastProcessedKeyRef.current = '';
        setCutoutDataUrl('');
        setRawCutoutDataUrl('');
        setEnhancedImageDataUrl('');
        setUndoStack([]);
        setRedoStack([]);
        setOriginalImage(result);
        setProductImage(result);
        showToast('Photo Uploaded', 'Product image loaded into studio.', 'success');
        executeBackgroundReplacement(
          result,
          category,
          generatedDescription,
          backgroundStyle,
          aspectRatio,
          isolationSensitivity,
          true
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Draggable slider interaction
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDraggingSlider(true);
  const handleMouseUp = () => setIsDraggingSlider(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) handleSliderMove(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) handleSliderMove(e.touches[0].clientX);
  };

  // Web Speech API Voice Toggle
  const handleVoiceToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast(
        'Speech Recognition Notice',
        'Web Speech API is not supported in this browser. You can type or use the sample Telugu phrases.',
        'info'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
      setIsListening(false);
      setVoiceState('idle');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      const langCodes: { [key: string]: string } = {
        English: 'en-IN',
        Telugu: 'te-IN',
        Tamil: 'ta-IN',
        Kannada: 'kn-IN',
        Malayalam: 'ml-IN',
        Bengali: 'bn-IN',
        Odia: 'or-IN'
      };
      recognition.lang = langCodes[selectedLanguage] || 'te-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceState('recording');
        showToast('Microphone Active 🎙️', `Listening in ${selectedLanguage}... Please speak now.`, 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setDescriptionInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setVoiceState('idle');
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceState('completed');
        recognitionRef.current = null;
        showToast('Recording Complete ✓', 'Transcript captured. You can edit or translate to English.', 'success');
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setVoiceState('idle');
      recognitionRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // Record Telugu speech again
  const handleRecordAgain = () => {
    setDescriptionInput('');
    setVoiceState('idle');
    setTimeout(() => {
      handleVoiceToggle();
    }, 150);
  };

  // Perform Telugu -> English AI Translation
  const handleTranslateTeluguToEnglish = async () => {
    if (!descriptionInput.trim()) {
      showToast('Input Required', 'Please enter or speak a description.', 'warning');
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateTeluguToEnglish(descriptionInput);
      setTranslatedEnglish(result.englishTranslation);
      if (result.extractedParameters.productName) setProductName(result.extractedParameters.productName);
      if (result.extractedParameters.category) setCategory(result.extractedParameters.category);
      if (result.extractedParameters.craftType) setCraftType(result.extractedParameters.craftType);
      if (result.extractedParameters.material) setMaterial(result.extractedParameters.material);
      setDimensions(result.extractedParameters.estimatedSize || 'Not specified');

      showToast('Telugu → English Translated! 🌐', 'Professional e-commerce description ready.', 'success');
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Generate AI Catalog from description
  const handleGenerateAICatalog = async () => {
    const textToUse = translatedEnglish || descriptionInput;
    if (!textToUse.trim()) {
      showToast('Description Required', 'Please translate or provide a product description.', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAICatalog(textToUse, originalImage, currentArtisan?.craftType);
      setProductName(result.productName);
      setGeneratedDescription(result.description);
      setCategory(result.category);
      setMaterial(result.material);
      setCraftType(result.craftType);
      setDimensions(result.estimatedSize || 'Not specified');
      setKeywords(result.keywords);
      setTags(result.tags);
      setProductHighlights(result.productHighlights || [
        '100% authentic handcrafted item',
        'Direct fair-trade rural artisan creation'
      ]);

      setCurrentStep(4);
      showToast('AI Catalog Generated! ✨', 'All specifications synthesized. You can edit any field.', 'success');
    } catch (error) {
      console.error('AI Catalog error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add Keyword
  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  // Add Tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Add Highlight
  const handleAddHighlight = () => {
    if (highlightInput.trim() && !productHighlights.includes(highlightInput.trim())) {
      setProductHighlights([...productHighlights, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  // Publish to Database (PERSISTENT & COMPLETE)
  const handlePublishProduct = () => {
    const finalImage = enhancedImageDataUrl || productImage;
    const finalPrice = Number(customFinalPrice) || priceRecommendation.recommendedPrice;

    const effectiveArtisanId = currentArtisan?.id || (currentUser ? `artisan-${currentUser.id}` : 'artisan-1');
    const effectiveArtisanName = currentUser?.name || currentArtisan?.name || 'Kalyani Devi';
    const effectiveLocation = currentUser?.location || (currentArtisan ? `${currentArtisan.village}, ${currentArtisan.state}` : 'Andhra Pradesh');

    const newProduct = db.addProduct({
      artisanId: effectiveArtisanId,
      artisanName: effectiveArtisanName,
      artisanLocation: effectiveLocation,
      artisanVerified: true,
      name: productName,
      description: generatedDescription,
      category: category,
      material: material,
      craftType: craftType,
      dimensions: dimensions,
      minimumPrice: priceRecommendation.minimumPrice,
      recommendedPrice: priceRecommendation.recommendedPrice,
      premiumPrice: priceRecommendation.premiumPrice,
      publishedPrice: finalPrice,
      image: finalImage,
      originalImage: originalImage,
      enhancedImage: finalImage,
      aiEnhancedImage: finalImage,
      backgroundStyle: backgroundStyle,
      keywords: keywords,
      tags: tags,
      status: 'active',
      stock: 15,
      translations: {
        te: {
          name: productName,
          description: descriptionInput
        }
      }
    });

    // Also sync to Flask API if active
    if (currentUser?.id) {
      api.addProduct(
        {
          name: productName,
          product_name: productName,
          category,
          description: generatedDescription,
          material,
          price: finalPrice,
          stock: 15,
          image: finalImage,
          craft_story: generatedDescription
        },
        currentUser.id
      ).catch((err) => console.warn('Flask sync notice:', err));
    }

    // Trigger celebratory confetti
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.6 }
    });

    setPublishedProductId(newProduct.id);
    setIsPublished(true);
    setCurrentStep(7);
    showToast('Product Published! 🚀', 'Your craft is now live on My Products, your storefront, and the marketplace.', 'success');
  };

  const handleDownloadCutout = () => {
    const link = document.createElement('a');
    link.href = cutoutDataUrl || originalImage;
    link.download = 'kalaconnect-cutout.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Cutout Downloaded! 📥', 'Isolated transparent PNG saved to your device.', 'success');
  };

  return (
    <div
      className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8"
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-stone-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-950/70 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-600/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Product Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              AI Smart Cataloging & Photo Studio
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
              Remove messy backgrounds completely, place your authentic handmade item in a professional craft studio, translate Telugu descriptions, and set fair-trade prices in seconds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/artisan/products')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 cursor-pointer"
            >
              My Products
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              Marketplace
            </button>
          </div>
        </div>

        {/* 6-Step Workflow Progress Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 gap-2 text-xs font-semibold">
            {[
              { num: 1, label: '1. Photo Capture' },
              { num: 2, label: '2. AI Studio & Background' },
              { num: 3, label: '3. Telugu Voice & Translate' },
              { num: 4, label: '4. AI Catalog Synthesis' },
              { num: 5, label: '5. Smart Pricing' },
              { num: 6, label: '6. Review & Publish' },
              { num: 7, label: '7. Live Store' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => {
                    if (isCompleted || isActive) setCurrentStep(step.num);
                  }}
                  disabled={!isCompleted && !isActive}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-amber-800 text-white shadow-sm'
                      : isCompleted
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'text-stone-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-amber-900'
                        : isCompleted
                        ? 'bg-amber-700 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isCompleted ? '✓' : step.num}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            MODAL: Camera Live Stream Viewfinder
           =================================================================== */}
        {isCameraActive && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900 rounded-3xl p-6 max-w-xl w-full text-white space-y-4 shadow-2xl border border-stone-700">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold">Live Camera Viewfinder</h3>
                </div>
                <button
                  onClick={stopCamera}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-square sm:aspect-4/3 w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-stone-700">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder Target */}
                <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between text-[10px] text-white/70 font-semibold">
                    <span>FRAME TOP</span>
                    <span>CENTER ALIGN</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs bg-black/60 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/40">
                      Center your craft inside target
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-white/70 font-semibold">
                    <span>GROUND CONTACT</span>
                    <span>70-85% OCCUPANCY</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhotoFromCamera}
                  className="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span>SNAP PHOTO</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUCCESS: Published View (Step 7)
           =================================================================== */}
        {isPublished && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 text-center shadow-lg space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
                Craft Catalog Published! 🎉
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                “{productName}” has been studio-isolated, priced for fair artisan profit, and is now active across the marketplace, your storefront, and admin oversight.
              </p>
            </div>

            <div className="max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md">
              <img
                src={enhancedImageDataUrl || productImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => navigate(`/product/${publishedProductId}`)}
                className="px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View in Marketplace</span>
              </button>
              <button
                onClick={() => navigate(`/artisan/store/${currentArtisan?.id || 'artisan-1'}`)}
                className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Open Digital Storefront</span>
              </button>
              <button
                onClick={() => {
                  setIsPublished(false);
                  setCurrentStep(1);
                }}
                className="px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Create Another Product
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            WIZARD STEPS
           =================================================================== */}
        {!isPublished && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-8">
            
            {/* -------------------------------------------------------------------
                STEP 1: Capture or Upload Photo
               ------------------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-amber-700" />
                    <span>Step 1 — Capture or Upload Product Photograph</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Take a photo using your mobile camera or upload from device. Even if photographed against a messy room, wall, or floor, AI will isolate your authentic product completely.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Photo Preview Card */}
                  <div className="space-y-4">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-300 relative group flex items-center justify-center">
                      <img
                        src={originalImage}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Camera and Upload Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="py-3.5 px-4 min-h-[44px] rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{translate('TAKE PHOTO')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="py-3.5 px-4 min-h-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-200"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{translate('UPLOAD FROM GALLERY')}</span>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Craft Samples & Segmentation Assurance */}
                  <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200 space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-black text-stone-900 uppercase tracking-wide">
                        Real AI Background Replacement Engine
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
                      <p>
                        ✓ <strong>Messy Surroundings Removed:</strong> Whether taken on a bedsheet, floor, or outdoor yard, only the product is kept.
                      </p>
                      <p>
                        ✓ <strong>100% Craft Authenticity:</strong> Colors, weaving, carving, and dimensions remain completely unaltered. Blue basket stays blue basket.
                      </p>
                      <p>
                        ✓ <strong>Smart Craft Studio:</strong> The AI understands your item and generates a dedicated studio environment (e.g. Natural Bamboo, Pottery Kiln, Silk Loom).
                      </p>
                    </div>

                    {/* Quick Craft Sample Buttons */}
                    <div className="pt-2 border-t border-stone-200/70">
                      <p className="text-[11px] font-bold text-stone-700 mb-2">Or test with authentic craft images:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {CRAFT_PRESETS.map((craft, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setOriginalImage(craft.image);
                              setProductImage(craft.image);
                              setDescriptionInput(craft.voiceText);
                              executeBackgroundReplacement(
                                craft.image,
                                category,
                                craft.voiceText,
                                backgroundStyle,
                                aspectRatio,
                                isolationSensitivity,
                                true
                              );
                              showToast('Craft Selected', `Loaded: ${craft.label}`, 'info');
                            }}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 hover:border-amber-300 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
                          >
                            {craft.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-stone-100">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3.5 min-h-[44px] rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>{translate('Proceed to AI Studio & Background')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------------
                STEP 2: REAL AI Background Replacement & Before/After Slider
               ------------------------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-700" />
                    <span>{translate('Step 2 — Real AI Background Replacement & Studio Selection')}</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {translate('Your original background (room, floor, or clutter) is completely removed. Your authentic craft item is preserved and placed into a matching studio environment.')}
                  </p>
                </div>

                {/* Processing Error Banner */}
                {processingError && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold">{translate('Image processing failed. Please try again.')}</p>
                        <p className="text-[11px] text-amber-800">{processingError}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          executeBackgroundReplacement(
                            originalImage,
                            category,
                            generatedDescription,
                            backgroundStyle,
                            aspectRatio,
                            isolationSensitivity,
                            true
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        {translate('Try Again')}
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs cursor-pointer"
                      >
                        {translate('Upload Another Image')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Multi-Stage Processing Visual Indicator */}
                {isProcessingBackground && (
                  <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-700 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{translate(currentStage.label)}</span>
                      </div>
                      <span className="text-[11px] font-mono text-stone-400">Stage {currentStage.step} of 7</span>
                    </div>
                    <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${(currentStage.step / 7) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-300">{translate(currentStage.detail)}</p>
                  </div>
                )}

                {/* TWO-PHASE WORKFLOW TABS: FIRST REMOVE BACKGROUND, THEN CHANGE BACKGROUND */}
                <div className="bg-stone-100 p-1.5 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveStageMode('remove-bg')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeStageMode === 'remove-bg'
                        ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      activeStageMode === 'remove-bg' ? 'bg-amber-800 text-white' : 'bg-stone-200 text-stone-700'
                    }`}>
                      1
                    </span>
                    <span>{translate('Phase 1: Remove Original Background (Cutout)')}</span>
                    {cutoutDataUrl && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                        ✓ {translate('Background Removed')}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveStageMode('change-bg');
                      const styleSelector = document.getElementById('studio-environment-selector');
                      styleSelector?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeStageMode === 'change-bg'
                        ? 'bg-amber-800 text-white shadow-sm'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      activeStageMode === 'change-bg' ? 'bg-white text-amber-900' : 'bg-stone-200 text-stone-700'
                    }`}>
                      2
                    </span>
                    <span>{translate('Phase 2: Change Background (AI Studio)')}</span>
                    <span className="text-[10px] bg-amber-500/30 text-amber-200 font-bold px-2 py-0.5 rounded-full truncate max-w-[110px]">
                      {translate(detectedStudioName)}
                    </span>
                  </button>
                </div>

                {/* =================================================================
                    INTERACTIVE TOUCH-UP MASK EDITOR OR BEFORE / AFTER SPLIT SLIDER
                   ================================================================= */}
                {isMaskEditing ? (
                  <div className="bg-stone-900 border-2 border-amber-600 rounded-3xl p-4 sm:p-6 text-white space-y-4 shadow-2xl animate-in fade-in">
                    {/* Toolbar Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 bg-amber-950 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-700/50">
                          <Paintbrush className="w-3.5 h-3.5" />
                          <span>{translate('Manual Cutout Touch-Up Studio')}</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-extrabold text-white">
                          {translate('Fine-Tune Product Cutout with Smart Brush')}
                        </h4>
                        <p className="text-xs text-stone-400">
                          {translate('Brush over any component you want to keep, or erase leftover background.')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleUndo}
                          disabled={undoStack.length === 0}
                          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Undo"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={handleRedo}
                          disabled={redoStack.length === 0}
                          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Redo"
                        >
                          <Redo2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={handleResetToAiCutout}
                          className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Reset to original AI cutout"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{translate('Reset Cutout')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDoneTouchUp}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>{translate('Done Touch-Up')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Tool Selector & Brush Settings */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950/70 p-3 rounded-2xl border border-stone-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBrushMode('restore')}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            brushMode === 'restore'
                              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          <Paintbrush className="w-4 h-4" />
                          <span>{translate('Restore Product (Brush)')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBrushMode('erase')}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            brushMode === 'erase'
                              ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          <Eraser className="w-4 h-4" />
                          <span>{translate('Remove Background (Eraser)')}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-stone-400 font-semibold">{translate('Brush Size')}:</span>
                        <input
                          type="range"
                          min={6}
                          max={70}
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-28 sm:w-36 accent-amber-500 cursor-pointer"
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-amber-400/80 flex items-center justify-center bg-stone-800"
                          title={`Brush radius: ${brushSize}px`}
                        >
                          <div
                            className="rounded-full bg-amber-400"
                            style={{
                              width: `${Math.max(4, Math.min(22, brushSize / 2))}px`,
                              height: `${Math.max(4, Math.min(22, brushSize / 2))}px`
                            }}
                          />
                        </div>
                        <span className="text-xs text-stone-300 font-mono w-8 text-right">{brushSize}px</span>
                      </div>
                    </div>

                    {/* Canvas Container with Checkerboard Background */}
                    <div className="relative w-full aspect-square sm:aspect-4/3 max-h-[520px] rounded-2xl overflow-hidden bg-stone-100 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:16px_16px] flex items-center justify-center border border-stone-800 shadow-inner">
                      <canvas
                        ref={touchCanvasRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className="w-full h-full object-contain cursor-crosshair touch-none select-none"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                      <p>
                        💡 <strong>{translate('How it works')}:</strong>{' '}
                        {translate(
                          'Click and drag across the image. When set to "Restore", it paints the original product details back. When set to "Remove", it erases backgrounds.'
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={handleDoneTouchUp}
                        className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        {translate('Save and return to studio ➔')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      ref={sliderContainerRef}
                      onMouseDown={handleMouseDown}
                      onTouchMove={handleTouchMove}
                      className={`relative w-full aspect-square sm:aspect-4/3 max-h-[520px] rounded-3xl overflow-hidden select-none cursor-ew-resize border-2 border-stone-800 shadow-2xl ${
                        activeStageMode === 'remove-bg' || backgroundStyle === 'transparent'
                          ? 'bg-stone-100 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:16px_16px]'
                          : 'bg-stone-950'
                      }`}
                    >
                      {/* Layer 1: Transformed Image (Cutout in Phase 1, Studio in Phase 2) */}
                      <div
                        className={`absolute inset-0 w-full h-full flex items-center justify-center ${
                          activeStageMode === 'remove-bg' || backgroundStyle === 'transparent'
                            ? 'bg-stone-100 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:16px_16px]'
                            : 'bg-stone-900'
                        }`}
                      >
                        <img
                          src={
                            activeStageMode === 'remove-bg'
                              ? (cutoutDataUrl || enhancedImageDataUrl || originalImage)
                              : (enhancedImageDataUrl || originalImage)
                          }
                          alt="Transformed Product View"
                          className="w-full h-full object-contain pointer-events-none select-none"
                        />
                        <div className="absolute top-4 right-4 bg-amber-800/90 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-black shadow-md border border-amber-500/30 flex items-center gap-1.5 z-20">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>
                            {activeStageMode === 'remove-bg'
                              ? translate('ORIGINAL BACKGROUND REMOVED (CUTOUT)')
                              : `${translate('STUDIO: ')}${detectedStudioName.toUpperCase()}`}
                          </span>
                        </div>
                      </div>

                      {/* Layer 2: Original Uploaded Image (Clipped seamlessly by CSS clipPath) */}
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img
                          src={originalImage}
                          alt="Original Raw"
                          className="w-full h-full object-contain filter brightness-95 pointer-events-none select-none"
                        />
                        <div className="absolute top-4 left-4 bg-stone-900/90 backdrop-blur-xs text-stone-200 px-3 py-1 rounded-full text-xs font-extrabold shadow-md border border-stone-700 z-20">
                          {translate('ORIGINAL PHOTO')}
                        </div>
                      </div>

                      {/* Divider Line & Draggable Handle */}
                      <div
                        className="absolute inset-y-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] z-20 flex items-center justify-center pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="w-10 h-10 -ml-0.5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white ring-2 ring-black/50">
                          ↔
                        </div>
                      </div>
                    </div>

                    {/* Range Slider for Accessibility */}
                    <div className="flex items-center gap-3 px-2">
                      <span className="text-[11px] font-black text-stone-500 uppercase">{translate('Original Photo')}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="flex-1 accent-amber-700 cursor-pointer"
                      />
                      <span className="text-[11px] font-black text-amber-800 uppercase">
                        {activeStageMode === 'remove-bg' ? translate('Background Removed') : translate('AI Studio Backdrop')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Phase 1 Completion Banner & Prompt to Proceed */}
                {activeStageMode === 'remove-bg' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>{translate('Phase 1 Complete: Original Background Stripped Clean')}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        {translate('Cardboard packaging, logos, blue text, shadows, and room clutter have been eliminated. You can now download the cutout or change the background in Phase 2.')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={startTouchUpEditing}
                        className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100/60 shadow-xs cursor-pointer transition-colors"
                      >
                        <Paintbrush className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{translate('Fine-Tune Cutout')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadCutout}
                        className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100/60 shadow-xs cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{translate('Download Cutout (.PNG)')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStageMode('change-bg');
                          const styleSelector = document.getElementById('studio-environment-selector');
                          styleSelector?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <span>{translate('Change Background ➔')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS FOR BEFORE / AFTER */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-stone-100 rounded-2xl border border-stone-200">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 1. Retake Photo */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(1);
                        startCamera();
                        showToast('Camera Activated 📸', 'Retake your product photo with good lighting.', 'info');
                      }}
                      className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-700" />
                      <span>{translate('Retake Photo')}</span>
                    </button>

                    {/* 2. Upload Another */}
                    <button
                      type="button"
                      onClick={() => {
                        galleryInputRef.current?.click();
                      }}
                      className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-stone-600" />
                      <span>{translate('Upload Another')}</span>
                    </button>

                    {/* 3. Change Background */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStageMode('change-bg');
                        const styleSelector = document.getElementById('studio-environment-selector');
                        styleSelector?.scrollIntoView({ behavior: 'smooth' });
                        showToast('Studio Environments', 'Select your preferred studio setting below.', 'info');
                      }}
                      className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-purple-700" />
                      <span>{translate('Change Background')}</span>
                    </button>

                    {/* 4. Regenerate */}
                    <button
                      type="button"
                      onClick={() =>
                        executeBackgroundReplacement(
                          originalImage,
                          category,
                          generatedDescription,
                          backgroundStyle,
                          aspectRatio,
                          isolationSensitivity,
                          true
                        )
                      }
                      className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                      <span>{translate('Regenerate')}</span>
                    </button>

                    {/* 5. Download Cutout PNG */}
                    <button
                      type="button"
                      onClick={handleDownloadCutout}
                      className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{translate('Download Cutout')}</span>
                    </button>

                    {/* 6. Touch Up Cutout */}
                    <button
                      type="button"
                      onClick={startTouchUpEditing}
                      className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Paintbrush className="w-3.5 h-3.5 text-amber-700" />
                      <span>{translate('Touch Up Cutout')}</span>
                    </button>
                  </div>

                  {/* 6. Use This Photo */}
                  <button
                    type="button"
                    onClick={() => {
                      const finalChosen =
                        activeStageMode === 'remove-bg' && cutoutDataUrl
                          ? cutoutDataUrl
                          : enhancedImageDataUrl || cutoutDataUrl || originalImage;
                      setProductImage(finalChosen);
                      setCurrentStep(3);
                      showToast('Photo Confirmed! 📸', 'Product photo locked for catalog.', 'success');
                    }}
                    className="px-6 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{translate('Use This Photo')}</span>
                  </button>
                </div>

                {/* AI Cleanliness & Plate Removal Sensitivity Selector */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-800" />
                      <span className="text-xs font-black text-stone-900 uppercase tracking-wide">
                        AI Segmentation & Cleanliness Mode
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full">
                      Adaptive Saliency Filter
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Removes messy room walls, cluttered desks, and white plates while keeping 100% of your artisan craft colors, lacquer, and carving details intact.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {[
                      {
                        id: 'deep-clean' as IsolationSensitivity,
                        title: '✂️ Deep Clean (Removes Wall & Plate)',
                        desc: 'Cuts away white plates, room walls, and shelves. Recommended for real homemade craft photos.'
                      },
                      {
                        id: 'balanced' as IsolationSensitivity,
                        title: '🌟 Smart AI Clean',
                        desc: 'Balanced isolation with gentle craft contact shadows.'
                      },
                      {
                        id: 'delicate' as IsolationSensitivity,
                        title: '🎨 Delicate Craft Edges',
                        desc: 'Preserves finest hair fringe, textile threads, and softest silhouettes.'
                      }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setIsolationSensitivity(mode.id);
                          executeBackgroundReplacement(
                            originalImage,
                            category,
                            generatedDescription,
                            backgroundStyle,
                            aspectRatio,
                            mode.id,
                            true
                          );
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isolationSensitivity === mode.id
                            ? 'bg-white border-amber-600 ring-2 ring-amber-600 shadow-xs'
                            : 'bg-white/60 hover:bg-white border-amber-200/70 text-stone-700'
                        }`}
                      >
                        <span className="text-xs font-bold text-stone-900 block">{mode.title}</span>
                        <span className="text-[10px] text-stone-500 leading-tight block mt-0.5">{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Studio Background Style Selector */}
                <div id="studio-environment-selector" className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-amber-700" />
                      <span>Select Studio Environment:</span>
                    </label>
                    <span className="text-[11px] font-bold text-amber-800">
                      Active: {detectedStudioName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {BACKGROUND_STYLES.map((bg) => {
                      const isSelected = backgroundStyle === bg.id;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => {
                            setBackgroundStyle(bg.id);
                            executeBackgroundReplacement(
                              originalImage,
                              category,
                              generatedDescription,
                              bg.id,
                              aspectRatio,
                              isolationSensitivity,
                              true
                            );
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-100/90 border-amber-600 ring-2 ring-amber-600 shadow-xs'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-stone-300"
                              style={{ backgroundColor: bg.accentColor === 'transparent' ? '#FFFFFF' : bg.accentColor }}
                            />
                            <span className="text-xs font-bold text-stone-900 line-clamp-1">{bg.name}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1 leading-tight line-clamp-2">
                            {bg.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-stone-700 uppercase flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Aspect Ratio:</span>
                  </span>

                  <div className="flex gap-2">
                    {[
                      { id: '1:1', label: '1:1 Square (E-Commerce)' },
                      { id: '4:5', label: '4:5 Portrait' },
                      { id: '16:9', label: '16:9 Banner' }
                    ].map((ratio) => (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => {
                          setAspectRatio(ratio.id as any);
                          executeBackgroundReplacement(
                            originalImage,
                            category,
                            generatedDescription,
                            backgroundStyle,
                            ratio.id as any,
                            isolationSensitivity,
                            true
                          );
                        }}
                        className={`px-3 py-1.5 min-h-[36px] rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          aspectRatio === ratio.id
                            ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Photo Capture</span>
                  </button>

                  <button
                    onClick={() => {
                      if (enhancedImageDataUrl) setProductImage(enhancedImageDataUrl);
                      setCurrentStep(3);
                    }}
                    className="px-7 py-3 min-h-[44px] rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Proceed to Telugu Voice & Description</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------------
                STEP 3: Telugu Voice Input & Telugu -> English AI Translation
               ------------------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-amber-700" />
                    <span>Step 3 — Telugu Voice Input & AI Translation</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Speak or type your product description in Telugu. KalaConnect AI will transcribe, allow you to edit, translate to professional e-commerce English, and synthesize your catalog.
                  </p>
                </div>

                <div className="bg-amber-50/40 rounded-2xl p-4 sm:p-6 border border-amber-200/80 space-y-5">
                  {/* Language Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-amber-800" />
                      <span className="text-xs font-bold text-stone-800">Spoken Language:</span>
                    </div>

                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold bg-white text-stone-800 focus:outline-none focus:border-amber-700 shadow-xs"
                    >
                      <option value="Telugu">తెలుగు (Telugu)</option>
                      <option value="English">English</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                      <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                      <option value="Malayalam">മലയാളം (Malayalam)</option>
                      <option value="Bengali">বাংলা (Bengali)</option>
                      <option value="Odia">ଓଡ଼ిଆ (Odia)</option>
                    </select>
                  </div>

                  {/* Step 3A: Telugu Voice / Text Input Box */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                        3A — Telugu Transcript (Editable):
                      </label>
                      <button
                        type="button"
                        onClick={handleVoiceToggle}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          voiceState === 'recording' || isListening
                            ? 'bg-rose-600 text-white animate-pulse'
                            : voiceState === 'completed'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-amber-700 hover:bg-amber-800 text-white'
                        }`}
                      >
                        {voiceState === 'recording' || isListening ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Recording... (Tap to Finish)</span>
                          </>
                        ) : voiceState === 'completed' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Recording Complete ✓</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>Tap to Speak in {selectedLanguage}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      ref={teluguInputRef}
                      rows={3}
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                      placeholder="ఉదాహరణ: ఇది వెదురుతో చేతితో తయారు చేసిన బుట్ట. ఇది వస్తువులను నిల్వ చేసుకోవడానికి ఉపయోగపడుతుంది."
                      className="w-full rounded-2xl border border-stone-300 p-4 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-amber-700 bg-white font-medium shadow-2xs"
                    />

                    {/* Telugu Action Buttons: [Edit], [Record Again], [Translate to English] */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => teluguInputRef.current?.focus()}
                          className="px-3.5 py-2 min-h-[40px] rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                          <span>Edit Transcript</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRecordAgain}
                          className="px-3.5 py-2 min-h-[40px] rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                          <span>Record Again</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleTranslateTeluguToEnglish}
                        disabled={isTranslating}
                        className="px-5 py-2 min-h-[40px] rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Wand2 className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
                        <span>{isTranslating ? 'Translating to English...' : 'Translate to English'}</span>
                      </button>
                    </div>

                    {/* Quick Telugu Craft Voice Samples */}
                    <div className="pt-2 border-t border-amber-200/50">
                      <span className="text-[11px] font-bold text-stone-600">Sample Telugu Voice Inputs:</span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {[
                          'ఇది వెదురుతో చేతితో తయారు చేసిన బుట్ట. ఇది వస్తువులను నిల్వ చేసుకోవడానికి ఉపయోగపడుతుంది.',
                          'నదీ తీర మట్టితో చక్రంపై తయారు చేసిన సాంప్రదాయ టెర్రకోట మట్టి పాత్ర.',
                          'తెల్ల పొనికి చెక్కతో సహజ రంగులతో చేతితో చెక్కిన సాంప్రదాయ కొండపల్లి బొమ్మ.',
                          'సహజ వృక్ష రంగులతో చేనేత మగ్గంపై నేసిన సాంప్రదాయ కలంకారీ వస్త్రం.'
                        ].map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setDescriptionInput(prompt)}
                            className="text-[10px] bg-white hover:bg-amber-100 hover:text-amber-900 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors text-left font-medium cursor-pointer"
                          >
                            “{prompt.substring(0, 42)}...”
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 3B: TRANSLATION PREVIEW CARD */}
                  <div className="bg-white rounded-2xl p-5 border border-stone-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                        3B — Professional English Description (Translated):
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingTranslation(!isEditingTranslation);
                          if (!isEditingTranslation) setTimeout(() => englishInputRef.current?.focus(), 50);
                        }}
                        className="text-[11px] text-stone-600 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingTranslation ? 'Done Editing' : 'Edit English'}</span>
                      </button>
                    </div>

                    {isEditingTranslation ? (
                      <textarea
                        ref={englishInputRef}
                        rows={3}
                        value={translatedEnglish}
                        onChange={(e) => setTranslatedEnglish(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 p-3 text-xs leading-relaxed focus:outline-none focus:border-amber-700"
                      />
                    ) : (
                      <p className="text-xs text-stone-800 leading-relaxed font-medium bg-stone-50 p-3 rounded-xl border border-stone-100">
                        {translatedEnglish || 'Click "Translate to English" above to convert your Telugu description.'}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <span className="text-[11px] text-stone-400">
                        Rule enforced: Unspecified specifications marked as "Not specified".
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTranslateTeluguToEnglish}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800 hover:text-amber-900 border border-stone-200 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleGenerateAICatalog}
                          disabled={isGenerating}
                          className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isGenerating ? 'Generating Catalog...' : 'Generate AI Catalog'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to AI Studio</span>
                  </button>

                  <button
                    onClick={handleGenerateAICatalog}
                    disabled={isGenerating}
                    className="px-6 py-3.5 min-h-[44px] rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Continue to AI Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------------
                STEP 4: AI Generated Catalog Specifications
               ------------------------------------------------------------------- */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                    <span>Step 4 — AI Catalog Generation (Editable)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Review and fine-tune your catalog fields. KalaConnect AI preserves your true craftsmanship and avoids inventing unverified claims.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Product Title:
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-bold focus:outline-none focus:border-amber-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Category:
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700 bg-white"
                        >
                          <option value="Bamboo & Cane">Bamboo & Cane</option>
                          <option value="Pottery">Pottery & Terracotta</option>
                          <option value="Woodwork">Wood Crafts & Toys</option>
                          <option value="Textiles">Textiles & Handloom</option>
                          <option value="Paintings">Paintings & Folk Art</option>
                          <option value="Metalcraft">Metalcraft & Brass</option>
                          <option value="Handmade Jewelry">Handmade Jewelry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Craft Type / Technique:
                        </label>
                        <input
                          type="text"
                          value={craftType}
                          onChange={(e) => setCraftType(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Materials:
                        </label>
                        <input
                          type="text"
                          value={material}
                          onChange={(e) => setMaterial(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Estimated Size:
                        </label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          placeholder="Not specified"
                          className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        E-Commerce Description:
                      </label>
                      <textarea
                        rows={4}
                        value={generatedDescription}
                        onChange={(e) => setGeneratedDescription(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 p-3 text-xs leading-relaxed focus:outline-none focus:border-amber-700"
                      />
                    </div>
                  </div>

                  {/* Right Column: Highlights & Tags */}
                  <div className="space-y-4">
                    {/* Product Highlights */}
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                      <label className="text-xs font-bold text-stone-700 uppercase block">
                        Product Highlights:
                      </label>
                      <div className="space-y-1.5">
                        {productHighlights.map((hl, i) => (
                          <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-stone-200">
                            <span className="text-stone-800 text-[11px]">• {hl}</span>
                            <button
                              type="button"
                              onClick={() => setProductHighlights(productHighlights.filter((_, idx) => idx !== i))}
                              className="text-stone-400 hover:text-rose-600 text-xs px-1 cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={highlightInput}
                          onChange={(e) => setHighlightInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                          placeholder="Add custom highlight..."
                          className="flex-1 rounded-lg border border-stone-300 px-2.5 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddHighlight}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Keywords & Tags */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Search Keywords:
                        </label>
                        <div className="flex gap-1.5 mb-1.5">
                          <input
                            type="text"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                            placeholder="Add keyword..."
                            className="flex-1 rounded-lg border border-stone-300 px-2.5 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddKeyword}
                            className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded-lg text-xs font-bold hover:bg-stone-300 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              {kw}
                              <button
                                type="button"
                                onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))}
                                className="text-stone-400 hover:text-rose-600 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Marketplace Tags:
                        </label>
                        <div className="flex gap-1.5 mb-1.5">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Add tag..."
                            className="flex-1 rounded-lg border border-stone-300 px-2.5 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded-lg text-xs font-bold hover:bg-stone-300 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tg, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold"
                            >
                              #{tg}
                              <button
                                type="button"
                                onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                                className="text-amber-700 hover:text-rose-600 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Telugu Voice</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-3.5 min-h-[44px] rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Proceed to Smart Price Assistant</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------------
                STEP 5: Smart Price Assistant (Section 25)
               ------------------------------------------------------------------- */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-700" />
                    <span>Step 5 — Fair-Trade Smart Price Assistant</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Calculate fair pricing based on actual raw materials, skilled labor hours, and living wage benchmarks.
                  </p>
                </div>

                {/* Pricing Parameters Input */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-medium">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Material Cost (₹):
                    </label>
                    <input
                      type="number"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(Number(e.target.value))}
                      className="w-full bg-white rounded-xl border border-stone-300 p-2.5 font-bold text-stone-900 focus:outline-none focus:border-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Labour Cost (₹):
                    </label>
                    <input
                      type="number"
                      value={laborCost}
                      onChange={(e) => setLaborCost(Number(e.target.value))}
                      className="w-full bg-white rounded-xl border border-stone-300 p-2.5 font-bold text-stone-900 focus:outline-none focus:border-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Time Required (Hours):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={timeRequiredHours}
                      onChange={(e) => setTimeRequiredHours(Number(e.target.value))}
                      className="w-full bg-white rounded-xl border border-stone-300 p-2.5 font-bold text-stone-900 focus:outline-none focus:border-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Other Costs (Packaging/Logistics ₹):
                    </label>
                    <input
                      type="number"
                      value={otherCost}
                      onChange={(e) => setOtherCost(Number(e.target.value))}
                      className="w-full bg-white rounded-xl border border-stone-300 p-2.5 font-bold text-stone-900 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                </div>

                {/* Base Cost Display */}
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-amber-900">Calculated Base Cost of Production:</span>
                    <p className="text-stone-600 text-[11px] mt-0.5">
                      ₹{materialCost} (Materials) + ₹{laborCost} (Labour: {timeRequiredHours}h) + ₹{otherCost} (Other)
                    </p>
                  </div>
                  <div className="text-xl font-extrabold text-stone-900">
                    ₹{materialCost + laborCost + otherCost}
                  </div>
                </div>

                {/* 3 Price Recommendation Tiers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Minimum Suggested Price */}
                  <div
                    onClick={() => {
                      setSelectedPriceTier('minimum');
                      setCustomFinalPrice(priceRecommendation.minimumPrice);
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedPriceTier === 'minimum'
                        ? 'bg-amber-100/70 border-amber-700 shadow-md ring-2 ring-amber-700'
                        : 'bg-white hover:bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase text-stone-500">Minimum Price</span>
                      <span className="text-[10px] bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded-full">
                        +15% buffer
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-stone-900">
                      ₹{priceRecommendation.minimumPrice}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                      Wholesale baseline covering material and bare labor floor.
                    </p>
                  </div>

                  {/* Recommended Fair Trade Price */}
                  <div
                    onClick={() => {
                      setSelectedPriceTier('recommended');
                      setCustomFinalPrice(priceRecommendation.recommendedPrice);
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedPriceTier === 'recommended'
                        ? 'bg-amber-800 text-white shadow-xl ring-2 ring-amber-900'
                        : 'bg-white hover:bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-xs font-bold uppercase ${
                          selectedPriceTier === 'recommended' ? 'text-amber-200' : 'text-amber-800'
                        }`}
                      >
                        Recommended Price ⭐
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedPriceTier === 'recommended'
                            ? 'bg-amber-700 text-amber-100'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        +32% Fair Trade
                      </span>
                    </div>
                    <div
                      className={`mt-2 text-2xl font-black ${
                        selectedPriceTier === 'recommended' ? 'text-white' : 'text-stone-900'
                      }`}
                    >
                      ₹{priceRecommendation.recommendedPrice}
                    </div>
                    <p
                      className={`text-[11px] mt-2 leading-relaxed ${
                        selectedPriceTier === 'recommended' ? 'text-amber-100' : 'text-stone-500'
                      }`}
                    >
                      Optimal marketplace price ensuring fair rural wages and sustainable business profit.
                    </p>
                  </div>

                  {/* Premium Price */}
                  <div
                    onClick={() => {
                      setSelectedPriceTier('premium');
                      setCustomFinalPrice(priceRecommendation.premiumPrice);
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedPriceTier === 'premium'
                        ? 'bg-amber-100/70 border-amber-700 shadow-md ring-2 ring-amber-700'
                        : 'bg-white hover:bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase text-stone-500">Premium Price</span>
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                        +55% margin
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-stone-900">
                      ₹{priceRecommendation.premiumPrice}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                      Targeted for urban luxury exhibitions, corporate gifting, and international buyers.
                    </p>
                  </div>
                </div>

                {/* Artisan Final Price Input */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-800 uppercase block">
                      Confirmed Selling Price (₹):
                    </label>
                    <p className="text-[11px] text-stone-500">
                      You retain complete autonomy over the final price displayed on your digital catalog.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-stone-700">₹</span>
                    <input
                      type="number"
                      value={customFinalPrice}
                      onChange={(e) => {
                        setCustomFinalPrice(Number(e.target.value));
                        setSelectedPriceTier('custom');
                      }}
                      className="w-36 bg-white rounded-xl border border-stone-300 p-2.5 text-base font-black text-stone-900 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                </div>

                {/* EXACT REQUIRED DISCLAIMER */}
                <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-950 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">
                    “{REQUIRED_PRICING_DISCLAIMER}”
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(6)}
                    className="px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Proceed to Review & Edit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------------
                STEP 6: Review & Edit Before Publishing
               ------------------------------------------------------------------- */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                    <span>Step 6 — Review & Fine-Tune Every Field</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Every field is editable before publishing. Once confirmed, this listing will be saved permanently to your products, storefront, and marketplace.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo Review Preview */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                      AI Enhanced Studio Photo:
                    </label>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-300 shadow-md">
                      <img
                        src={enhancedImageDataUrl || productImage}
                        alt="Final enhanced craft"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                        ✓ Studio Environment: {detectedStudioName}
                      </span>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Product Title:
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-bold focus:outline-none focus:border-amber-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Category:
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700 bg-white"
                        >
                          <option value="Bamboo & Cane">Bamboo & Cane</option>
                          <option value="Pottery">Pottery & Terracotta</option>
                          <option value="Woodwork">Wood Crafts & Toys</option>
                          <option value="Textiles">Textiles & Handloom</option>
                          <option value="Paintings">Paintings & Folk Art</option>
                          <option value="Metalcraft">Metalcraft & Brass</option>
                          <option value="Handmade Jewelry">Handmade Jewelry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Craft Type / Technique:
                        </label>
                        <input
                          type="text"
                          value={craftType}
                          onChange={(e) => setCraftType(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Materials:
                        </label>
                        <input
                          type="text"
                          value={material}
                          onChange={(e) => setMaterial(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Estimated Size:
                        </label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Catalog Description:
                      </label>
                      <textarea
                        rows={3}
                        value={generatedDescription}
                        onChange={(e) => setGeneratedDescription(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 p-3 text-xs leading-relaxed focus:outline-none focus:border-amber-700"
                      />
                    </div>

                    {/* Price Confirmation Bar */}
                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-amber-900 uppercase">
                          Confirmed Selling Price:
                        </span>
                        <p className="text-xs text-stone-600">Calculated with fair artisan surplus.</p>
                      </div>
                      <div className="text-xl font-black text-stone-900">
                        ₹{Number(customFinalPrice).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PUBLISH PRODUCT BUTTON (Section 26) */}
                <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Price Assistant</span>
                  </button>

                  <button
                    onClick={handlePublishProduct}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-200" />
                    <span>Publish Product</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
