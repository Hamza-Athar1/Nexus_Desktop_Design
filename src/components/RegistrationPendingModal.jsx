import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle, Building2 } from 'lucide-react';

/**
 * Dedicated Modal Overlay for newly submitted business registrations.
 * Displays:
 * 1. Success header & pending review notice
 * 2. Payment Proof status (not_submitted, submitted, verified, rejected)
 * 3. Super Admin / Support Contact details
 * 4. Action button to continue to login
 */
export default function RegistrationPendingModal({ isOpen, onClose, registrationData }) {
  if (!isOpen) return null;

  const proofStatus = registrationData?.paymentProofStatus || 'not_submitted';
  const businessName = registrationData?.businessName || registrationData?.name || 'Your Business';

  // Bank & Contact Info sourced from application configuration
  const superAdminContact = {
    bankName: 'Meezan Bank Ltd.',
    accountTitle: 'Nexus POS Solutions',
    iban: 'PK36MEZN0099340102938101',
    mobilePayment: '0300-1234567 (JazzCash / EasyPaisa)',
    supportEmail: 'support@nexuspos.com',
    supportPhone: '+92 300 1234567',
  };

  const renderProofSection = () => {
    switch (proofStatus) {
      case 'submitted':
        return (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                Payment Proof: Submitted
              </h4>
              <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                Your payment proof has been uploaded successfully and is currently awaiting Super Admin review and verification.
              </p>
            </div>
          </div>
        );

      case 'verified':
        return (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-green-900 uppercase tracking-wider">
                Payment Proof: Verified
              </h4>
              <p className="text-xs font-semibold text-green-800 mt-0.5">
                Your payment proof has been verified by the Super Admin.
              </p>
            </div>
          </div>
        );

      case 'rejected':
        return (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-red-900 uppercase tracking-wider">
                Payment Proof: Rejected
              </h4>
              <p className="text-xs font-semibold text-red-800 mt-0.5">
                Your submitted payment proof was rejected. Please contact the Super Admin using the details below to rectify your payment receipt.
              </p>
            </div>
          </div>
        );

      case 'not_submitted':
      default:
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                Payment Proof: Not Submitted
              </h4>
              <p className="text-xs font-semibold text-amber-800 mt-0.5">
                Please transfer your payment using the Super Admin details below and send the payment proof to support for account activation.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-[#efeacb] border border-[#14391a]/20 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl flex flex-col text-[#14391a] z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-3 mb-5">
          <div className="w-16 h-16 rounded-full bg-[#14391a] text-[#efeacb] flex items-center justify-center shadow-md">
            <Clock size={32} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14391a]">
              Registration Submitted
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[#55694a] mt-1 flex items-center justify-center gap-1.5">
              <Building2 size={16} />
              <span>{businessName}</span>
            </p>
          </div>
        </div>

        {/* Notice Message */}
        <div className="bg-white/60 border border-[#14391a]/10 rounded-2xl p-4 text-center mb-5">
          <p className="text-xs sm:text-sm font-bold text-[#14391a] leading-relaxed">
            Your registration has been submitted successfully!
          </p>
          <p className="text-xs font-semibold text-[#55694a] mt-1">
            Your account is currently <strong className="text-[#14391a]">pending Super Admin review & approval</strong>. You will be able to log in once your registration has been reviewed.
          </p>
        </div>

        {/* Payment Proof Status Card */}
        <div className="mb-5">
          {renderProofSection()}
        </div>

        {/* Super Admin Contact Details */}
        <div className="bg-white/80 border border-[#14391a]/15 rounded-2xl p-4 space-y-2 mb-6">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#14391a] border-b border-[#14391a]/10 pb-1.5">
            Super Admin Contact & Payment Info
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-[#14391a]">
            <div>
              <span className="text-gray-500 font-semibold block text-[10px] uppercase">Bank Name</span>
              <strong className="font-bold">{superAdminContact.bankName}</strong>
            </div>
            <div>
              <span className="text-gray-500 font-semibold block text-[10px] uppercase">Account Title</span>
              <strong className="font-bold">{superAdminContact.accountTitle}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500 font-semibold block text-[10px] uppercase">IBAN</span>
              <strong className="font-mono text-xs font-bold">{superAdminContact.iban}</strong>
            </div>
            <div>
              <span className="text-gray-500 font-semibold block text-[10px] uppercase">JazzCash / EasyPaisa</span>
              <strong className="font-mono font-bold">{superAdminContact.mobilePayment}</strong>
            </div>
            <div>
              <span className="text-gray-500 font-semibold block text-[10px] uppercase">Support Email</span>
              <strong className="font-bold">{superAdminContact.supportEmail}</strong>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md active:scale-[0.99] transition-all cursor-pointer text-center uppercase tracking-wider"
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
}
