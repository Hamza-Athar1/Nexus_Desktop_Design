import React, { useState } from 'react';
import { User, Shield, Monitor, Check, LogOut, Trash2 } from 'lucide-react';

export default function SuperAdminProfilePage() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'actions'
  
  // Profile Info States
  const [fullName, setFullName] = useState('Aiesha Asad');
  const [email, setEmail] = useState('aiesha.asad@nexus.com');
  const [phone, setPhone] = useState('0300-1234567');
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Security Settings States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [prefSecurityAlerts, setPrefSecurityAlerts] = useState(true);
  const [prefNewLogins, setPrefNewLogins] = useState(true);
  const [prefBillingUpdates, setPrefBillingUpdates] = useState(true);
  const [prefSystemAnnouncements, setPrefSystemAnnouncements] = useState(true);

  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome - Windows', location: 'Karachi, PK', status: 'active 2 hours ago' },
    { id: 2, device: 'Safari - iPhone', location: 'Karachi, PK', status: 'active 1 day ago' },
    { id: 3, device: 'Chrome - Android', location: 'Karachi, PK', status: 'active 15 days ago' },
  ]);

  // Account Actions log/states
  const [logs, setLogs] = useState([
    { id: 1, action: 'Password changed', date: '2026-07-15 14:22' },
    { id: 2, action: 'Email changed from ayesha.farooq@nexus.com', date: '2026-07-10 09:15' },
    { id: 3, action: '2FA Activated', date: '2026-06-01 18:30' },
  ]);

  // Password Requirements Validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumberOrSpecial = /[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword);

  const handleSaveChanges = (e) => {
    e.preventDefault();
    alert('Profile details updated successfully!');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!hasMinLength || !hasUppercase || !hasNumberOrSpecial) {
      alert('Password does not meet the security requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    alert('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRevokeSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header Profile Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl sm:text-[44px] font-black text-[#14391a] leading-none mb-1">
            {fullName}
          </h1>
          <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold flex items-center gap-2 mt-2">
            <span>Super Admin</span>
            <span className="text-[#14391a]/30">•</span>
            <span>{email}</span>
          </p>
        </div>
        
        {/* Status Badge */}
        <span className="inline-flex px-5 py-2.5 bg-[#cbebc7] border border-[#14391a]/30 rounded-[12px] text-sm font-extrabold text-[#14391a] leading-tight">
          Active
        </span>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#14391a]/15 mb-7">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3.5 px-3.5 font-bold text-[15px] border-b-3 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-[#14391a] text-[#14391a]'
              : 'border-transparent text-[#14391a]/60 hover:text-[#14391a]'
          }`}
        >
          <User size={18} />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3.5 px-3.5 font-bold text-[15px] border-b-3 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-[#14391a] text-[#14391a]'
              : 'border-transparent text-[#14391a]/60 hover:text-[#14391a]'
          }`}
        >
          <Shield size={18} />
          <span>Security</span>
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`pb-3.5 px-3.5 font-bold text-[15px] border-b-3 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'actions'
              ? 'border-[#14391a] text-[#14391a]'
              : 'border-transparent text-[#14391a]/60 hover:text-[#14391a]'
          }`}
        >
          <Monitor size={18} />
          <span>Account Actions</span>
        </button>
      </div>

      {/* Profile Tab View */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Card 1: Profile Information */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-5">
            <div>
              <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">
                Profile information
              </h2>
              <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">
                Update personal and contact details.
              </p>
            </div>

            <form onSubmit={handleSaveChanges} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/20 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/40"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">
                  Email address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-[#fcfbfa] border border-[#14391a]/20 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/40"
                  />
                  <button
                    type="button"
                    onClick={() => alert(`A verification link has been sent to ${email}`)}
                    className="px-5 bg-[#113819] hover:bg-[#14391a] text-white text-sm font-bold rounded-[12px] transition cursor-pointer shrink-0"
                  >
                    Change email
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">
                  Phone number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/20 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/40"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto self-start mt-2 px-10 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm text-center"
              >
                Save changes
              </button>
            </form>
          </div>

          {/* Card 2: Change Password */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-5">
            <div>
              <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">
                Change Password
              </h2>
              <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">
                Ensure your account is using a strong password
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">
                  Current password
                </label>
                <input
                  type="password"
                  placeholder="************"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/20 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/40 placeholder-[#14391a]/40"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  placeholder="************"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/20 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/40 placeholder-[#14391a]/40"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">
                  Confirm New password
                </label>
                <input
                  type="password"
                  placeholder="************"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/20 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/40 placeholder-[#14391a]/40"
                />
              </div>

              {/* Password must contain list */}
              <div className="bg-[#faf8ed] rounded-[12px] p-4 flex flex-col gap-2">
                <span className="text-xs font-extrabold text-[#14391a]/85">Password must contain:</span>
                
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className={`p-0.5 rounded-full flex items-center justify-center transition-colors ${
                    hasMinLength ? 'bg-[#cbebc7] text-[#14391a]' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className={hasMinLength ? 'text-[#14391a]' : 'text-[#14391a]/60'}>
                    At least 8 characters
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className={`p-0.5 rounded-full flex items-center justify-center transition-colors ${
                    hasUppercase ? 'bg-[#cbebc7] text-[#14391a]' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className={hasUppercase ? 'text-[#14391a]' : 'text-[#14391a]/60'}>
                    One uppercase letter
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className={`p-0.5 rounded-full flex items-center justify-center transition-colors ${
                    hasNumberOrSpecial ? 'bg-[#cbebc7] text-[#14391a]' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className={hasNumberOrSpecial ? 'text-[#14391a]' : 'text-[#14391a]/60'}>
                    One number or special character
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 px-10 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm text-center"
              >
                Update password
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Security Tab View */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Card 1: Two-factor authentication */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-5">
            <div>
              <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">
                Two-factor authentication
              </h2>
              <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">
                Add an extra layer of security to your account.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Row 1: 2FA is enabled status card */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] border border-[#14391a]/20 rounded-[12px]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#cbebc7] text-[#14391a] rounded-[8px]">
                    <Shield size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#14391a] leading-tight">2FA is enabled</h3>
                    <p className="text-xs text-[#14391a]/70 font-semibold mt-0.5">Your account is protected.</p>
                  </div>
                </div>
                {/* Switch toggle */}
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactorEnabled ? 'bg-[#113819]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 2: Authenticator App */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] border border-[#14391a]/20 rounded-[12px]">
                <div>
                  <h3 className="text-sm font-extrabold text-[#14391a] leading-tight">Authenticator App</h3>
                  <p className="text-xs text-[#14391a]/70 font-semibold mt-0.5">You are using Google Authenticator</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Reconfigure flow started')}
                  className="px-4 py-2 bg-[#cbebc7]/45 border border-[#14391a]/30 hover:bg-[#cbebc7] text-[#14391a] text-xs font-extrabold rounded-[10px] transition cursor-pointer"
                >
                  Reconfigure
                </button>
              </div>

              {/* Row 3: Disable 2FA */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#f7d6d3]/30 border border-[#99221b]/30 rounded-[12px]">
                <div>
                  <h3 className="text-sm font-extrabold text-[#99221b] leading-tight">Disable 2FA</h3>
                  <p className="text-xs text-[#99221b]/80 font-semibold mt-0.5">Disabling 2FA will reduce your account security.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to disable 2FA?')) {
                      setTwoFactorEnabled(false);
                    }
                  }}
                  className="px-4 py-2 bg-[#f7d6d3] border border-[#d65f57] hover:bg-[#fadfcb] text-[#99221b] text-xs font-extrabold rounded-[10px] transition cursor-pointer"
                >
                  Disable
                </button>
              </div>

            </div>
          </div>

          {/* Card 2: Email Preferences */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-5">
            <div>
              <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">
                Email Preferences
              </h2>
              <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">
                Manage how you receive email notifications.
              </p>
            </div>

            <div className="flex flex-col gap-4.5 divide-y divide-[#14391a]/10">
              
              {/* Row 1: Security alerts */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div>
                  <h3 className="text-sm font-extrabold text-[#14391a] leading-tight">Security alerts</h3>
                  <p className="text-xs text-[#14391a]/70 font-semibold mt-0.5">Get notified about important security event.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefSecurityAlerts(!prefSecurityAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefSecurityAlerts ? 'bg-[#113819]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prefSecurityAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 2: New logins */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#14391a] leading-tight">New logins</h3>
                  <p className="text-xs text-[#14391a]/70 font-semibold mt-0.5">Get notified when someone logs in.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefNewLogins(!prefNewLogins)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefNewLogins ? 'bg-[#113819]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prefNewLogins ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 3: Billing updates */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#14391a] leading-tight">Billing updates</h3>
                  <p className="text-xs text-[#14391a]/70 font-semibold mt-0.5">Receive billing and subscription updates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefBillingUpdates(!prefBillingUpdates)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefBillingUpdates ? 'bg-[#113819]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prefBillingUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 4: System announcements */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#14391a] leading-tight">System announcements</h3>
                  <p className="text-xs text-[#14391a]/70 font-semibold mt-0.5">Receive product updates and announcements.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefSystemAnnouncements(!prefSystemAnnouncements)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefSystemAnnouncements ? 'bg-[#113819]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prefSystemAnnouncements ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>

            <button
              type="button"
              onClick={() => alert('Preferences saved successfully!')}
              className="mt-4 w-full px-10 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm text-center"
            >
              Save preferences
            </button>
          </div>

        </div>
      )}

      {/* Account Actions Tab View */}
      {activeTab === 'actions' && (
        <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-6">
          <div>
            <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">
              Account Actions
            </h2>
            <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">
              Manage your account and session.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-[#14391a]/10">
              
              {/* Active Sessions */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] rounded-[12px] border border-gray-100 hover:border-[#14391a]/20 transition duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 border border-[#14391a]/25 text-[#14391a] rounded-[12px]">
                    <Monitor size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#14391a] leading-tight">Active sessions</h3>
                    <p className="text-xs text-[#14391a]/70 font-bold mt-1">View and manage your active sessions.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Viewing sessions')}
                  className="px-4 py-2.5 bg-[#cbebc7]/45 border border-[#14391a]/30 hover:bg-[#cbebc7] text-[#14391a] text-xs font-extrabold rounded-[10px] transition cursor-pointer shrink-0"
                >
                  View sessions
                </button>
              </div>

              {/* Log out */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] rounded-[12px] border border-gray-100 hover:border-[#99221b]/20 transition duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 border border-[#99221b]/35 text-[#99221b] rounded-[12px]">
                    <LogOut size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#99221b] leading-tight">Log out</h3>
                    <p className="text-xs text-[#99221b]/70 font-bold mt-1">Sign out from all devices</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Signing out of all devices')}
                  className="px-4 py-2.5 bg-[#f7d6d3] border border-[#d65f57] hover:bg-[#fadfcb] text-[#99221b] text-xs font-extrabold rounded-[10px] transition cursor-pointer shrink-0"
                >
                  Log out all
                </button>
              </div>

            </div>

            {/* Row 2 */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] rounded-[12px] border border-gray-100 hover:border-[#99221b]/20 transition duration-200">
              <div className="flex items-center gap-3">
                <div className="p-3.5 border border-[#99221b]/35 text-[#99221b] rounded-[12px]">
                  <Trash2 size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-[#99221b] leading-tight">Delete account</h3>
                  <p className="text-xs text-[#99221b]/70 font-bold mt-1">Permanently delete yor account and all your data will be permanently deleted</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you absolutely sure you want to delete your account? This action is irreversible.')) {
                    alert('Account deleted.');
                  }
                }}
                className="px-5 py-2.5 bg-[#f7d6d3] border border-[#d65f57] hover:bg-[#fadfcb] text-[#99221b] text-xs font-extrabold rounded-[10px] transition cursor-pointer self-start lg:self-center shrink-0"
              >
                Delete account
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
