import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ChangePasswordModal from '../../components/Super-User/ChangePasswordModal';
import OffboardAdminModal from '../../components/Super-User/OffboardAdminModal';
import ChangeEmailModal from '../../components/Super-User/ChangeEmailModal';

export default function SuperAdminProfileDetailPage({ admin, onBack }) {
  const [activeTab, setActiveTab] = useState('security'); // 'security' or 'overview'
  const [email, setEmail] = useState(admin?.email || 'bilal.sheikh@nexus.com');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isOffboardModalOpen, setIsOffboardModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome - Windows', location: 'Karachi, PK', status: 'active 2 hours ago' },
    { id: 2, device: 'Safari - iPhone', location: 'Karachi, PK', status: 'active 1 day ago' },
    { id: 3, device: 'Chrome - Android', location: 'Karachi, PK', status: 'active 15 days ago' },
  ]);

  const handleRevokeSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleConfirmOffboard = (id, data) => {
    alert(`Admin ${admin?.name} offboarded successfully!\nReason: ${data.reason}\nNotes: ${data.note}`);
    setIsOffboardModalOpen(false);
  };

  const handleSavePassword = (newPass, signOutAll) => {
    alert(`Password updated successfully for ${admin?.name || 'admin'}!\nSign out all devices: ${signOutAll ? 'Yes' : 'No'}`);
    setIsPasswordModalOpen(false);
  };

  const handleSaveEmail = (newEmail) => {
    setEmail(newEmail);
    setIsEmailModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-[#14391a]/80 hover:text-[#14391a] mb-5 transition cursor-pointer self-start"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        <span>Back to Profile Management</span>
      </button>

      {/* Profile Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl sm:text-[44px] font-black text-[#14391a] leading-none mb-1">
            {admin?.name || 'Bilal Sheikh'}
          </h1>
          <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold flex items-center gap-2 mt-2">
            <span>{admin?.posModules?.join(', ') || 'Pharmacy POS'}</span>
            <span className="text-[#14391a]/30">•</span>
            <span>{email}</span>
          </p>
        </div>
        
        {/* Status Pill */}
        <span className="inline-flex px-5 py-2.5 bg-[#cbebc7] border border-[#14391a]/30 rounded-[12px] text-sm font-extrabold text-[#14391a] leading-tight">
          Active
        </span>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#14391a]/15 mb-7">
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3.5 px-3.5 font-bold text-[15px] border-b-3 transition cursor-pointer ${
            activeTab === 'security'
              ? 'border-[#14391a] text-[#14391a]'
              : 'border-transparent text-[#14391a]/60 hover:text-[#14391a]'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3.5 px-3.5 font-bold text-[15px] border-b-3 transition cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#14391a] text-[#14391a]'
              : 'border-transparent text-[#14391a]/60 hover:text-[#14391a]'
          }`}
        >
          Overview
        </button>
      </div>

      {activeTab === 'security' ? (
        <>
          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">
            
            {/* Column 1: Credentials card */}
            <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col justify-between min-h-[300px]">
              <div>
                <h3 className="text-[19px] font-black text-[#14391a] mb-5">Credentials</h3>
                
                {/* Email row */}
                <div className="flex items-center justify-between gap-4 border-b border-[#14391a]/10 pb-4 mb-4">
                  <div>
                    <div className="text-[13px] font-extrabold text-[#14391a]/85 mb-0.5">Email address</div>
                    <div className="text-[13.5px] font-bold text-[#14391a]/65">{email}</div>
                  </div>
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="px-4 py-2.5 bg-[#113819] hover:bg-[#14391a] text-white text-xs font-extrabold rounded-[10px] transition cursor-pointer"
                  >
                    Change email
                  </button>
                </div>

                {/* Password row */}
                <div className="flex items-center justify-between gap-4 border-b border-[#14391a]/10 pb-4 mb-4">
                  <div>
                    <div className="text-[13px] font-extrabold text-[#14391a]/85 mb-0.5">Password</div>
                    <div className="text-[13.5px] font-bold text-[#14391a]/65">Last changed 12 days ago</div>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-4 py-2.5 bg-[#113819] hover:bg-[#14391a] text-white text-xs font-extrabold rounded-[10px] transition cursor-pointer"
                  >
                    Change password
                  </button>
                </div>

                 {/* Two factor auth row */}
                 <div className="flex items-center justify-between gap-4">
                   <div>
                     <div className="text-[13px] font-extrabold text-[#14391a] mb-0.5">Two-factor authentication</div>
                     {twoFactorEnabled ? (
                       <div className="text-[13.5px] font-bold text-[#14391a]/65">Enabled</div>
                     ) : (
                       <div className="text-[13.5px] font-bold text-[#99221b]">Not enabled - recommend requiring this</div>
                     )}
                   </div>
                   {twoFactorEnabled ? (
                     <button
                       type="button"
                       onClick={() => setTwoFactorEnabled(false)}
                       className="px-4 py-2 bg-[#f7d6d3] border border-[#d65f57]/80 hover:bg-[#fadfcb] text-[#99221b] text-xs font-extrabold rounded-[10px] transition cursor-pointer"
                     >
                       Disable
                     </button>
                   ) : (
                     <button
                       type="button"
                       onClick={() => setTwoFactorEnabled(true)}
                       className="px-4 py-2.5 bg-[#cbebc7] border border-[#14391a]/30 hover:bg-[#d6f2d2] text-[#14391a] text-xs font-extrabold rounded-[10px] transition cursor-pointer"
                     >
                       Require 2FA
                     </button>
                   )}
                 </div>
              </div>
            </div>

            {/* Column 2: Active Sessions card */}
            <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 min-h-[300px]">
              <h3 className="text-[19px] font-black text-[#14391a] mb-5">Active Sessions</h3>
              
              <div className="flex flex-col gap-4">
                {sessions.map((sess, idx) => (
                  <div
                    key={sess.id}
                    className={`flex items-center justify-between gap-4 ${
                      idx !== sessions.length - 1 ? 'border-b border-[#14391a]/10 pb-4' : ''
                    }`}
                  >
                    <div>
                      <div className="text-[14.5px] font-extrabold text-[#14391a]">{sess.device}</div>
                      <div className="text-xs text-[#14391a]/65 font-bold mt-0.5">
                        {sess.location} • {sess.status}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-4 py-2 bg-[#f7d6d3] border border-[#d65f57]/80 hover:bg-[#fadfcb] text-[#99221b] text-xs font-extrabold rounded-[10px] transition cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center text-sm font-semibold text-[#14391a]/60 py-8">
                    No active sessions found.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Danger zone panel */}
          <div className="bg-[#f7d6d3]/60 border border-[#d65f57]/35 rounded-[16px] p-6.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="max-w-2xl">
              <h3 className="text-lg font-black text-[#99221b] mb-1.5">Danger zone</h3>
              <p className="text-[13.5px] font-extrabold text-[#14391a] leading-relaxed">
                If this admin has been let go or has resigned, revoke everything at once — portal access, sessions, password, and email — rather than changing settings one by one.
              </p>
            </div>
            <button
              onClick={() => setIsOffboardModalOpen(true)}
              className="px-5 py-3.5 bg-[#99221b] hover:bg-[#b02c24] text-white text-[13.5px] font-extrabold rounded-[12px] shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              Offboard this admin
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Profile Card Info */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5">
            <h3 className="text-2xl font-black text-[#14391a] mb-5 border-b border-[#14391a]/10 pb-3">Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
              <div>
                <div className="text-[14px] font-extrabold text-[#14391a]/65 mb-1">Full Name</div>
                <div className="text-lg font-black text-[#14391a]">{admin?.name || 'Bilal Sheikh'}</div>
              </div>
              
              <div>
                <div className="text-[14px] font-extrabold text-[#14391a]/65 mb-1">POS module</div>
                <div className="text-lg font-black text-[#14391a]">
                  {admin?.posModules?.join(', ') || 'Pharmacy POS'}
                </div>
              </div>

              <div>
                <div className="text-[14px] font-extrabold text-[#14391a]/65 mb-1.5">Status</div>
                <span className="inline-flex px-3.5 py-1.5 bg-[#cbebc7] border border-[#14391a]/30 rounded-[10px] text-[13px] font-extrabold text-[#14391a] leading-tight">
                  Active
                </span>
              </div>

              <div>
                <div className="text-[14px] font-extrabold text-[#14391a]/65 mb-1">Last Login</div>
                <div className="text-lg font-black text-[#14391a]">
                  {admin?.lastLogin || '2026-07-21'}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card Info */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5">
            <h3 className="text-2xl font-black text-[#14391a] mb-5 border-b border-[#14391a]/10 pb-3">Recent Activity</h3>
            
            <ul className="flex flex-col gap-4 text-[14.5px] font-bold text-[#14391a]">
              <li className="flex items-center gap-2">
                <span className="text-[#14391a]/60">2026-07-21 09 : 12</span>
                <span className="text-[#14391a]/40">•</span>
                <span>login from Karachi, PK</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#14391a]/60">2026-07-18 14 : 02</span>
                <span className="text-[#14391a]/40">•</span>
                <span>Profile updated</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#14391a]/60">2026-07-10 08 : 47</span>
                <span className="text-[#14391a]/40">•</span>
                <span>login from Karachi, PK</span>
              </li>
            </ul>
          </div>
        </div>
      )}
      {/* Change Password Dialog Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handleSavePassword}
      />

      {/* Offboard Admin Dialog Modal */}
      <OffboardAdminModal
        isOpen={isOffboardModalOpen}
        admin={admin}
        onClose={() => setIsOffboardModalOpen(false)}
        onConfirm={handleConfirmOffboard}
      />

      {/* Change Email Dialog Modal */}
      <ChangeEmailModal
        isOpen={isEmailModalOpen}
        currentEmail={email}
        onClose={() => setIsEmailModalOpen(false)}
        onSave={handleSaveEmail}
      />
    </div>
  );
}
