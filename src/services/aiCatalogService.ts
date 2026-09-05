export interface AICatalogResult {
  productName: string;
  description: string;
  category: string;
  material: string;
  craftType: string;
  estimatedSize: string;
  keywords: string[];
  tags: string[];
  productHighlights: string[];
  suggestedCostBreakdown: {
    materialCost: number;
    labourHours: number;
    hourlyRate: number;
    otherCost: number;
  };
  translations: {
    te: { name: string; description: string };
    ta?: { name: string; description: string };
    kn?: { name: string; description: string };
    ml?: { name: string; description: string };
    bn?: { name: string; description: string };
    or?: { name: string; description: string };
  };
}

export const CRAFT_PRESETS = [
  {
    label: 'Artisan Rose Gold Watch',
    image: './assets/products/artisan_watch.jpg',
    voiceText: 'This is a handcrafted rose gold analog watch with a minimalist dial, scratch-resistant crystal, and adjustable stainless steel mesh strap. Assembled by skilled horology artisans.'
  },
  {
    label: 'Assam Bamboo Basket',
    image: './assets/products/bamboo_basket.jpg',
    voiceText: 'This is an authentic handmade Assam bamboo storage basket hand-woven by river artisans using seasoned golden bamboo and wild cane. Strong, lightweight, and completely eco-friendly for natural home storage.'
  },
  {
    label: 'Mithila Tree of Life Painting',
    image: './assets/products/madhubani_painting.jpg',
    voiceText: 'Hand-painted traditional Madhubani Tree of Life folk artwork on handmade rag paper using organic dyes from turmeric and marigold flowers. Created using traditional Kachni line drawing techniques.'
  },
  {
    label: 'Kondapalli Dancing Toy',
    image: './assets/products/kondapalli_toy.jpg',
    voiceText: 'Classic Kondapalli dancing doll hand carved from light Poniki wood. Painted with non-toxic natural colors and vegetable enamel. It bobs and sways with a delicate counterweight mechanism.'
  },
  {
    label: 'Bankura Terracotta Figurine',
    image: './assets/products/terracotta_pot.jpg',
    voiceText: 'Traditional Bankura terracotta decorative planter sculpted from river silt clay and open-kiln baked. Features stylized erect ears and symmetrical geometric markings.'
  },
  {
    label: 'Pure Kashmir Pashmina Shawl',
    image: './assets/products/pashmina_shawl.jpg',
    voiceText: 'Pure Kashmiri pashmina cashmere shawl hand spun and woven on wooden looms with delicate sozni needle embroidery on the borders. Feather-light warmth and heirloom quality.'
  },
  {
    label: 'Bastar Dhokra Bell Metal Cast',
    image: './assets/products/dokra_brass.jpg',
    voiceText: 'Ancient tribal brass metal figurine cast using 4000 year old lost wax technique. Rustic textured tribal musician holding traditional drum, completely handmade.'
  }
];

