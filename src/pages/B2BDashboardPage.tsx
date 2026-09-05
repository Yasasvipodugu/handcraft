import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/database';
import { B2BRequirement, B2BProposal, Artisan, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Briefcase,
  PlusCircle,
  Sparkles,
  CheckCircle,
  Building,
  MapPin,
  Calendar,
  Send,
  Star,
  Users,
  MessageSquare,
  Layers,
  Package,
  FileText,
  User,
  LogOut,
  ArrowRight,
  Clock,
  Search,
  Filter,
  ShoppingBag
} from 'lucide-react';

export const B2BDashboardPage: React.FC = () => {
  const { currentUser, switchRole, logout } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Ensure role is b2b_buyer
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'b2b_buyer') {
      switchRole('b2b_buyer');
    }
  }, [currentUser?.role]);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'find-artisans' | 'my-requirements' | 'proposals' | 'orders' | 'messages' | 'profile'
  >('dashboard');

  const [requirements, setRequirements] = useState<B2BRequirement[]>(() => db.getB2BRequirements());
  const [proposals, setProposals] = useState<B2BProposal[]>(() => db.getB2BProposals());
  const [artisans, setArtisans] = useState<Artisan[]>(() => db.getArtisans());
  const [orders, setOrders] = useState<Order[]>(() => db.getOrders());
  const [selectedReq, setSelectedReq] = useState<B2BRequirement | null>(requirements[0] || null);

  // Post Requirement Form State
  const [category, setCategory] = useState<string>('Bamboo & Cane');
  const [description, setDescription] = useState<string>(
    'Need 500 handcrafted natural bamboo baskets with lids for corporate gift hampers.'
  );
  const [requiredQuantity, setRequiredQuantity] = useState<number>(500);
  const [budget, setBudget] = useState<number>(350000);
  const [deliveryLocation, setDeliveryLocation] = useState<string>('New Delhi Corporate Hub');
  const [requiredDate, setRequiredDate] = useState<string>('2024-09-15');
  const [showPostModal, setShowPostModal] = useState<boolean>(false);

  const loadData = () => {
    const reqs = db.getB2BRequirements();
    setRequirements(reqs);
    setProposals(db.getB2BProposals());
    setArtisans(db.getArtisans());
    setOrders(db.getOrders());
    if (!selectedReq && reqs.length > 0) {
      setSelectedReq(reqs[0]);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('all', loadData);
    return unsub;
  }, []);

  const handlePostRequirement = (e: React.FormEvent) => {
    e.preventDefault();

    const newReq = db.createB2BRequirement({
      buyerId: currentUser?.id || 'user-b2b-1',
      buyerName: currentUser?.name || 'Rajesh Mehta',
      buyerCompany: currentUser?.company || 'FabIndia Corporate Sourcing',
      category,
      description,
      requiredQuantity: Number(requiredQuantity),
      budget: Number(budget),
      deliveryLocation,
      requiredDate
    });

    showToast('B2B Requirement Posted! 🤝', `Requirement for ${requiredQuantity} units of ${category} is now live.`, 'success');
    setShowPostModal(false);
    loadData();
    setSelectedReq(newReq);
  };

  // AI ARTISAN MATCHING ALGORITHM
  // Recommends artisans whose craft, category, or products match the requirement description
  const matchedArtisans = React.useMemo(() => {
    if (!selectedReq) return [];
    const text = (selectedReq.description + ' ' + selectedReq.category).toLowerCase();

    return artisans
      .map((artisan) => {
        let score = 55;
        const craftText = (artisan.craftName + ' ' + artisan.craftCategory).toLowerCase();

        if (
          craftText.includes(selectedReq.category.toLowerCase()) ||
          selectedReq.category.toLowerCase().includes(craftText)
        ) {
          score += 30;
        }
        if (text.includes('bamboo') && craftText.includes('bamboo')) score += 30;
        if (text.includes('pot') && craftText.includes('pottery')) score += 30;
        if (text.includes('pashmina') && craftText.includes('pashmina')) score += 30;
        if (text.includes('toy') && craftText.includes('wood')) score += 30;
        if (text.includes('painting') && craftText.includes('paint')) score += 30;
        if (artisan.verificationStatus === 'verified') score += 15;

        score = Math.min(99, score);
        return { artisan, matchScore: score };
      })
      .filter((item) => item.matchScore >= 65)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [selectedReq, artisans]);

  const handleSendInquiry = (artisan: Artisan) => {
    if (!selectedReq) return;
    db.addNotification({
      userId: artisan.userId,
      role: 'artisan',
      title: 'Direct B2B Bulk Inquiry! 🏢',
      message: `${selectedReq.buyerCompany} sent an inquiry for ${selectedReq.requiredQuantity} units of ${selectedReq.category}.`,
      type: 'b2b',
      read: false,
      link: '/artisan/b2b'
    });
    showToast(
      'Inquiry Sent! 🚀',
      `Inquiry dispatched to master artisan ${artisan.name}.`,
      'success'
    );
  };

  const currentProposals = selectedReq
    ? proposals.filter((p) => p.requirementId === selectedReq.id)
    : proposals;

  const connectedArtisansCount = new Set(proposals.map((p) => p.artisanId)).size || 4;
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered').length;

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* ===================================================================
            SIDEBAR (Section 45)
           =================================================================== */}
        <aside className="lg:col-span-1 bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser?.name}
                className="w-11 h-11 rounded-full object-cover border border-purple-300"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-700 to-stone-900 text-white flex items-center justify-center font-bold text-base border border-purple-300 shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-stone-900 truncate">
                {currentUser?.name || 'Rajesh Mehta'}
              </h3>
              <span className="text-[10px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full truncate block mt-0.5">
                {currentUser?.company || 'Corporate Sourcing'}
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold text-stone-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'find-artisans', label: 'Find Artisans', icon: Users },
              { id: 'post-req', label: 'Post Requirement', icon: PlusCircle, action: () => setShowPostModal(true) },
              { id: 'my-requirements', label: `My Requirements (${requirements.length})`, icon: Briefcase },
              { id: 'proposals', label: `Proposals (${proposals.length})`, icon: FileText },
              { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'profile', label: 'Profile', icon: User },
              {
                id: 'logout',
                label: 'Logout',
                icon: LogOut,
                action: () => {
                  logout();
                  navigate('/login');
                }
              }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveTab(item.id as any);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-800 text-white font-bold shadow-sm'
                      : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-amber-950 font-bold text-[11px] uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>AI Cluster Sourcing</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Match your procurement quotas directly with verified artisan cooperatives.
            </p>
          </div>
        </aside>

        {/* ===================================================================
            MAIN DASHBOARD CONTENT
           =================================================================== */}
        <main className="lg:col-span-4 space-y-8">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-900/60 px-3 py-1 rounded-full border border-amber-700 inline-block">
                Enterprise Bulk Sourcing
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {currentUser?.name || 'Rajesh Mehta'}!
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                Manage your institutional procurement requirements, review transparent artisan quotes, and empower traditional artisan clusters.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPostModal(true)}
                className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>POST NEW REQUIREMENT</span>
              </button>
            </div>
          </div>

          {/* 4 STATISTICS CARDS (Section 45) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Active Requirements</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">{requirements.length}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Active wholesale postings</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Total Proposals</span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">{proposals.length}</p>
              <p className="text-[11px] text-purple-600 font-semibold">Quotes received from artisans</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Connected Artisans</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">{connectedArtisansCount}</p>
              <p className="text-[11px] text-blue-600 font-semibold">In active collaboration</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Active Orders</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">{activeOrdersCount}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Production & transit</p>
            </div>
          </div>

          {/* 4 QUICK ACTIONS (Section 45) */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setShowPostModal(true)}
                className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-left transition-colors flex flex-col justify-between"
              >
                <PlusCircle className="w-5 h-5 text-amber-700 mb-2" />
                <span className="text-xs font-bold text-stone-900 block">Post Requirement</span>
                <span className="text-[10px] text-stone-500">Create a new bulk inquiry</span>
              </button>

              <button
                onClick={() => setActiveTab('find-artisans')}
                className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-left transition-colors flex flex-col justify-between"
              >
                <Users className="w-5 h-5 text-purple-700 mb-2" />
                <span className="text-xs font-bold text-stone-900 block">Artisan Directory</span>
                <span className="text-[10px] text-stone-500">Browse verified artisans</span>
              </button>

              <button
                onClick={() => setActiveTab('proposals')}
                className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-left transition-colors flex flex-col justify-between"
              >
                <FileText className="w-5 h-5 text-blue-700 mb-2" />
                <span className="text-xs font-bold text-stone-900 block">View Proposals</span>
                <span className="text-[10px] text-stone-500">{proposals.length} quotes available</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-left transition-colors flex flex-col justify-between"
              >
                <Package className="w-5 h-5 text-emerald-700 mb-2" />
                <span className="text-xs font-bold text-stone-900 block">Track Orders</span>
                <span className="text-[10px] text-stone-500">Real-time status updates</span>
              </button>
            </div>
          </div>

          {/* TAB: DASHBOARD / DEFAULT OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Requirements Registry */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-700" />
                    <span>Active Bulk Requirements</span>
                  </h3>
                  <span className="text-xs text-stone-500 font-bold">{requirements.length} Open</span>
                </div>

                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedReq(req)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        selectedReq?.id === req.id
                          ? 'border-amber-600 bg-white shadow-md'
                          : 'border-stone-200 bg-white/70 hover:bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-amber-800 uppercase tracking-wide text-[10px] bg-amber-50 px-2 py-0.5 rounded">
                          {req.category}
                        </span>
                        <span className="text-emerald-700 font-bold text-xs">
                          ₹{req.budget.toLocaleString('en-IN')} Budget
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-stone-900 mt-1 line-clamp-2">
                        {req.description}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
                        <span>Qty: <strong>{req.requiredQuantity} units</strong></span>
                        <span className="text-right truncate">{req.buyerCompany}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: AI Artisan Matching & Proposals */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* AI ARTISAN MATCHING SECTION */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-stone-900">
                          AI-MATCHED ARTISANS
                        </h3>
                        <p className="text-xs text-stone-500">
                          Recommending artisans matching category: "{selectedReq?.category || 'All Crafts'}"
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                      {matchedArtisans.length} Matches Found
                    </span>
                  </div>

                  {/* Matched Artisans Cards */}
                  <div className="space-y-3">
                    {matchedArtisans.map(({ artisan, matchScore }) => (
                      <div
                        key={artisan.id}
                        className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={artisan.avatarUrl}
                            alt={artisan.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-stone-200 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-stone-900">{artisan.name}</h4>
                              {artisan.verificationStatus === 'verified' && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                  <CheckCircle className="w-2.5 h-2.5 fill-emerald-600 text-white" />
                                  <span>✓ Verified</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-amber-800 mt-0.5">{artisan.craftName}</p>
                            <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              <span>{artisan.village}, {artisan.state} • {artisan.experienceYears} yrs exp</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-200">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-purple-700 font-extrabold uppercase block">
                              {matchScore}% Match
                            </span>
                            <span className="text-[11px] text-amber-600 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {artisan.rating} Rating
                            </span>
                          </div>

                          <button
                            onClick={() => handleSendInquiry(artisan)}
                            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>SEND INQUIRY</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RECEIVED PROPOSALS SECTION */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h3 className="font-extrabold text-base text-stone-900">
                      Received Quotes & Proposals ({currentProposals.length})
                    </h3>
                    <span className="text-xs text-stone-500">Requirement #{selectedReq?.id}</span>
                  </div>

                  {currentProposals.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-xs">
                      No quotes received for this requirement yet. Artisans are reviewing your request.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentProposals.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-stone-900">{prop.artisanName}</h4>
                              <p className="text-xs text-amber-800 font-semibold">{prop.craft}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-extrabold text-stone-900">
                                ₹{prop.proposedPricePerUnit} / unit
                              </span>
                              <span className="text-[11px] text-stone-500 block">
                                Est. Delivery: {prop.proposedLeadDays} days
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200 leading-relaxed">
                            "{prop.message}"
                          </p>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => {
                                db.updateProposalStatus(prop.id, 'accepted');
                                showToast('Proposal Accepted! 🤝', `Accepted proposal from ${prop.artisanName}.`, 'success');
                                loadData();
                              }}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                            >
                              Accept Proposal
                            </button>
                            <button
                              onClick={() => {
                                showToast('Negotiation Opened', `Requested revision from ${prop.artisanName}.`, 'info');
                              }}
                              className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
                            >
                              Negotiate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB: FIND ARTISANS */}
          {activeTab === 'find-artisans' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Verified Artisan Directory</h3>
                  <p className="text-xs text-stone-500">Discover and partner with authentic master craftspersons across India</p>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                  {artisans.length} Artisans Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artisans.map((artisan) => (
                  <div key={artisan.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 flex items-start gap-4">
                    <img
                      src={artisan.avatarUrl}
                      alt={artisan.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-stone-300 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-stone-900 truncate">{artisan.name}</h4>
                        {artisan.verificationStatus === 'verified' && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle className="w-2.5 h-2.5 fill-emerald-600 text-white" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-amber-800">{artisan.craftName}</p>
                      <p className="text-[11px] text-stone-500">{artisan.village}, {artisan.state} • {artisan.experienceYears} yrs experience</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" /> {artisan.rating} ({artisan.totalSales} sales)
                        </span>
                        <Link
                          to={`/artisan/store/${artisan.id}`}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                        >
                          <span>View Store</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MY REQUIREMENTS */}
          {activeTab === 'my-requirements' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">My Bulk Requirements</h3>
                  <p className="text-xs text-stone-500">Track and manage your institutional procurement orders</p>
                </div>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Requirement</span>
                </button>
              </div>

              <div className="space-y-4">
                {requirements.map((req) => (
                  <div key={req.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {req.category}
                        </span>
                        <h4 className="font-bold text-base text-stone-900 mt-1">{req.description}</h4>
                      </div>
                      <span className="text-base font-extrabold text-emerald-700">
                        ₹{req.budget.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-600 pt-2 border-t border-stone-200">
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase">Quantity</span>
                        <span className="font-bold text-stone-900">{req.requiredQuantity} units</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase">Delivery To</span>
                        <span className="font-bold text-stone-900">{req.deliveryLocation}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase">Required By</span>
                        <span className="font-bold text-stone-900">{req.requiredDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase">Status</span>
                        <span className="font-bold text-emerald-700">Active Listing</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PROPOSALS */}
          {activeTab === 'proposals' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">All Received Quotes & Proposals</h3>
                  <p className="text-xs text-stone-500">Review artisan pricing, terms, and lead times</p>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                  {proposals.length} Total Proposals
                </span>
              </div>

              <div className="space-y-4">
                {proposals.map((prop) => (
                  <div key={prop.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900">{prop.artisanName}</h4>
                        <p className="text-xs text-amber-800 font-semibold">{prop.craft}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-stone-900">
                          ₹{prop.proposedPricePerUnit} / unit
                        </span>
                        <span className="text-[11px] text-stone-500 block">Lead time: {prop.proposedLeadDays} days</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200">
                      "{prop.message}"
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-stone-500">
                        Status: <strong className="uppercase text-amber-800">{prop.status}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            db.updateProposalStatus(prop.id, 'accepted');
                            showToast('Proposal Accepted! 🤝', `Accepted proposal from ${prop.artisanName}.`, 'success');
                            loadData();
                          }}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => showToast('Negotiation Started', 'Direct message thread opened with artisan.', 'info')}
                          className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
                        >
                          Negotiate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Corporate & Bulk Orders</h3>
                  <p className="text-xs text-stone-500">Track shipment milestones, invoices, and delivery dates</p>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                  {orders.length} Total Orders
                </span>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-800">Order #{order.id}</span>
                        <h4 className="font-bold text-sm text-stone-900 mt-0.5">
                          {order.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                        </h4>
                        <p className="text-[11px] text-stone-500">{order.createdAt} • Delivered to {order.shippingAddress.city}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-stone-900">₹{order.total.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] font-bold text-emerald-700 block uppercase">{order.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <h3 className="font-extrabold text-lg text-stone-900">Direct Artisan Communications</h3>
              <div className="p-8 text-center text-stone-400 text-xs space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-stone-300" />
                <p>Select any artisan from the directory or inquiry list to start a direct message.</p>
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <h3 className="font-extrabold text-lg text-stone-900">Corporate Buyer Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Company Name</span>
                  <span className="text-stone-900 font-bold text-sm">{currentUser?.company || 'FabIndia Corporate Sourcing'}</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Authorized Officer</span>
                  <span className="text-stone-900 font-bold text-sm">{currentUser?.name || 'Rajesh Mehta'}</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Email Address</span>
                  <span className="text-stone-900 font-bold text-sm">{currentUser?.email || 'buyer@demo.com'}</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Procurement Focus</span>
                  <span className="text-stone-900 font-bold text-sm">Handloom, Terracotta, Bamboo Eco-Packaging</span>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* POST REQUIREMENT MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-stone-900">Post Bulk Requirement</h3>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handlePostRequirement} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Product Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700 bg-white"
                >
                  <option value="Bamboo & Cane">Bamboo & Cane</option>
                  <option value="Pottery">Pottery & Terracotta</option>
                  <option value="Textiles">Textiles & Handloom</option>
                  <option value="Woodwork">Woodwork & Educational Toys</option>
                  <option value="Paintings">Paintings & Folk Art</option>
                  <option value="Metalcraft">Metalcraft & Brass</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Product Description:</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs leading-relaxed focus:outline-none focus:border-amber-700"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Required Quantity:</label>
                  <input
                    type="number"
                    required
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Total Target Budget (₹):</label>
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Delivery Location:</label>
                  <input
                    type="text"
                    required
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Required By Date:</label>
                  <input
                    type="date"
                    required
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm"
                >
                  POST REQUIREMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BDashboardPage;
