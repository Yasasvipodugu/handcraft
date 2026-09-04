import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { B2BRequirement, B2BProposal } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Briefcase,
  Send,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  X,
  CheckCircle,
  Clock
} from 'lucide-react';

export const ArtisanB2BPage: React.FC = () => {
  const { currentArtisan } = useAuth();
  const { showToast } = useNotifications();

  const [requirements, setRequirements] = useState<B2BRequirement[]>(() => db.getB2BRequirements());
  const [selectedReqForProposal, setSelectedReqForProposal] = useState<B2BRequirement | null>(null);

  // Proposal Form State
  const [proposedPrice, setProposedPrice] = useState<number>(650);
  const [leadDays, setLeadDays] = useState<number>(30);
  const [proposalMessage, setProposalMessage] = useState<string>(
    'Our artisan cluster can fulfill this custom order with certified natural materials and hand-finished packaging.'
  );

  const loadRequirements = () => {
    setRequirements(db.getB2BRequirements());
  };

  useEffect(() => {
    loadRequirements();
    const unsub = db.subscribe('b2b_requirements', loadRequirements);
    return unsub;
  }, []);

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForProposal || !currentArtisan) return;

    db.createB2BProposal({
      requirementId: selectedReqForProposal.id,
      artisanId: currentArtisan.id,
      artisanName: currentArtisan.name,
      craft: currentArtisan.craftName,
      proposedPricePerUnit: Number(proposedPrice),
      proposedLeadDays: Number(leadDays),
      message: proposalMessage
    });

    showToast(
      'Proposal Submitted! 💼',
      `Quote of ₹${proposedPrice}/unit sent to ${selectedReqForProposal.buyerCompany}.`,
      'success'
    );

    setSelectedReqForProposal(null);
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="pb-4 border-b border-stone-200">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
            Artisan Market Linkage
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            B2B Bulk Requirements
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Connect directly with verified corporate buyers, luxury hotels, and retail chains. Send competitive wholesale proposals without middlemen.
          </p>
        </div>

        {/* Requirements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                    {req.category}
                  </span>
                  <span className="text-sm font-extrabold text-stone-900">
                    ₹{req.budget.toLocaleString('en-IN')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-stone-900 leading-snug">
                  {req.description}
                </h3>

                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 grid grid-cols-2 gap-2 text-xs text-stone-600">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">Required Qty:</span>
                    <strong className="text-stone-900">{req.requiredQuantity} units</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">Buyer:</span>
                    <span className="font-semibold text-stone-800 truncate block">{req.buyerCompany}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">Delivery Hub:</span>
                    <span className="truncate block">{req.deliveryLocation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">Required By:</span>
                    <span>{req.requiredDate}</span>
                  </div>
                </div>
              </div>

              {/* REQUIRED BUTTON: SEND PROPOSAL */}
              <button
                onClick={() => {
                  setSelectedReqForProposal(req);
                  setProposedPrice(Math.round(req.budget / req.requiredQuantity));
                }}
                className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SEND PROPOSAL</span>
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* SEND PROPOSAL MODAL */}
      {selectedReqForProposal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-stone-900">
                  Submit Wholesale Proposal
                </h3>
              </div>
              <button onClick={() => setSelectedReqForProposal(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs">
              <p className="font-bold text-amber-900">Target: {selectedReqForProposal.requiredQuantity} units of {selectedReqForProposal.category}</p>
              <p className="text-stone-600 text-[11px] mt-0.5">{selectedReqForProposal.buyerCompany}</p>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">
                    Proposed Price Per Unit (₹):
                  </label>
                  <input
                    type="number"
                    required
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-bold focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">
                    Lead Time (Days):
                  </label>
                  <input
                    type="number"
                    required
                    value={leadDays}
                    onChange={(e) => setLeadDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-bold focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">
                  Customization Message & Artisan Cluster Capacity:
                </label>
                <textarea
                  rows={4}
                  required
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  placeholder="Detail your production capacity, materials, quality guarantees, and sample provision..."
                  className="w-full rounded-xl border border-stone-300 p-3 text-xs leading-relaxed focus:outline-none focus:border-amber-700"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedReqForProposal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
