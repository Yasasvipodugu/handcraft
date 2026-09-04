import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../services/database';
import { generateAICatalog, CRAFT_PRESETS } from '../services/aiCatalogService';
import {
  processBackgroundReplacement,
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
  Maximize2
} from 'lucide-react';

export const AiProductStudio: React.FC = () => {
  const { currentUser, currentArtisan, switchRole } = useAuth();
  const { t } = useLanguage();
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
  const [productImage, setProductImage] = useState<string>(
    'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80'
  );
  const [originalImage, setOriginalImage] = useState<string>(
    'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80'
  );
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 2: Description & Translation State (Telugu -> English)
  const [descriptionInput, setDescriptionInput] = useState<string>(
    'ఇది వెదురుతో చేతితో తయారు చేసిన బుట్ట. ఇది వస్తువులను నిల్వ చేసుకోవడానికి ఉపయోగపడుతుంది.'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Telugu');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedEnglish, setTranslatedEnglish] = useState<string>(
    'This is a handmade bamboo basket crafted from natural bamboo. It is suitable for storing household items.'
  );
  const [isEditingTranslation, setIsEditingTranslation] = useState<boolean>(false);

  // STEP 3: Generated Catalog Fields (Strictly no invented info)
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [productName, setProductName] = useState<string>('Handmade Bamboo Storage Basket');
  const [generatedDescription, setGeneratedDescription] = useState<string>(
    'This is a handmade bamboo basket crafted from natural bamboo. It is suitable for storing household items.'
  );
  const [category, setCategory] = useState<string>('Bamboo & Cane');
  const [material, setMaterial] = useState<string>('Natural Bamboo');
  const [craftType, setCraftType] = useState<string>('Traditional Bamboo Weaving');
  const [dimensions, setDimensions] = useState<string>('Not specified');
  const [keywords, setKeywords] = useState<string[]>(['bamboo basket', 'eco friendly', 'handwoven', 'storage']);
  const [tags, setTags] = useState<string[]>(['Bamboo Craft', 'Eco-Friendly', 'Handmade']);
  const [productHighlights, setProductHighlights] = useState<string[]>([
    'Handmade by traditional artisans with generational skill',
    'Crafted from natural seasoned bamboo'
  ]);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [highlightInput, setHighlightInput] = useState<string>('');

  // STEP 4: Real Background Replacement & Interactive Slider State
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('smart-match');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('1:1');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [enhancedImageDataUrl, setEnhancedImageDataUrl] = useState<string>('');
  const [isProcessingBackground, setIsProcessingBackground] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<ProcessingStage>(PROCESSING_STAGES[0]);
  const [detectedStudioName, setDetectedStudioName] = useState<string>('Natural Bamboo Craft Studio');
  const [isolationSensitivity, setIsolationSensitivity] = useState<IsolationSensitivity>('deep-clean');
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const lastProcessedKeyRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  // STEP 5: Price Recommendation State
  const [materialCost, setMaterialCost] = useState<number>(300);
  const [laborCost, setLaborCost] = useState<number>(200);
  const [otherCost, setOtherCost] = useState<number>(100);
  const [timeRequiredHours, setTimeRequiredHours] = useState<number>(2.5);
  const [desiredProfitMargin, setDesiredProfitMargin] = useState<number>(32);
  const [priceRecommendation, setPriceRecommendation] = useState<PriceCalculation>(() =>
    calculatePriceRecommendation(300, 2.5, 140, 100)
  );
  const [selectedPriceTier, setSelectedPriceTier] = useState<'minimum' | 'recommended' | 'premium' | 'custom'>('recommended');
  const [customFinalPrice, setCustomFinalPrice] = useState<number>(780);

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

  // Recalculate price when parameters change
  useEffect(() => {
    const hourlyRate = timeRequiredHours > 0 ? Math.round(laborCost / timeRequiredHours) : 140;
    const calc = calculatePriceRecommendation(materialCost, timeRequiredHours, hourlyRate, otherCost);
    setPriceRecommendation(calc);
    if (selectedPriceTier === 'minimum') setCustomFinalPrice(calc.minimumPrice);
    else if (selectedPriceTier === 'recommended') setCustomFinalPrice(calc.recommendedPrice);
    else if (selectedPriceTier === 'premium') setCustomFinalPrice(calc.premiumPrice);
  }, [materialCost, laborCost, otherCost, timeRequiredHours, desiredProfitMargin, selectedPriceTier]);

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
      const processingKey = `${imgSrc.substring(0, 50)}-${cat}-${desc}-${bgStyle}-${ratio}-${sens}`;
      if (!force && lastProcessedKeyRef.current === processingKey) {
        return; // Already generated for these exact parameters
      }
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      lastProcessedKeyRef.current = processingKey;

      setIsProcessingBackground(true);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imgSrc;
        await new Promise((res) => {
          img.onload = res;
          img.onerror = () => res(true);
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

        setEnhancedImageDataUrl(result.compositedDataUrl);
        setDetectedStudioName(result.studioName);
        showToast('Studio Backdrop Created ✨', `${result.studioName} ready.`, 'success');
      } catch (err) {
        console.error('Background replacement failed:', err);
      } finally {
        setIsProcessingBackground(false);
        isProcessingRef.current = false;
      }
    },
    [isolationSensitivity, showToast]
  );

  // Auto-run background replacement when Step 4 is opened or image/style changes
  useEffect(() => {
    if (currentStep === 4 && originalImage) {
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
    originalImage,
    backgroundStyle,
    aspectRatio,
    isolationSensitivity,
    category,
    generatedDescription,
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
      setOriginalImage(dataUrl);
      setProductImage(dataUrl);
      stopCamera();
      showToast('Photo Captured! 📸', 'Your product image was captured successfully.', 'success');
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
        setOriginalImage(result);
        setProductImage(result);
        showToast('Photo Uploaded', 'Product image loaded into studio.', 'success');
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
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
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
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
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

      setCurrentStep(3);
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

    const newProduct = db.addProduct({
      artisanId: currentArtisan?.id || 'artisan-1',
      artisanName: currentArtisan?.name || currentUser?.name || 'Kalyani Devi',
      artisanLocation: `${currentArtisan?.village || 'Artisan Cluster'}, ${currentArtisan?.state || 'Andhra Pradesh'}`,
      artisanVerified: currentArtisan?.verificationStatus === 'verified',
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
              { num: 2, label: '2. Telugu Voice & Translate' },
              { num: 3, label: '3. AI Catalog' },
              { num: 4, label: '4. AI Background Replacement' },
              { num: 5, label: '5. Smart Pricing' },
              { num: 6, label: '6. Review & Edit' },
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
                        className="py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>TAKE PHOTO</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-200"
                      >
                        <Upload className="w-4 h-4" />
                        <span>UPLOAD FROM DEVICE</span>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
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
                              showToast('Craft Selected', `Loaded: ${craft.label}`, 'info');
                            }}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 hover:border-amber-300 border border-stone-200 text-stone-700 transition-colors"
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
                    className="px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Proceed to Telugu Voice & Description</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------------
                STEP 2: Telugu Voice Input & Telugu -> English AI Translation
               ------------------------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-amber-700" />
                    <span>Step 2 — Telugu Voice Input & AI Translation</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Speak or type your product description in Telugu. KalaConnect AI will translate it into professional e-commerce English without inventing unverified facts.
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

                  {/* Telugu Voice / Text Input Box */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                        Your Description (Telugu):
                      </label>
                      <button
                        type="button"
                        onClick={handleVoiceToggle}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          isListening
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-amber-700 hover:bg-amber-800 text-white'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Stop Recording</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>Speak in {selectedLanguage}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                      placeholder="ఉదాహరణ: ఇది వెదురుతో చేతితో తయారు చేసిన బుట్ట. ఇది వస్తువులను నిల్వ చేసుకోవడానికి ఉపయోగపడుతుంది."
                      className="w-full rounded-2xl border border-stone-300 p-4 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-amber-700 bg-white font-medium"
                    />

                    {/* Quick Telugu Craft Voice Samples */}
                    <div className="pt-1">
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
                            className="text-[10px] bg-white hover:bg-amber-100 hover:text-amber-900 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors text-left font-medium"
                          >
                            “{prompt.substring(0, 42)}...”
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Translation Action Trigger */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleTranslateTeluguToEnglish}
                      disabled={isTranslating}
                      className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Wand2 className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
                      <span>{isTranslating ? 'Translating to English...' : 'Translate to English'}</span>
                    </button>
                  </div>

                  {/* TRANSLATION PREVIEW CARD */}
                  <div className="bg-white rounded-2xl p-5 border border-stone-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                        English Description (Translated):
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingTranslation(!isEditingTranslation)}
                        className="text-[11px] text-stone-600 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingTranslation ? 'Done Editing' : 'Edit Translation'}</span>
                      </button>
                    </div>

                    {isEditingTranslation ? (
                      <textarea
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

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-stone-400">
                        Rule enforced: Unspecified specifications marked as "Not specified".
                      </span>
                      <button
                        type="button"
                        onClick={handleTranslateTeluguToEnglish}
                        className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleGenerateAICatalog}
                    disabled={isGenerating}
                    className="px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Continue to AI Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------------
                STEP 3: AI Generated Catalog Specifications
               ------------------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                    <span>Step 3 — AI Catalog Generation (Editable)</span>
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
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Proceed to Real Background Replacement</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------------
                STEP 4: REAL AI Background Replacement & Before/After Slider
               ------------------------------------------------------------------- */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-700" />
                    <span>Step 4 — Real AI Background Replacement</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Your original background (room, floor, or clutter) is completely removed. Your authentic craft item is preserved and placed into a matching studio environment.
                  </p>
                </div>

                {/* Multi-Stage Processing Visual Indicator */}
                {isProcessingBackground && (
                  <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-700 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{currentStage.label}</span>
                      </div>
                      <span className="text-[11px] font-mono text-stone-400">Stage {currentStage.step} of 7</span>
                    </div>
                    <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${(currentStage.step / 7) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-300">{currentStage.detail}</p>
                  </div>
                )}

                {/* =================================================================
                    INTERACTIVE BEFORE / AFTER SPLIT SLIDER
                   ================================================================= */}
                <div className="space-y-3">
                  <div
                    ref={sliderContainerRef}
                    onMouseDown={handleMouseDown}
                    onTouchMove={handleTouchMove}
                    className={`relative w-full aspect-square sm:aspect-4/3 max-h-[520px] rounded-3xl overflow-hidden select-none cursor-ew-resize border-2 border-stone-800 shadow-2xl ${
                      backgroundStyle === 'transparent'
                        ? 'bg-stone-100 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:16px_16px]'
                        : 'bg-stone-950'
                    }`}
                  >
                    {/* Layer 1: AI Enhanced Transformed Studio Image */}
                    <div
                      className={`absolute inset-0 w-full h-full flex items-center justify-center ${
                        backgroundStyle === 'transparent'
                          ? 'bg-stone-100 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:16px_16px]'
                          : 'bg-stone-900'
                      }`}
                    >
                      <img
                        src={enhancedImageDataUrl || originalImage}
                        alt="AI Enhanced Studio"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-4 right-4 bg-amber-800/90 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-black shadow-md border border-amber-500/30 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>AI ENHANCED STUDIO</span>
                      </div>
                    </div>

                    {/* Layer 2: Original Uploaded Image (Clipped by slider position) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden bg-stone-950"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <div
                        className="relative w-full h-full"
                        style={{
                          width: sliderContainerRef.current?.clientWidth || 600,
                          height: sliderContainerRef.current?.clientHeight || 450
                        }}
                      >
                        <img
                          src={originalImage}
                          alt="Original Raw"
                          className="w-full h-full object-cover filter brightness-95"
                        />
                        <div className="absolute top-4 left-4 bg-stone-900/90 backdrop-blur-xs text-stone-200 px-3 py-1 rounded-full text-xs font-extrabold shadow-md border border-stone-700">
                          ORIGINAL PHOTO
                        </div>
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
                    <span className="text-[11px] font-black text-stone-500 uppercase">Original</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="flex-1 accent-amber-700 cursor-pointer"
                    />
                    <span className="text-[11px] font-black text-amber-800 uppercase">AI Studio</span>
                  </div>
                </div>

                {/* 5 ACTION BUTTONS FOR BEFORE / AFTER */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-stone-100 rounded-2xl border border-stone-200">
                  <div className="flex flex-wrap items-center gap-2">
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
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                      <span>Regenerate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBackgroundStyle('smart-match');
                        executeBackgroundReplacement(
                          originalImage,
                          category,
                          generatedDescription,
                          'smart-match',
                          aspectRatio,
                          isolationSensitivity,
                          true
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                      <span>Reset</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const styleSelector = document.getElementById('studio-environment-selector');
                        styleSelector?.scrollIntoView({ behavior: 'smooth' });
                        showToast('Studio Styles', 'Choose a background from the options below.', 'info');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-purple-700" />
                      <span>Change Background</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSliderPosition(100);
                        showToast('Original Preview', 'Showing raw unedited photo.', 'info');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-300 transition-colors cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (enhancedImageDataUrl) setProductImage(enhancedImageDataUrl);
                      setCurrentStep(5);
                      showToast('Image Confirmed! 📸', 'AI Studio product image locked for catalog.', 'success');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Use This Image</span>
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

                {/* Studio Background Style Selector (Section 14) */}
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => {
                      if (enhancedImageDataUrl) setProductImage(enhancedImageDataUrl);
                      setCurrentStep(5);
                    }}
                    className="px-7 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
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
