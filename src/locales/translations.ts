export type SupportedLanguage = 'en' | 'te' | 'ta' | 'kn' | 'ml' | 'bn' | 'or';

export interface Translations {
  appName: string;
  tagline: string;
  supportingTagline: string;
  footerTagline: string;
  heroHeading: string;
  heroSubheading: string;
  startSelling: string;
  exploreCrafts: string;
  howItWorks: string;
  aiFeatures: string;
  featuredArtisans: string;
  featuredProducts: string;
  ourImpact: string;
  b2bMarketplace: string;
  artisanStories: string;
  navHome: string;
  navMarketplace: string;
  navArtisans: string;
  navB2B: string;
  navHowItWorks: string;
  navAbout: string;
  navStudio: string;
  navDashboard: string;
  navOrders: string;
  navAdmin: string;
  login: string;
  logout: string;
  register: string;
  verifiedArtisan: string;
  pendingVerification: string;
  cart: string;
  subtotal: string;
  total: string;
  checkout: string;
  placeOrder: string;
  addToCart: string;
  buyNow: string;
  save: string;
  contactArtisan: string;
  searchPlaceholder: string;
  aiSearchHelper: string;
  studioStep1: string;
  studioStep2: string;
  studioStep3: string;
  studioStep4: string;
  studioStep5: string;
  studioStep6: string;
  studioStep7: string;
  takePhoto: string;
  uploadPhoto: string;
  retakePhoto: string;
  enhancePhoto: string;
  useThisImage: string;
  tryAgain: string;
  generateCatalog: string;
  publishProduct: string;
  recommendedPrice: string;
  minimumPrice: string;
  premiumPrice: string;
  priceDisclaimer: string;
  ordersReceived: string;
  myOrders: string;
  statusPlaced: string;
  statusConfirmed: string;
  statusProcessing: string;
  statusShipped: string;
  statusDelivered: string;
  postRequirement: string;
  sendProposal: string;
  matchedArtisans: string;
  verifyArtisanBtn: string;
  rejectArtisanBtn: string;
}

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' }
];

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'KalaConnect AI',
    tagline: 'From Your Craft to the World.',
    supportingTagline: 'Empowering artisans with AI, digital tools and better market access.',
    footerTagline: 'Empowering artisans. Preserving traditions. Connecting markets.',
    heroHeading: 'From Your Craft to the World.',
    heroSubheading: 'Turn your handmade products into professional digital catalogs and reach customers beyond your local market.',
    startSelling: 'START SELLING',
    exploreCrafts: 'EXPLORE CRAFTS',
    howItWorks: 'How It Works',
    aiFeatures: 'AI Features',
    featuredArtisans: 'Featured Artisans',
    featuredProducts: 'Featured Products',
    ourImpact: 'Our Impact',
    b2bMarketplace: 'Business Marketplace',
    artisanStories: 'Artisan Stories',
    navHome: 'Home',
    navMarketplace: 'Explore Crafts',
    navArtisans: 'Artisans',
    navB2B: 'Business Marketplace',
    navHowItWorks: 'How It Works',
    navAbout: 'About',
    navStudio: 'AI Product Studio',
    navDashboard: 'Dashboard',
    navOrders: 'Orders',
    navAdmin: 'Admin Console',
    login: 'Login',
    logout: 'Logout',
    register: 'Start Selling',
    verifiedArtisan: 'Verified Artisan',
    pendingVerification: 'Verification Pending',
    cart: 'Shopping Cart',
    subtotal: 'Subtotal',
    total: 'Total Amount',
    checkout: 'Checkout',
    placeOrder: 'Place Order',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    save: 'Save',
    contactArtisan: 'Contact Artisan',
    searchPlaceholder: 'Search handmade products...',
    aiSearchHelper: 'Natural search: "I want an eco-friendly handmade gift under ₹1000"',
    studioStep1: 'Step 1: Take or Upload Photo',
    studioStep2: 'Step 2: AI Photo Enhancement',
    studioStep3: 'Step 3: Describe Product',
    studioStep4: 'Step 4: Generate AI Catalog',
    studioStep5: 'Step 5: Price Recommendation',
    studioStep6: 'Step 6: Review & Edit',
    studioStep7: 'Step 7: Publish Product',
    takePhoto: 'Take Photo',
    uploadPhoto: 'Upload From Device',
    retakePhoto: 'Retake Photo',
    enhancePhoto: 'Enhance Photo',
    useThisImage: 'Use This Image',
    tryAgain: 'Try Again',
    generateCatalog: 'GENERATE AI CATALOG',
    publishProduct: 'PUBLISH PRODUCT',
    recommendedPrice: 'Recommended Price',
    minimumPrice: 'Minimum Suggested Price',
    premiumPrice: 'Premium Price',
    priceDisclaimer: 'Price recommendations are estimates based on the information provided. The artisan should review the final selling price.',
    ordersReceived: 'Orders Received',
    myOrders: 'My Orders',
    statusPlaced: 'Placed',
    statusConfirmed: 'Confirmed',
    statusProcessing: 'Processing',
    statusShipped: 'Shipped',
    statusDelivered: 'Delivered',
    postRequirement: 'POST REQUIREMENT',
    sendProposal: 'SEND PROPOSAL',
    matchedArtisans: 'MATCHED ARTISANS',
    verifyArtisanBtn: 'Verify Artisan',
    rejectArtisanBtn: 'Reject Artisan'
  },
  te: {
    appName: 'కళా-కనెక్ట్ AI',
    tagline: 'మీ కళ నుండి ప్రపంచానికి.',
    supportingTagline: 'AI, డిజిటల్ సాధనాలు మరియు మెరుగైన మార్కెట్ ప్రాప్యతతో కళాకారులకు సాధికారత.',
    footerTagline: 'కళాకారులకు సాధికారత. సంప్రదాయాల పరిరక్షణ. మార్కెట్ల అనుసంధానం.',
    heroHeading: 'మీ కళ నుండి ప్రపంచానికి.',
    heroSubheading: 'మీ చేతితో తయారు చేసిన ఉత్పత్తులను ప్రొఫెషనల్ డిజిటల్ కేటలాగ్‌లుగా మార్చండి మరియు ప్రపంచ వినియోగదారులను చేరుకోండి.',
    startSelling: 'అమ్మడం ప్రారంభించండి',
    exploreCrafts: 'హస్తకళలను చూడండి',
    howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    aiFeatures: 'AI ప్రత్యేకతలు',
    featuredArtisans: 'ప్రముఖ కళాకారులు',
    featuredProducts: 'ప్రత్యేక ఉత్పత్తులు',
    ourImpact: 'మన ప్రభావం',
    b2bMarketplace: 'బిజినెస్ మార్కెట్',
    artisanStories: 'కళాకారుల కథలు',
    navHome: 'హోమ్',
    navMarketplace: 'చేతివృత్తులు',
    navArtisans: 'కళాకారులు',
    navB2B: 'బిజినెస్ మార్కెట్',
    navHowItWorks: 'ఎలా పనిచేస్తుంది',
    navAbout: 'గురించి',
    navStudio: 'AI ప్రొడక్ట్ స్టూడియో',
    navDashboard: 'డ్యాష్‌బోర్డ్',
    navOrders: 'ఆర్డర్లు',
    navAdmin: 'అడ్మిన్ ప్యానెల్',
    login: 'లాగిన్',
    logout: 'లాగౌట్',
    register: 'రిజిస్టర్',
    verifiedArtisan: 'ధృవీకరించబడిన కళాకారుడు',
    pendingVerification: 'ధృవీకరణ పెండింగ్‌లో ఉంది',
    cart: 'షాపింగ్ కార్ట్',
    subtotal: 'ఉపమొత్తం',
    total: 'మొత్తం చెల్లింపు',
    checkout: 'చెక్‌అవుట్ చేయండి',
    placeOrder: 'ఆర్డర్ ఉంచండి',
    addToCart: 'కార్ట్‌కు జోడించండి',
    buyNow: 'ఇప్పుడే కొనండి',
    save: 'సేవ్ చేయండి',
    contactArtisan: 'కళాకారుడిని సంప్రదించండి',
    searchPlaceholder: 'చేతితో తయారు చేసిన ఉత్పత్తులను వెతకండి...',
    aiSearchHelper: 'సహజ శోధన: "నాకు ₹1000 లోపు పర్యావరణ అనుకూల బహుమతి కావాలి"',
    studioStep1: 'దశ 1: ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి',
    studioStep2: 'దశ 2: AI ఫోటో మెరుగుదల',
    studioStep3: 'దశ 3: ఉత్పత్తి వివరణ',
    studioStep4: 'దశ 4: AI కేటలాగ్ సృష్టి',
    studioStep5: 'దశ 5: ధర సిఫార్సు',
    studioStep6: 'దశ 6: సమీక్షించి సవరించండి',
    studioStep7: 'దశ 7: ఉత్పత్తిని ప్రచురించండి',
    takePhoto: 'ఫోటో తీయండి',
    uploadPhoto: 'డివైస్ నుండి అప్‌లోడ్',
    retakePhoto: 'మళ్లీ తీయండి',
    enhancePhoto: 'ఫోటోను మెరుగుపరచండి',
    useThisImage: 'ఈ ఫోటోను ఉపయోగించండి',
    tryAgain: 'మళ్లీ ప్రయత్నించండి',
    generateCatalog: 'AI కేటలాగ్‌ను రూపొందించండి',
    publishProduct: 'ఉత్పత్తిని ప్రచురించండి',
    recommendedPrice: 'సిఫార్సు చేయబడిన ధర',
    minimumPrice: 'కనీస ప్రాథమిక ధర',
    premiumPrice: 'ప్రీమియం ధర',
    priceDisclaimer: 'ధర సిఫార్సులు అందించిన సమాచారం ఆధారంగా అంచనాలు మాత్రమే. కళాకారుడు తుది అమ్మకపు ధరను సమీక్షించాలి.',
    ordersReceived: 'వచ్చిన ఆర్డర్లు',
    myOrders: 'నా ఆర్డర్లు',
    statusPlaced: 'ఆర్డర్ చేయబడింది',
    statusConfirmed: 'ధృవీకరించబడింది',
    statusProcessing: 'పనిలో ఉంది',
    statusShipped: 'రవాణా చేయబడింది',
    statusDelivered: 'డెలివరీ చేయబడింది',
    postRequirement: 'బల్క్ అవసరాన్ని పోస్ట్ చేయండి',
    sendProposal: 'ప్రతిపాదన పంపండి',
    matchedArtisans: 'సరిపోలిన కళాకారులు',
    verifyArtisanBtn: 'ధృవీకరించు',
    rejectArtisanBtn: 'తిరస్కరించు'
  },
  ta: { ...({} as any) }, // Fallbacks to en
  kn: { ...({} as any) },
  ml: { ...({} as any) },
  bn: { ...({} as any) },
  or: { ...({} as any) }
};

// Fill non-English/Telugu fallbacks
['ta', 'kn', 'ml', 'bn', 'or'].forEach((code) => {
  (TRANSLATIONS as any)[code] = TRANSLATIONS.en;
});
