export type UserRole = 'artisan' | 'customer' | 'b2b_buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  state: string;
  district: string;
  language: string;
  craftCategory?: string;
  craft_type?: string;
  location?: string;
  avatar?: string;
  passwordHash?: string;
  createdAt: string;
}

export interface Artisan {
  id: string;
  userId: string;
  name: string;
  craftName: string;
  craftCategory: string;
  village: string;
  district: string;
  state: string;
  experienceYears: number;
  bio: string;
  culturalSignificance: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rating: number;
  totalSales: number;
  profileViews: number;
  phone: string;
  email: string;
  bannerUrl?: string;
  avatarUrl?: string;
  awards?: string[];
}

export interface CostBreakdown {
  materialCost: number;
  labourCost: number;
  otherCost: number;
  profitMargin: number;
  hourlyRate: number;
  laborHours: number;
}

export interface Product {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanLocation: string;
  artisanVerified: boolean;
  name: string;
  description: string;
  category: string;
  material: string;
  craftType: string;
  dimensions: string;
  minimumPrice: number;
  recommendedPrice: number;
  premiumPrice: number;
  publishedPrice: number;
  image: string;
  originalImage?: string;
  enhancedImage?: string;
  aiEnhancedImage?: string;
  backgroundStyle?: string;
  keywords: string[];
  tags: string[];
  status: 'active' | 'draft' | 'unlisted';
  views: number;
  rating: number;
  reviewCount: number;
  stock: number;
  createdAt: string;
  costBreakdown?: CostBreakdown;
  pricingExplanation?: string;
  translations?: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  artisanId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'cod';
  status: OrderStatus;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface B2BRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  category: string;
  description: string;
  requiredQuantity: number;
  budget: number;
  deliveryLocation: string;
  requiredDate: string;
  status: 'open' | 'in_progress' | 'fulfilled' | 'closed';
  createdAt: string;
}

export interface B2BProposal {
  id: string;
  requirementId: string;
  artisanId: string;
  artisanName: string;
  craft: string;
  proposedPricePerUnit: number;
  proposedLeadDays: number;
  message: string;
  status: 'submitted' | 'accepted' | 'negotiating' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  role: string;
  title: string;
  message: string;
  type: 'order' | 'verification' | 'b2b' | 'product' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  artisanId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
