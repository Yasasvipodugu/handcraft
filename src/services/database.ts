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

class KalaDatabase {
  private listeners: Map<string, Set<EventListener>> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem('kala_initialized_v2')) {
      this.resetToDemoData();
      return;
    }
    // Auto-heal seed users if any are missing
    const users = this.getUsers();
    let updated = false;
    for (const seed of INITIAL_USERS) {
      if (!users.some((u) => u.email.toLowerCase() === seed.email.toLowerCase())) {
        users.push(seed);
        updated = true;
      }
    }
    if (updated) {
      this.setTable('users', users);
    }
  }

  public resetToDemoData() {
    localStorage.setItem('kala_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('kala_artisans', JSON.stringify(INITIAL_ARTISANS));
    localStorage.setItem('kala_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('kala_orders', JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem('kala_b2b_requirements', JSON.stringify(INITIAL_B2B_REQUIREMENTS));
    localStorage.setItem('kala_b2b_proposals', JSON.stringify(INITIAL_B2B_PROPOSALS));
    localStorage.setItem('kala_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem('kala_initialized_v2', 'true');
    this.notify('all', null);
  }

  private getTable<T>(table: string, fallback: T[]): T[] {
    try {
      const data = localStorage.getItem(`kala_${table}`);
      return data ? JSON.parse(data) : fallback;
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
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
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
        avatarUrl: newUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
      };
      artisans.push(newArtisan);
      this.setTable('artisans', artisans);
    }

    return newUser;
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

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates };
    this.setTable('products', products);
    return products[index];
  }

  public deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length !== products.length) {
      this.setTable('products', filtered);
      return true;
    }
    return false;
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
      (a) => a.craftCategory.toLowerCase().includes(newReq.category.toLowerCase()) ||
             newReq.category.toLowerCase().includes(a.craftCategory.toLowerCase())
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
