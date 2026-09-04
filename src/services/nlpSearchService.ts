import { Product } from '../types';

export interface NLPSearchExtraction {
  originalQuery: string;
  category?: string;
  material?: string;
  maxBudget?: number;
  minRating?: number;
  state?: string;
  intentKeywords: string[];
  explanation: string;
  isNlpMatch: boolean;
}

export function parseSmartSearchQuery(query: string): NLPSearchExtraction {
  const text = (query || '').toLowerCase().trim();
  if (!text) {
    return {
      originalQuery: '',
      intentKeywords: [],
      explanation: '',
      isNlpMatch: false
    };
  }

  let maxBudget: number | undefined = undefined;
  let category: string | undefined = undefined;
  let material: string | undefined = undefined;
  let state: string | undefined = undefined;
  const intentKeywords: string[] = [];

  // 1. Budget extraction: e.g. "under 1000", "under ₹1000", "below 500", "under Rs 1500", "less than 2000"
  const budgetMatch = text.match(/(?:under|below|less\s+than|budget(?:\s+of)?|upto|within)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) ||
                      text.match(/(?:rs\.?|inr|₹)\s*(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    maxBudget = parseInt(budgetMatch[1], 10);
    intentKeywords.push(`Budget ≤ ₹${maxBudget}`);
  }

  // 2. Material extraction
  if (text.includes('eco-friendly') || text.includes('eco friendly') || text.includes('organic') || text.includes('sustainable')) {
    material = 'Eco-Friendly';
    intentKeywords.push('Eco-Friendly');
  } else if (text.includes('bamboo') || text.includes('cane')) {
    material = 'Bamboo & Cane';
    intentKeywords.push('Bamboo / Cane');
  } else if (text.includes('terracotta') || text.includes('clay') || text.includes('earthen')) {
    material = 'Terracotta';
    intentKeywords.push('Terracotta / Clay');
  } else if (text.includes('silk') || text.includes('sari') || text.includes('saree')) {
    material = 'Silk';
    intentKeywords.push('Pure Silk');
  } else if (text.includes('wood') || text.includes('wooden')) {
    material = 'Wood';
    intentKeywords.push('Wood');
  } else if (text.includes('brass') || text.includes('metal') || text.includes('dhokra')) {
    material = 'Metal';
    intentKeywords.push('Brass / Metal');
  } else if (text.includes('pashmina') || text.includes('cashmere') || text.includes('wool')) {
    material = 'Cashmere / Wool';
    intentKeywords.push('Pashmina Cashmere');
  }

  // 3. Category extraction
  if (text.includes('gift') || text.includes('present')) {
    category = 'Gift';
    intentKeywords.push('Gift Item');
  } else if (text.includes('basket') || text.includes('storage')) {
    category = 'Bamboo & Cane';
    intentKeywords.push('Baskets & Storage');
  } else if (text.includes('painting') || text.includes('wall art') || text.includes('art') || text.includes('madhubani') || text.includes('pattachitra')) {
    category = 'Paintings';
    intentKeywords.push('Paintings & Folk Art');
  } else if (text.includes('pot') || text.includes('vase') || text.includes('planter') || text.includes('pottery') || text.includes('ceramic')) {
    category = 'Pottery';
    intentKeywords.push('Pottery & Ceramics');
  } else if (text.includes('toy') || text.includes('doll') || text.includes('kondapalli')) {
    category = 'Woodwork';
    intentKeywords.push('Toys & Woodwork');
  } else if (text.includes('shawl') || text.includes('stole') || text.includes('saree') || text.includes('dupatta') || text.includes('textile')) {
    category = 'Textiles';
    intentKeywords.push('Handloom Textiles');
  } else if (text.includes('jewelry') || text.includes('jewellery') || text.includes('necklace') || text.includes('choker') || text.includes('bag')) {
    category = 'Handmade Jewelry & Textile';
    intentKeywords.push('Jewelry & Accessories');
  }

  // 4. State extraction
  const stateMap: { [key: string]: string } = {
    assam: 'Assam',
    bihar: 'Bihar',
    kashmir: 'Jammu & Kashmir',
    bengal: 'West Bengal',
    rajasthan: 'Rajasthan',
    andhra: 'Andhra Pradesh',
    karnataka: 'Karnataka',
    odisha: 'Odisha',
    tamil: 'Tamil Nadu',
    chhattisgarh: 'Chhattisgarh'
  };

  for (const [key, val] of Object.entries(stateMap)) {
    if (text.includes(key)) {
      state = val;
      intentKeywords.push(val);
      break;
    }
  }

  const isNlpMatch = !!(maxBudget || category || material || state);

  let explanation = '';
  if (isNlpMatch) {
    const parts: string[] = [];
    if (category) parts.push(`Category: "${category}"`);
    if (material) parts.push(`Material: "${material}"`);
    if (maxBudget) parts.push(`Max Price: ₹${maxBudget.toLocaleString('en-IN')}`);
    if (state) parts.push(`Origin: "${state}"`);
    explanation = `AI Smart Search extracted: ${parts.join(' | ')}`;
  }

  return {
    originalQuery: query,
    category,
    material,
    maxBudget,
    state,
    intentKeywords,
    explanation,
    isNlpMatch
  };
}

export function filterProductsByNlp(
  products: Product[],
  nlp: NLPSearchExtraction,
  plainSearchQuery?: string
): Product[] {
  let filtered = [...products];

  // If simple text search
  if (plainSearchQuery && !nlp.isNlpMatch) {
    const q = plainSearchQuery.toLowerCase().trim();
    return filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.craftType.toLowerCase().includes(q) ||
        p.artisanName.toLowerCase().includes(q) ||
        p.artisanLocation.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // 1. Budget filter
  if (nlp.maxBudget !== undefined) {
    filtered = filtered.filter((p) => p.publishedPrice <= nlp.maxBudget!);
  }

  // 2. Material filter
  if (nlp.material) {
    const mat = nlp.material.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.material.toLowerCase().includes(mat) ||
        p.description.toLowerCase().includes(mat) ||
        p.tags.some((t) => t.toLowerCase().includes(mat)) ||
        (mat === 'eco-friendly' && (p.category === 'Bamboo & Cane' || p.category === 'Pottery' || p.tags.includes('Eco-friendly') || p.tags.includes('Eco-Friendly')))
    );
  }

  // 3. Category filter
  if (nlp.category && nlp.category !== 'Gift') {
    filtered = filtered.filter(
      (p) =>
        p.category.toLowerCase().includes(nlp.category!.toLowerCase()) ||
        p.craftType.toLowerCase().includes(nlp.category!.toLowerCase())
    );
  }

  // 4. State filter
  if (nlp.state) {
    filtered = filtered.filter((p) => p.artisanLocation.toLowerCase().includes(nlp.state!.toLowerCase()));
  }

  return filtered;
}
