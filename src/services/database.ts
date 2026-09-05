import {
  User,
  Artisan,
  Product,
  Order,
  B2BRequirement,
  B2BProposal,
  Notification,
  OrderStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ARTISANS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_B2B_REQUIREMENTS,
  INITIAL_B2B_PROPOSALS,
  INITIAL_NOTIFICATIONS
} from '../data/initialSeedData';

type EventListener = (data: any) => void;

export async function hashPasswordClient(password: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + '_kala_salt_2026');
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // fallback
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `sha256_mock_${Math.abs(hash)}`;
}

class KalaDatabase {
  private listeners: Map<string, Set<EventListener>> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!localStorage.getItem('kala_initialized_v2')) {
        this.resetToDemoData();
        return;
      }
      // Auto-heal seed users and strip any stock photos from all user accounts
      const users = this.getUsers();
      let updated = false;
      for (const seed of INITIAL_USERS) {
        if (!users.some((u) => u.email && u.email.toLowerCase() === seed.email.toLowerCase())) {
          users.push(seed);
          updated = true;
        }
      }
      // Purge unwanted default stock avatars from all accounts
      for (const u of users) {
        if (u.avatar && (u.avatar.includes('unsplash.com') || u.avatar.includes('photo-1544005313') || u.avatar.includes('photo-1494790108377'))) {
          u.avatar = '';
          updated = true;
        }
      }
      if (updated) {
        this.setTable('users', users);
      }

      // Purge unwanted stock avatars from created artisans
      const artisans = this.getArtisans();
      let aUpdated = false;
      for (const a of artisans) {
        const isDemoArtisan = a.id === 'artisan-1' || a.id?.startsWith('artisan-demo-');
        if (!isDemoArtisan && a.avatarUrl) {
          a.avatarUrl = '';
          aUpdated = true;
        }
      }
      if (aUpdated) {
        this.setTable('artisans', artisans);
      }

      // Sanitize saved current user in localStorage
      try {
        const savedUser = localStorage.getItem('kala_current_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && typeof parsed === 'object' && parsed.avatar && (parsed.avatar.includes('unsplash.com') || parsed.avatar.includes('photo-1544005313') || parsed.avatar.includes('photo-1494790108377'))) {
            parsed.avatar = '';
            localStorage.setItem('kala_current_user', JSON.stringify(parsed));
          }
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('KalaDatabase init error caught:', err);
    }
  }

  public resetToDemoData() {
    try {
      localStorage.setItem('kala_users', JSON.stringify(INITIAL_USERS));
      localStorage.setItem('kala_artisans', JSON.stringify(INITIAL_ARTISANS));
      localStorage.setItem('kala_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('kala_orders', JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem('kala_b2b_requirements', JSON.stringify(INITIAL_B2B_REQUIREMENTS));
      localStorage.setItem('kala_b2b_proposals', JSON.stringify(INITIAL_B2B_PROPOSALS));
      localStorage.setItem('kala_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem('kala_initialized_v2', 'true');
      this.notify('all', null);
    } catch (e) {
      console.error('Error resetting to demo data:', e);
    }
  }

  private getTable<T>(table: string, fallback: T[]): T[] {
    try {
      const data = localStorage.getItem(`kala_${table}`);
      if (!data) return fallback;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      console.error(`Error reading ${table} from localStorage`, e);
      return fallback;
    }
  }

  private setTable<T>(table: string, data: T[]): void {
    try {
      localStorage.setItem(`kala_${table}`, JSON.stringify(data));
      this.notify(table, data);
    } catch (e) {
      console.error(`Error saving ${table} to localStorage`, e);
    }
  }

  public subscribe(table: string, callback: EventListener): () => void {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, new Set());
    }
    this.listeners.get(table)!.add(callback);
    return () => {
      this.listeners.get(table)?.delete(callback);
    };
  }

  private notify(table: string, data: any) {
    if (this.listeners.has(table)) {
      this.listeners.get(table)!.forEach((cb) => cb(data));
    }
    if (this.listeners.has('all')) {
      this.listeners.get('all')!.forEach((cb) => cb(data));
    }
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.getTable<User>('users', INITIAL_USERS);
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const clean = email.trim().toLowerCase();
    return this.getUsers().find((u) => u.email && u.email.trim().toLowerCase() === clean);
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.setTable('users', users);

    // If artisan, also register artisan entry
    if (newUser.role === 'artisan') {
      const artisans = this.getArtisans();
      const newArtisan: Artisan = {
        id: `artisan-${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        craftName: newUser.craftCategory || 'Traditional Indian Handicrafts',
        craftCategory: newUser.craftCategory || 'Crafts',
        village: 'Artisan Village',
        district: newUser.district,
        state: newUser.state,
        experienceYears: 5,
        bio: `${newUser.name} is a dedicated artisan from ${newUser.state}, specializing in authentic ${newUser.craftCategory || 'folk arts'}.`,
        culturalSignificance: 'Preserving sustainable Indian rural craft heritages.',
        verificationStatus: 'pending',
        rating: 5.0,
        totalSales: 0,
        profileViews: 1,
        phone: newUser.phone,
        email: newUser.email,
        bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
        avatarUrl: newUser.avatar || ''
      };
      artisans.push(newArtisan);
      this.setTable('artisans', artisans);
    }

    return newUser;
  }

  public async registerUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    role: 'artisan' | 'customer' | 'b2b_buyer' | 'admin';
    location: string;
    craftType?: string;
    avatar?: string;
  }): Promise<{ success: boolean; message?: string; user?: User }> {
    const emailClean = userData.email.trim().toLowerCase();
    if (!userData.name.trim()) {
      return { success: false, message: 'Full Name is required.' };
    }
    if (!emailClean || !emailClean.includes('@') || !emailClean.includes('.')) {
      return { success: false, message: 'A valid email address is required.' };
    }
    if (!userData.password || userData.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    const existing = this.getUserByEmail(emailClean);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPasswordClient(userData.password);
    const locationParts = userData.location.split(',').map((s) => s.trim());
    const state = locationParts[locationParts.length - 1] || 'India';
    const district = locationParts[0] || 'Cluster';

    const users = this.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      email: emailClean,
      phone: userData.phone || '',
      role: userData.role,
      state: state,
      district: district,
      location: userData.location,
      language: 'en',
      craftCategory: userData.craftType || undefined,
      craft_type: userData.craftType || undefined,
      avatar: userData.avatar || '',
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.setTable('users', users);

    if (newUser.role === 'artisan') {
      const artisans = this.getArtisans();
      const newArtisan: Artisan = {
        id: `artisan-${newUser.id}`,
        userId: newUser.id,
        name: newUser.name,
        craftName: userData.craftType || 'Traditional Indian Handicrafts',
        craftCategory: userData.craftType || 'Crafts',
        village: district,
        district: district,
        state: state,
        experienceYears: 5,
        bio: `${newUser.name} is a dedicated artisan from ${state}, practicing authentic ${userData.craftType || 'handicrafts'}.`,
        culturalSignificance: 'Empowering generational artisan heritage.',
        verificationStatus: 'verified',
        rating: 5.0,
        totalSales: 0,
        profileViews: 1,
        phone: newUser.phone,
        email: newUser.email,
        bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
        avatarUrl: newUser.avatar
      };
      artisans.unshift(newArtisan);
      this.setTable('artisans', artisans);
    }

    return { success: true, user: newUser };
  }

  public async loginUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; user?: User }> {
    const emailClean = email.trim().toLowerCase();
    if (!emailClean || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }

    const user = this.getUserByEmail(emailClean);
    if (!user) {
      return { success: false, message: 'No account found with this email. Please Sign Up.' };
    }

    const hashed = await hashPasswordClient(password);
    const demoPasswords: Record<string, string> = {
      'artisan@demo.com': 'artisan123',
      'customer@demo.com': 'customer123',
      'buyer@demo.com': 'buyer123',
      'admin@demo.com': 'admin123'
    };

    const isDemoMatch = demoPasswords[emailClean] && demoPasswords[emailClean] === password;
    const isHashMatch = user.passwordHash ? user.passwordHash === hashed : false;

    if (!isDemoMatch && !isHashMatch && user.passwordHash) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    return { success: true, user };
  }

  public syncUserFromBackend(backendUser: any) {
    if (!backendUser || !backendUser.id) return;
    const users = this.getUsers();
    const idx = users.findIndex(
      (u) => u.id === backendUser.id || (Boolean(u.email && backendUser.email) && u.email.toLowerCase() === backendUser.email.toLowerCase())
    );
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...backendUser };
    } else {
      users.push(backendUser);
    }
    this.setTable('users', users);

    if (backendUser.role === 'artisan') {
      const artisans = this.getArtisans();
      const aIdx = artisans.findIndex((a) => a.userId === backendUser.id || a.id === `artisan-${backendUser.id}`);
      if (aIdx === -1) {
        artisans.unshift({
          id: `artisan-${backendUser.id}`,
          userId: backendUser.id,
          name: backendUser.name,
          craftName: backendUser.craft_type || backendUser.craftCategory || 'Handicrafts',
          craftCategory: backendUser.craft_type || 'Crafts',
          village: backendUser.location || 'Cluster',
          district: backendUser.district || backendUser.location || 'District',
          state: backendUser.state || backendUser.location || 'State',
          experienceYears: 5,
          bio: `${backendUser.name} is an authentic artisan.`,
          culturalSignificance: 'Traditional craftsmanship',
          verificationStatus: 'verified',
          rating: 5.0,
          totalSales: 0,
          profileViews: 1,
          phone: backendUser.phone || '',
          email: backendUser.email || '',
          bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
          avatarUrl: backendUser.avatar
        });
        this.setTable('artisans', artisans);
      }
    }
  }

  // --- ARTISANS ---
  public getArtisans(): Artisan[] {
    return this.getTable<Artisan>('artisans', INITIAL_ARTISANS);
  }

  public getArtisanById(id: string): Artisan | undefined {
    return this.getArtisans().find((a) => a.id === id);
  }

  public getArtisanByUserId(userId: string): Artisan | undefined {
    return this.getArtisans().find((a) => a.userId === userId);
  }

  public updateArtisanVerification(artisanId: string, status: 'verified' | 'rejected' | 'pending'): Artisan | null {
    const artisans = this.getArtisans();
    const index = artisans.findIndex((a) => a.id === artisanId);
    if (index === -1) return null;

    artisans[index] = {
      ...artisans[index],
      verificationStatus: status,
      verifiedAt: status === 'verified' ? new Date().toISOString() : undefined
    };
    this.setTable('artisans', artisans);

    // Also update all products associated with this artisan to reflect verified badge
    const products = this.getProducts();
    const updatedProducts = products.map((p) => {
      if (p.artisanId === artisanId) {
        return { ...p, artisanVerified: status === 'verified' };
      }
      return p;
    });
    this.setTable('products', updatedProducts);

    // Dispatch notification to artisan
    this.addNotification({
      userId: artisans[index].userId,
      role: 'artisan',
      title: status === 'verified' ? 'Artisan Profile Verified! ✓' : 'Verification Update',
      message:
        status === 'verified'
          ? `Congratulations! Your artisan profile has been officially verified by KalaConnect Admin.`
          : `Your verification status has been marked as ${status}.`,
      type: 'verification',
      read: false,
      link: `/artisan/store/${artisanId}`
    });

    return artisans[index];
  }

  public updateArtisanProfile(artisanId: string, updates: Partial<Artisan>): Artisan | null {
    const artisans = this.getArtisans();
    const index = artisans.findIndex((a) => a.id === artisanId);
    if (index === -1) return null;
    artisans[index] = { ...artisans[index], ...updates };
    this.setTable('artisans', artisans);
    return artisans[index];
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.getTable<Product>('products', INITIAL_PRODUCTS);
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public getProductsByArtisan(artisanId: string): Product[] {
    return this.getProducts().filter((p) => p.artisanId === artisanId);
  }

  public addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'views' | 'rating' | 'reviewCount'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      views: 0,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    this.setTable('products', products);

    // Send notification
    this.addNotification({
      userId: productData.artisanId,
      role: 'artisan',
      title: 'Product Published Successfully! 🎉',
      message: `"${newProduct.name}" is now live on the marketplace and your storefront.`,
      type: 'product',
      read: false,
      link: `/marketplace/product/${newProduct.id}`
    });

    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>, requestingUserId?: string): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    if (requestingUserId) {
      const prod = products[index];
      const isOwner =
        prod.artisanId === requestingUserId ||
        prod.artisanId === `artisan-${requestingUserId}` ||
        requestingUserId === 'user-admin-1';
      if (!isOwner) return null;
    }

    products[index] = { ...products[index], ...updates };
    this.setTable('products', products);
    return products[index];
  }

  public deleteProduct(id: string, requestingUserId?: string): boolean {
    const products = this.getProducts();
    const target = products.find((p) => p.id === id);
    if (!target) return false;

    if (requestingUserId) {
      const isOwner =
        target.artisanId === requestingUserId ||
        target.artisanId === `artisan-${requestingUserId}` ||
        requestingUserId === 'user-admin-1';
      if (!isOwner) return false;
    }

    const filtered = products.filter((p) => p.id !== id);
    this.setTable('products', filtered);
    return true;
  }

  public incrementProductViews(id: string): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index].views = (products[index].views || 0) + 1;
      this.setTable('products', products);
    }
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return this.getTable<Order>('orders', INITIAL_ORDERS);
  }

  public getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id);
  }

  public getOrdersByCustomer(customerId: string): Order[] {
    return this.getOrders().filter((o) => o.customerId === customerId);
  }

  public getOrdersByArtisan(artisanId: string): Order[] {
    return this.getOrders().filter((o) => o.items.some((item) => item.artisanId === artisanId));
  }

  public createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'trackingNumber' | 'status'>): Order {
    const orders = this.getOrders();
    const now = new Date().toISOString();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `IND-POST-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrder: Order = {
      ...orderData,
      id: `ORD-2024-${randomNum}`,
      trackingNumber: trackingCode,
      status: 'placed',
      createdAt: now,
      updatedAt: now
    };

    orders.unshift(newOrder);
    this.setTable('orders', orders);

    // Notify Customer
    this.addNotification({
      userId: newOrder.customerId,
      role: 'customer',
      title: 'Order Placed Successfully! 🛍️',
      message: `Order #${newOrder.id} has been placed. Tracking: ${trackingCode}.`,
      type: 'order',
      read: false,
      link: '/customer/orders'
    });

    // Notify Artisans who made the items
    const distinctArtisans = [...new Set(newOrder.items.map((i) => i.artisanId))];
    distinctArtisans.forEach((artisanId) => {
      const artisan = this.getArtisanById(artisanId);
      if (artisan) {
        this.addNotification({
          userId: artisan.userId,
          role: 'artisan',
          title: 'New Order Received! 🎁',
          message: `Order #${newOrder.id} contains items from your craft workshop (₹${newOrder.total}).`,
          type: 'order',
          read: false,
          link: '/artisan/orders'
        });
      }
    });

    return newOrder;
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    orders[index] = {
      ...orders[index],
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    this.setTable('orders', orders);

    // Dispatch update notification to Customer
    this.addNotification({
      userId: orders[index].customerId,
      role: 'customer',
      title: `Order Status: ${newStatus.toUpperCase()} 📦`,
      message: `Your order #${orderId} is now ${newStatus}. Tracking: ${orders[index].trackingNumber}`,
      type: 'order',
      read: false,
      link: '/customer/orders'
    });

    return orders[index];
  }

  // --- B2B REQUIREMENTS ---
  public getB2BRequirements(): B2BRequirement[] {
    return this.getTable<B2BRequirement>('b2b_requirements', INITIAL_B2B_REQUIREMENTS);
  }

  public createB2BRequirement(reqData: Omit<B2BRequirement, 'id' | 'createdAt' | 'status'>): B2BRequirement {
    const requirements = this.getB2BRequirements();
    const newReq: B2BRequirement = {
      ...reqData,
      id: `b2b-req-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    requirements.unshift(newReq);
    this.setTable('b2b_requirements', requirements);

    // Dispatch notifications to matched artisans
    const artisans = this.getArtisans().filter(
      (a) => (a.craftCategory || '').toLowerCase().includes((newReq.category || '').toLowerCase()) ||
             (newReq.category || '').toLowerCase().includes((a.craftCategory || '').toLowerCase())
    );
    artisans.forEach((artisan) => {
      this.addNotification({
        userId: artisan.userId,
        role: 'artisan',
        title: 'New B2B Bulk Requirement Match! 🤝',
        message: `${newReq.buyerCompany} is seeking ${newReq.requiredQuantity} units of ${newReq.category}.`,
        type: 'b2b',
        read: false,
        link: '/artisan/b2b'
      });
    });

    return newReq;
  }

  // --- B2B PROPOSALS ---
  public getB2BProposals(): B2BProposal[] {
    return this.getTable<B2BProposal>('b2b_proposals', INITIAL_B2B_PROPOSALS);
  }

  public getProposalsForRequirement(reqId: string): B2BProposal[] {
    return this.getB2BProposals().filter((p) => p.requirementId === reqId);
  }

  public createB2BProposal(proposalData: Omit<B2BProposal, 'id' | 'createdAt' | 'status'>): B2BProposal {
    const proposals = this.getB2BProposals();
    const newProposal: B2BProposal = {
      ...proposalData,
      id: `prop-${Date.now()}`,
      status: 'submitted',
      createdAt: new Date().toISOString()
    };
    proposals.unshift(newProposal);
    this.setTable('b2b_proposals', proposals);

    // Notify buyer
    const req = this.getB2BRequirements().find((r) => r.id === proposalData.requirementId);
    if (req) {
      this.addNotification({
        userId: req.buyerId,
        role: 'b2b_buyer',
        title: 'New Proposal Received! 💼',
        message: `${proposalData.artisanName} submitted a quote of ₹${proposalData.proposedPricePerUnit}/unit for your requirement.`,
        type: 'b2b',
        read: false,
        link: '/b2b'
      });
    }

    return newProposal;
  }

  public updateProposalStatus(proposalId: string, status: 'accepted' | 'negotiating' | 'rejected'): B2BProposal | null {
    const proposals = this.getB2BProposals();
    const index = proposals.findIndex((p) => p.id === proposalId);
    if (index === -1) return null;
    proposals[index].status = status;
    this.setTable('b2b_proposals', proposals);
    return proposals[index];
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId?: string, role?: string): Notification[] {
    const all = this.getTable<Notification>('notifications', INITIAL_NOTIFICATIONS);
    if (!userId && !role) return all;
    return all.filter((n) => (!userId || n.userId === userId) || (!role || n.role === role));
  }

  public addNotification(notif: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const notifs = this.getTable<Notification>('notifications', INITIAL_NOTIFICATIONS);
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    this.setTable('notifications', notifs);
    return newNotif;
  }

  public markNotificationRead(id: string): void {
    const notifs = this.getTable<Notification>('notifications', INITIAL_NOTIFICATIONS);
    const index = notifs.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifs[index].read = true;
      this.setTable('notifications', notifs);
    }
  }

  public markAllNotificationsRead(userId?: string): void {
    const notifs = this.getTable<Notification>('notifications', INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => {
      if (!userId || n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    this.setTable('notifications', updated);
  }
}

export const db = new KalaDatabase();