export async function generateAICatalog(
  inputDescription: string,
  imageHint?: string,
  artisanCraftCategory?: string
): Promise<AICatalogResult> {
  // Realistic AI response latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const text = (inputDescription || '').toLowerCase();

  // Pattern detection for domain-specific handicraft extraction
  if (text.includes('watch') || text.includes('wristwatch') || text.includes('timepiece') || text.includes('dial') || text.includes('strap') || text.includes('rose gold')) {
    return {
      productName: 'Classic Rose Gold Minimalist Artisan Watch',
      description:
        'A masterfully crafted analog timepiece uniting heritage minimalist metallurgy with contemporary luxury. Features a polished rose gold stainless casing, scratch-resistant mineral crystal glass, an ultra-quiet Japanese quartz movement, and an artisan-stitched mesh strap.',
      category: 'Jewelry & Watches',
      material: 'Surgical 316L Stainless Steel, Rose Gold Ion Plating & Sapphire Crystal Glass',
      craftType: 'Precision Horology & Hand-Assembled Metalwork',
      estimatedSize: 'Case Diameter: 38 mm, Thickness: 7 mm, Lug-to-Lug: 20 cm',
      keywords: ['rose gold watch', 'artisan wristwatch', 'minimalist timepiece', 'luxury jewelry watch', 'handcrafted dial', 'formal watch'],
      tags: ['Luxury Finish', 'Water Resistant 3ATM', 'Precision Quartz', 'Artisan Assembled'],
      productHighlights: [
        'Solid 316L stainless steel casing with durable rose gold PVD vacuum ion plating',
        'Scratch-resistant mineral crystal glass and water resistance up to 30 meters (3 ATM)',
        'Precision Japanese quartz caliber providing pinpoint timekeeping accuracy',
        'Smooth adjustable milanese mesh band with secure fold-over safety clasp'
      ],
      suggestedCostBreakdown: {
        materialCost: 850,
        labourHours: 4.0,
        hourlyRate: 250,
        otherCost: 350
      },
      translations: {
        te: {
          name: 'క్లాసిక్ రోజ్ గోల్డ్ మినిమలిస్ట్ ఆర్టిసాన్ వాచ్',
          description: 'సొగసైన రోజ్ గోల్డ్ ఫినిషింగ్ మరియు అత్యున్నత నాణ్యతతో రూపొందించబడిన చేతి గడియారం. ప్రత్యేక సందర్భాలకు మరియు రోజువారీ వాడకానికి అనుకూలం.'
        }
      }
    };
  }

  if (text.includes('bamboo') || text.includes('cane') || text.includes('basket') || text.includes('weaving')) {
    return {
      productName: 'Handcrafted Organic Bamboo Storage & Serving Basket',
      description:
        'Lovingly hand-woven by master cane artisans using mature, naturally seasoned bamboo culms. Featuring smooth sanded edges and resilient structural braiding, this multi-purpose basket brings earthy elegance to dining tables, fruit arrangements, and zero-waste home organization.',
      category: 'Bamboo & Cane',
      material: '100% Biodegradable Assam Golden Bamboo & Wild River Cane',
      craftType: 'Traditional Interlocking Hexagonal Weaving',
      estimatedSize: '30 cm Diameter x 18 cm Height (Weight: 380g)',
      keywords: ['bamboo basket', 'eco friendly home', 'sustainable decor', 'handwoven', 'natural cane', 'gift under 1000'],
      tags: ['Eco-Friendly', 'GI Certified Craft', 'Zero Waste', 'Kitchen & Living'],
      productHighlights: [
        '100% natural seasoned river bamboo and wild cane',
        'Hand-split and woven without chemical binding adhesives',
        'Lightweight, mold-resistant, and washable with water',
        'Direct fair-trade sourcing empowering rural artisan clusters'
      ],
      suggestedCostBreakdown: {
        materialCost: 220,
        labourHours: 2.5,
        hourlyRate: 140,
        otherCost: 80
      },
      translations: {
        te: {
          name: 'సహజసిద్ధమైన చేతితో నేసిన వెదురు బుట్ట',
          description: 'అస్సాం గ్రామీణ కళాకారులచే సాంప్రదాయకంగా తయారు చేయబడిన అందమైన వెదురు బుట్ట. పర్యావరణ అనుకూలమైనది మరియు దీర్ఘకాలం మన్నే నాణ్యత.'
        }
      }
    };
  }

  if (text.includes('madhubani') || text.includes('painting') || text.includes('mithila') || text.includes('paper') || text.includes('art')) {
    return {
      productName: 'Mithila Tree of Life Heritage Folk Painting',
      description:
        'A sacred visual meditation on cosmic life, hand-drawn on sun-cured cotton handmade paper using fine bamboo nibs and twigs. The pigments are painstakingly extracted from dried turmeric, marigold blossoms, and soot, forming an authentic GI-recognized Madhubani heirloom.',
      category: 'Paintings',
      material: 'Handmade Cotton Rag Paper & Botanical Mineral Dyes',
      craftType: 'Kachni (Line Work) & Bharni (Pigment Filling) Folk Technique',
      estimatedSize: '38 cm x 28 cm (15 x 11 inches) Unframed',
      keywords: ['madhubani painting', 'mithila folk art', 'tree of life', 'handmade paper art', 'traditional wall decor', 'botanical colors'],
      tags: ['GI Tagged Bihar', '100% Natural Dyes', 'Heritage Wall Art', 'Spiritual Decor'],
      productHighlights: [
        'Rendered on 250 GSM acid-free handmade cotton rag paper',
        'Natural plant pigments: turmeric yellow, soot black, indigo blue',
        'Traditional Kachni fine line-work executed by master Mithila women',
        'GI-certified folk heritage provenance with authenticity slip'
      ],
      suggestedCostBreakdown: {
        materialCost: 280,
        labourHours: 5.0,
        hourlyRate: 160,
        otherCost: 120
      },
      translations: {
        te: {
          name: 'మిథిల ట్రీ ఆఫ్ లైఫ్ సాంప్రదాయ మధుబని పెయింటింగ్',
          description: 'సహజసిద్ధమైన రంగులతో చేతితో తయారు చేసిన కాగితంపై గీసిన అందమైన కళాఖండం. సాంప్రదాయ కచ్ని శైలిలో రూపొందించబడింది.'
        }
      }
    };
  }

  if (text.includes('terracotta') || text.includes('clay') || text.includes('pot') || text.includes('planter') || text.includes('pottery')) {
    return {
      productName: 'Hand-Molded Terracotta Earthen Heritage Art Piece',
      description:
        'Crafted from indigenous alluvial silt clay collected from sacred riverbanks. Hand-shaped on the traditional potter’s wheel and slow-fired in charcoal kilns to achieve the timeless warm terracotta blush that breathes naturally.',
      category: 'Pottery',
      material: 'Riverbed Alluvial Red Clay & Natural Ochre Slip',
      craftType: 'Wheel-Thrown & Open Kiln Oxidation Firing',
      estimatedSize: '22 cm Height x 14 cm Diameter (Weight: 950g)',
      keywords: ['terracotta', 'clay art', 'earthen decor', 'handcrafted pottery', 'eco friendly planter'],
      tags: ['Terracotta', 'Porous Clay', 'Organic Living', 'Hand Sculpted'],
      productHighlights: [
        'Crafted with 100% lead-free alluvial riverbank silt',
        'Naturally porous clay promotes optimum thermal and moisture balance',
        'Slow-fired in wood-fueled reduction kilns for deep terracotta hue',
        'Hand-burnished with river pebbles for satin sheen'
      ],
      suggestedCostBreakdown: {
        materialCost: 190,
        labourHours: 3.0,
        hourlyRate: 140,
        otherCost: 90
      },
      translations: {
        te: {
          name: 'సాంప్రదాయ టెర్రకోట మట్టి కళాఖండం',
          description: 'నదీ తీర మట్టితో సాంప్రదాయ పద్ధతిలో తయారు చేసిన మట్టి పాత్ర. సహజమైన చల్లదనాన్ని మరియు పర్యావరణ హితాన్ని అందిస్తుంది.'
        }
      }
    };
  }

  if (text.includes('toy') || text.includes('kondapalli') || text.includes('wood') || text.includes('carv')) {
    return {
      productName: 'Hand-Carved Traditional Indian Wooden Heirloom Toy',
      description:
        'Chiseled from lightweight native softwood (Tella Poniki) with vegetable gum joinery and hand-buffed with non-toxic natural lacquer. Designed to be completely child-safe while celebrating centuries of folkloric Indian craft traditions.',
      category: 'Woodwork',
      material: 'Sustainably Harvested Tella Poniki Wood & Natural Lac Enamels',
      craftType: 'Traditional Lathe Turning & Knife Chiseling',
      estimatedSize: '20 cm Height x 9 cm Base Width (Weight: 220g)',
      keywords: ['wooden toy', 'kondapalli', 'non toxic toy', 'hand carved figurine', 'indian folk toy'],
      tags: ['Child Safe', 'Non-Toxic Colors', 'GI Tag Heritage', 'Eco Toy'],
      productHighlights: [
        'Carved from feather-light, seasoned Tella Poniki wood',
        'Finished with vegetable gum and pure non-toxic natural resin lacquers',
        'Precision counter-weighted base creates soothing bobbing motion',
        'Centuries-old GI craft tradition from Andhra Pradesh'
      ],
      suggestedCostBreakdown: {
        materialCost: 180,
        labourHours: 2.5,
        hourlyRate: 135,
        otherCost: 70
      },
      translations: {
        te: {
          name: 'చేతితో చెక్కిన సాంప్రదాయ కొండపల్లి చెక్క బొమ్మ',
          description: 'హానికర రసాయనాలు లేని సహజ రంగులతో తెల్ల పొనికి చెక్కతో రూపొందించిన బొమ్మ. పిల్లలకు సురక్షితమైన సాంప్రదాయ క్రీడా వస్తువు.'
        }
      }
    };
  }

  if (text.includes('pashmina') || text.includes('shawl') || text.includes('silk') || text.includes('saree') || text.includes('textile') || text.includes('weave')) {
    return {
      productName: 'Heritage Handloom Pure Woven Textile with Artisanal Borders',
      description:
        'Lovingly hand-spun and woven on traditional wooden pit looms by generational weavers. The fabric possesses an exquisite tactile drape, accentuated by hand-finished selvedges and intricate ethnic motifs.',
      category: 'Textiles',
      material: 'Ethically Sourced Natural Cashmere & Mulberry Silk Threads',
      craftType: 'Handloom Shuttle Weaving & Needle Border Work',
      estimatedSize: '200 cm Length x 90 cm Width',
      keywords: ['handloom textile', 'pure handwoven', 'artisan weave', 'indian heritage saree', 'luxury shawl'],
      tags: ['Handloom Mark', 'Silk Mark Certified', 'Artisanal Weave'],
      productHighlights: [
        '100% fine hand-spun cashmere and pure mulberry silk warp',
        'Woven on pit looms requiring over 45 days of concentrated artisan labor',
        'Intricate needle sozni micro-embroidery along borders',
        'Lightweight, feather-soft texture with graceful drape'
      ],
      suggestedCostBreakdown: {
        materialCost: 1200,
        labourHours: 8.0,
        hourlyRate: 160,
        otherCost: 200
      },
      translations: {
        te: {
          name: 'సాంప్రదాయ చేనేత వస్త్ర కళారూపం',
          description: 'చేనేత మగ్గాలపై నేత కార్మికులచే నైపుణ్యంతో నేయబడిన స్వచ్ఛమైన వస్త్రం. సహజ పట్టు మరియు ఆధునిక హుందాతనం కలగలిసినది.'
        }
      }
    };
  }

  // General fallback tailored to the artisan's input
  const titleWords = text
    .split(' ')
    .filter((w) => w.length > 3)
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    productName: titleWords ? `Artisanal Handcrafted ${titleWords}` : 'Handcrafted Indigenous Folk Craft Creation',
    description:
      inputDescription ||
      'Authentic handcrafted artisan treasure created using traditional generational methods and sustainably harvested local raw materials.',
    category: artisanCraftCategory || 'Crafts & Heritage',
    material: 'Locally Sourced Organic & Sustainable Materials',
    craftType: 'Generational Handcrafted Technique',
    estimatedSize: 'Standard Artisanal Dimensions (Customizable)',
    keywords: ['handcrafted', 'artisan made', 'indian craft', 'traditional', 'sustainable'],
    tags: ['Artisanal', 'Handmade', 'Cultural Heritage'],
    productHighlights: [
      'Handcrafted using sustainably sourced regional materials',
      'Preserves generational artisan craft heritage',
      'Quality checked with authentic artisanal finish',
      'Direct fair-trade economic support for artisan families'
    ],
    suggestedCostBreakdown: {
      materialCost: 250,
      labourHours: 3.0,
      hourlyRate: 140,
      otherCost: 80
    },
    translations: {
      te: {
        name: `చేతితో చేసిన భారతీయ సాంప్రదాయ కళ`,
        description: inputDescription || 'స్థానిక వనరులతో సాంప్రదాయ పద్ధతిలో రూపొందించిన నాణ్యమైన కళా వస్తువు.'
      }
    }
  };
}
