import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Shield, Monitor, Check, LogOut, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetchJson } from '../../lib/api';

// ── Reusable Toggle ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#113819]' : 'bg-gray-200'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

// ── Sessions Modal ────────────────────────────────────────────────────────────
function SessionsModal({ onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    apiFetchJson('/profile/sessions').then(({ ok, data }) => {
      if (ok) setSessions(data.sessions);
      setLoading(false);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-[#ece5c8] rounded-[24px] border border-[#14391a]/15 p-7 w-full max-w-[500px] shadow-2xl text-[#14391a]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-black">Active Sessions</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#14391a]/10 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        {loading && <p className="text-sm text-[#14391a]/60 font-medium py-4 text-center">Loading…</p>}
        {!loading && sessions.length === 0 && (
          <p className="text-sm text-[#14391a]/60 font-medium py-4 text-center">No active sessions found.</p>
        )}
        {!loading && sessions.length > 0 && (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="flex items-start gap-3 p-4 bg-white/60 rounded-xl border border-[#14391a]/10">
                <Monitor size={18} className="mt-0.5 shrink-0 text-[#14391a]/70" />
                <div>
                  <p className="text-sm font-extrabold text-[#14391a] leading-tight">{s.device}</p>
                  <p className="text-xs text-[#14391a]/60 font-semibold mt-0.5">
                    Started {s.createdAt} · expires {s.expiresAt}
                    {s.rememberMe ? ' · remembered' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={onClose}
          className="mt-6 w-full py-3 bg-[#14391a] hover:bg-[#0f2a13] text-white font-extrabold rounded-xl transition cursor-pointer">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Feedback banner ───────────────────────────────────────────────────────────
function Banner({ msg, type }) {
  if (!msg) return null;
  const isErr = type === 'error';
  return (
    <div className={`px-4 py-2.5 rounded-xl text-xs font-bold ${isErr ? 'bg-[#f7d6d3] text-[#99221b]' : 'bg-[#cbebc7] text-[#14391a]'}`}>
      {msg}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SuperAdminProfilePage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { logout: authLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // ── Profile state ─────────────────────────────────────────────────────────
  const [profile, setProfile]     = useState(null);
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [newEmail, setNewEmail]   = useState('');
  const [phone, setPhone]         = useState('');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // ── Password state ────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [pwMsg, setPwMsg]           = useState({ text: '', type: '' });

  // ── Security state ────────────────────────────────────────────────────────
  const [twofaEnabled, setTwofaEnabled]       = useState(false);
  const [prefSecurity, setPrefSecurity]       = useState(true);
  const [prefLogins, setPrefLogins]           = useState(true);
  const [prefBilling, setPrefBilling]         = useState(true);
  const [prefAnnouncements, setPrefAnnounce]  = useState(true);
  const [prefMsg, setPrefMsg]                 = useState({ text: '', type: '' });

  // ── Sessions modal ────────────────────────────────────────────────────────
  const [showSessions, setShowSessions] = useState(false);

  // ── Delete / logout state ─────────────────────────────────────────────────
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });

  // ── Load profile ──────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    const { ok, data } = await apiFetchJson('/profile/me');
    if (!ok) return;
    const p = data.profile;
    setProfile(p);
    setFullName(p.fullName);
    setEmail(p.email);
    setNewEmail(p.email);
    setPhone(p.phone || '');
    setTwofaEnabled(p.twofaEnabled);
    setPrefSecurity(p.prefs.securityAlerts);
    setPrefLogins(p.prefs.newLogins);
    setPrefBilling(p.prefs.billingUpdates);
    setPrefAnnounce(p.prefs.announcements);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Password validation ───────────────────────────────────────────────────
  const hasMinLength      = newPw.length >= 8;
  const hasUppercase      = /[A-Z]/.test(newPw);
  const hasNumberOrSpec   = /[0-9^$@!%*?&]/.test(newPw);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const { ok, data } = await apiFetchJson('/profile/me', {
      method: 'PATCH',
      body: JSON.stringify({ fullName, phone }),
    });
    if (ok) {
      setProfile(data.profile);
      setProfileMsg({ text: 'Profile updated.', type: 'success' });
    } else {
      setProfileMsg({ text: data?.message || 'Update failed.', type: 'error' });
    }
    setTimeout(() => setProfileMsg({ text: '', type: '' }), 3000);
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || newEmail === email) return;
    const { ok, data } = await apiFetchJson('/profile/email', {
      method: 'PATCH',
      body: JSON.stringify({ newEmail }),
    });
    if (ok) { setEmail(newEmail); setProfileMsg({ text: 'Email updated.', type: 'success' }); }
    else setProfileMsg({ text: data?.message || 'Email update failed.', type: 'error' });
    setTimeout(() => setProfileMsg({ text: '', type: '' }), 3000);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!hasMinLength || !hasUppercase || !hasNumberOrSpec) {
      setPwMsg({ text: 'Password does not meet requirements.', type: 'error' }); return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ text: 'Passwords do not match.', type: 'error' }); return;
    }
    const { ok, data } = await apiFetchJson('/profile/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    if (ok) {
      setPwMsg({ text: 'Password updated. You will be logged out.', type: 'success' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => authLogout?.(), 2500);
    } else {
      setPwMsg({ text: data?.message || 'Password update failed.', type: 'error' });
    }
    setTimeout(() => setPwMsg({ text: '', type: '' }), 4000);
  };

  const handleToggle2fa = async (val) => {
    setTwofaEnabled(val);
    await apiFetchJson('/profile/2fa', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: val }),
    });
  };

  const handleSavePrefs = async () => {
    const { ok } = await apiFetchJson('/profile/preferences', {
      method: 'PATCH',
      body: JSON.stringify({
        securityAlerts: prefSecurity,
        newLogins: prefLogins,
        billingUpdates: prefBilling,
        announcements: prefAnnouncements,
      }),
    });
    setPrefMsg({ text: ok ? 'Preferences saved.' : 'Save failed.', type: ok ? 'success' : 'error' });
    setTimeout(() => setPrefMsg({ text: '', type: '' }), 3000);
  };

  const handleLogoutAll = async () => {
    if (!confirm('Sign out from all devices?')) return;
    await apiFetchJson('/profile/sessions', { method: 'DELETE' });
    authLogout?.();
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { setActionMsg({ text: 'Enter your password to confirm.', type: 'error' }); return; }
    const { ok, data } = await apiFetchJson('/profile/account', {
      method: 'DELETE',
      body: JSON.stringify({ password: deletePassword }),
    });
    if (ok) {
      setActionMsg({ text: 'Account deleted. Redirecting…', type: 'success' });
      setTimeout(() => authLogout?.(), 1500);
    } else {
      setActionMsg({ text: data?.message || 'Deletion failed.', type: 'error' });
    }
    setTimeout(() => setActionMsg({ text: '', type: '' }), 4000);
  };

  // ── Tab styling ───────────────────────────────────────────────────────────
  const tabCls = (key) =>
    `pb-3.5 px-3.5 font-bold text-[15px] border-b-3 transition cursor-pointer flex items-center gap-2 ${
      activeTab === key ? 'border-[#14391a] text-[#14391a]' : 'border-transparent text-[#14391a]/60 hover:text-[#14391a]'
    }`;

  const displayName = profile?.fullName || fullName || 'Super Admin';
  const displayEmail = profile?.email || email;

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: displayName,
        subtitle: (
          <>
            <span>Super Admin</span>
            <span className="text-[#14391a]/30">•</span>
            <span>{displayEmail}</span>
          </>
        )
      });
    }
  }, [displayName, displayEmail, setHeaderDetails]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 lg:hidden">
        <div>
          <h1 className="text-4xl sm:text-[44px] font-black text-[#14391a] leading-none mb-1">
            {displayName}
          </h1>
          <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold flex items-center gap-2 mt-2">
            <span>Super Admin</span>
            <span className="text-[#14391a]/30">•</span>
            <span>{displayEmail}</span>
          </p>
        </div>
        <span className="inline-flex px-5 py-2.5 bg-[#cbebc7] border border-[#14391a]/30 rounded-[12px] text-sm font-extrabold text-[#14391a]">
          {profile?.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Active'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#14391a]/15 mb-7">
        <button onClick={() => setActiveTab('profile')}  className={tabCls('profile')}>
          <User size={18} /><span>Profile</span>
        </button>
        <button onClick={() => setActiveTab('security')} className={tabCls('security')}>
          <Shield size={18} /><span>Security</span>
        </button>
        <button onClick={() => setActiveTab('actions')}  className={tabCls('actions')}>
          <Monitor size={18} /><span>Account Actions</span>
        </button>
      </div>

      {/* ── Profile Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Profile Information */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-5">
            <div>
              <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">Profile information</h2>
              <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">Update personal and contact details.</p>
            </div>
            <Banner msg={profileMsg.text} type={profileMsg.type} />
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">Full name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/35 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/50" />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">Email address</label>
                <div className="flex gap-2">
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                    className="flex-1 bg-[#fcfbfa] border border-[#14391a]/35 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/50" />
                  <button type="button" onClick={handleChangeEmail}
                    className="px-5 bg-[#113819] hover:bg-[#14391a] text-white text-sm font-bold rounded-[12px] transition cursor-pointer shrink-0">
                    Change email
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">Phone number</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/35 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/50" />
              </div>
              <button type="submit"
                className="w-full sm:w-auto self-start mt-2 px-10 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm">
                Save changes
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-5">
            <div>
              <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">Change Password</h2>
              <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">Ensure your account is using a strong password</p>
            </div>
            <Banner msg={pwMsg.text} type={pwMsg.type} />
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <input type="text" name="username" autoComplete="username" value={email} readOnly style={{ display: 'none' }} />
              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">Current password</label>
                <input type="password" placeholder="············" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/35 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/50 placeholder-[#14391a]/40" />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">New password</label>
                <input type="password" placeholder="············" value={newPw} onChange={e => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/35 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/50 placeholder-[#14391a]/40" />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#14391a] mb-1.5">Confirm New password</label>
                <input type="password" placeholder="············" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/35 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/50 placeholder-[#14391a]/40" />
              </div>
              {/* Requirements */}
              <div className="bg-[#faf8ed] rounded-[12px] p-4 flex flex-col gap-2">
                <span className="text-xs font-extrabold text-[#14391a]/85">Password must contain:</span>
                {[
                  [hasMinLength,    'At least 8 characters'],
                  [hasUppercase,    'One uppercase letter'],
                  [hasNumberOrSpec, 'One number or special character'],
                ].map(([met, label]) => (
                  <div key={label} className="flex items-center gap-2 text-xs font-bold">
                    <span className={`p-0.5 rounded-full flex items-center justify-center transition-colors ${met ? 'bg-[#cbebc7] text-[#14391a]' : 'bg-gray-200 text-gray-400'}`}>
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className={met ? 'text-[#14391a]' : 'text-[#14391a]/60'}>{label}</span>
                  </div>
                ))}
              </div>
              <button type="submit"
                className="w-full mt-2 px-10 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm">
                Update password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Security Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* 2FA Card */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-5">
            <div>
              <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">Two-factor authentication</h2>
              <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">Add an extra layer of security to your account.</p>
            </div>
            <div className="flex flex-col gap-4">
              {/* Status row */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] border border-[#14391a]/35 rounded-[12px]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#cbebc7] text-[#14391a] rounded-[8px]"><Shield size={20} strokeWidth={2.5} /></div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#14391a] leading-tight">
                      {twofaEnabled ? '2FA is enabled' : '2FA is disabled'}
                    </h3>
                    <p className="text-xs text-[#14391a]/70 font-semibold mt-0.5">
                      {twofaEnabled ? 'Your account is protected.' : 'Enable for better security.'}
                    </p>
                  </div>
                </div>
                <Toggle checked={twofaEnabled} onChange={handleToggle2fa} />
              </div>

              {/* Authenticator App row */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] border border-[#14391a]/35 rounded-[12px]">
                <div>
                  <h3 className="text-sm font-extrabold text-[#14391a] leading-tight">Authenticator App</h3>
                  <p className="text-xs text-[#14391a]/70 font-semibold mt-0.5">You are using Google Authenticator</p>
                </div>
                <button type="button" onClick={() => alert('Reconfigure flow coming soon.')}
                  className="px-4 py-2 bg-[#cbebc7]/45 border border-[#14391a]/30 hover:bg-[#cbebc7] text-[#14391a] text-xs font-extrabold rounded-[10px] transition cursor-pointer">
                  Reconfigure
                </button>
              </div>

              {/* Disable 2FA row */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#f7d6d3]/30 border border-[#99221b]/45 rounded-[12px]">
                <div>
                  <h3 className="text-sm font-extrabold text-[#99221b] leading-tight">Disable 2FA</h3>
                  <p className="text-xs text-[#99221b]/80 font-semibold mt-0.5">Disabling 2FA will reduce your account security.</p>
                </div>
                <button type="button" onClick={() => { if (confirm('Disable 2FA?')) handleToggle2fa(false); }}
                  className="px-4 py-2 bg-[#f7d6d3] border border-[#d65f57] hover:bg-[#fadfcb] text-[#99221b] text-xs font-extrabold rounded-[10px] transition cursor-pointer">
                  Disable
                </button>
              </div>
            </div>
          </div>

          {/* Email Preferences Card */}
          <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-5">
            <div>
              <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">Email Preferences</h2>
              <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">Manage how you receive email notifications.</p>
            </div>
            <Banner msg={prefMsg.text} type={prefMsg.type} />
            <div className="flex flex-col gap-4.5 divide-y divide-[#14391a]/10">
              {[
                [prefSecurity,      setPrefSecurity,  'Security alerts',       'Get notified about important security event.'],
                [prefLogins,        setPrefLogins,     'New logins',            'Get notified when someone logs in.'],
                [prefBilling,       setPrefBilling,    'Billing updates',       'Receive billing and subscription updates.'],
                [prefAnnouncements, setPrefAnnounce,   'System announcements',  'Receive product updates and announcements.'],
              ].map(([val, setter, label, desc], i) => (
                <div key={label} className={`flex items-center justify-between gap-4 ${i > 0 ? 'pt-4' : 'pt-1'}`}>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#14391a] leading-tight">{label}</h3>
                    <p className="text-xs text-[#14391a]/70 font-semibold mt-0.5">{desc}</p>
                  </div>
                  <Toggle checked={val} onChange={setter} />
                </div>
              ))}
            </div>
            <button type="button" onClick={handleSavePrefs}
              className="mt-4 w-full px-10 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm">
              Save preferences
            </button>
          </div>
        </div>
      )}

      {/* ── Account Actions Tab ───────────────────────────────────────────── */}
      {activeTab === 'actions' && (
        <div className="bg-[#fcfbfa] border border-[#14391a]/15 rounded-[20px] p-6.5 flex flex-col gap-6">
          <div>
            <h2 className="text-[20px] font-black text-[#14391a] leading-none mb-1">Account Actions</h2>
            <p className="text-sm text-[#14391a]/70 font-semibold mt-1.5">Manage your account and session.</p>
          </div>
          <Banner msg={actionMsg.text} type={actionMsg.type} />

          <div className="flex flex-col gap-6">
            {/* Sessions + Logout row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-[#14391a]/10">
              {/* Active sessions */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] rounded-[12px] border border-gray-100 hover:border-[#14391a]/20 transition">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 border border-[#14391a]/25 text-[#14391a] rounded-[12px]"><Monitor size={22} strokeWidth={2.5} /></div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#14391a] leading-tight">Active sessions</h3>
                    <p className="text-xs text-[#14391a]/70 font-bold mt-1">View and manage your active sessions.</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowSessions(true)}
                  className="px-4 py-2.5 bg-[#cbebc7]/45 border border-[#14391a]/30 hover:bg-[#cbebc7] text-[#14391a] text-xs font-extrabold rounded-[10px] transition cursor-pointer shrink-0">
                  View sessions
                </button>
              </div>

              {/* Log out all */}
              <div className="flex items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] rounded-[12px] border border-gray-100 hover:border-[#99221b]/20 transition">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 border border-[#99221b]/35 text-[#99221b] rounded-[12px]"><LogOut size={22} strokeWidth={2.5} /></div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#99221b] leading-tight">Log out</h3>
                    <p className="text-xs text-[#99221b]/70 font-bold mt-1">Sign out from all devices</p>
                  </div>
                </div>
                <button type="button" onClick={handleLogoutAll}
                  className="px-4 py-2.5 bg-[#f7d6d3] border border-[#d65f57] hover:bg-[#fadfcb] text-[#99221b] text-xs font-extrabold rounded-[10px] transition cursor-pointer shrink-0">
                  Log out all
                </button>
              </div>
            </div>

            {/* Delete account row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4.5 bg-[#fcfbfa] rounded-[12px] border border-gray-100 hover:border-[#99221b]/20 transition">
              <div className="flex items-center gap-3">
                <div className="p-3.5 border border-[#99221b]/35 text-[#99221b] rounded-[12px]"><Trash2 size={22} strokeWidth={2.5} /></div>
                <div>
                  <h3 className="text-[15px] font-black text-[#99221b] leading-tight">Delete account</h3>
                  <p className="text-xs text-[#99221b]/70 font-bold mt-1">Permanently delete your account and all your data.</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowDeleteConfirm(v => !v)}
                className="px-5 py-2.5 bg-[#f7d6d3] border border-[#d65f57] hover:bg-[#fadfcb] text-[#99221b] text-xs font-extrabold rounded-[10px] transition cursor-pointer self-start lg:self-center shrink-0">
                Delete account!
              </button>
            </div>

            {/* Inline delete confirmation */}
            {showDeleteConfirm && (
              <div className="flex flex-col gap-3 p-5 bg-[#fdf4f4] border border-[#d65f57]/40 rounded-[14px]">
                <p className="text-sm font-extrabold text-[#99221b]">Enter your password to permanently delete this account:</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Your password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    className="flex-1 bg-white border border-[#d65f57]/40 text-[#14391a] px-4 py-2.5 text-sm font-semibold rounded-[10px] focus:outline-none"
                  />
                  <button type="button" onClick={handleDeleteAccount}
                    className="px-5 py-2.5 bg-[#99221b] hover:bg-[#7a1a15] text-white text-xs font-extrabold rounded-[10px] transition cursor-pointer">
                    Confirm
                  </button>
                  <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                    className="px-4 py-2.5 bg-white border border-[#14391a]/30 text-[#14391a] text-xs font-extrabold rounded-[10px] transition cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Modal */}
      {showSessions && <SessionsModal onClose={() => setShowSessions(false)} />}
    </div>
  );
}
