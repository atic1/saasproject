import React, { useState } from 'react';
import { Settings, Globe, Clock, CreditCard, Shield, Save, CheckCircle } from 'lucide-react';

const SettingsSection = ({ icon: Icon, title, children }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-800/30">
      <div className="p-2 rounded-lg bg-purple-500/10">
        <Icon size={16} className="text-purple-400" />
      </div>
      <h2 className="font-bold text-white">{title}</h2>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

const Field = ({ label, description, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-300 mb-1">{label}</label>
    {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm transition-all";
const toggleCls = (on) => `relative w-11 h-6 rounded-full transition-colors cursor-pointer ${on ? 'bg-purple-600' : 'bg-gray-700'}`;

const Toggle = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)} className={toggleCls(checked)} type="button">
    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
  </button>
);

const SuperAdminSettingsPage = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'BizNepal SaaS Platform',
    supportEmail: 'support@biznepal.com',
    supportPhone: '01-4XXXXXX',
    trialDays: 14,
    autoApprove: false,
    requireVerification: true,
    smsNotifications: true,
    emailNotifications: true,
    maintenanceMode: false,
    maxBusinessesPerDay: 50,
    defaultPlan: 'free_trial',
    currency: 'NPR',
    timezone: 'Asia/Kathmandu',
  });

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Platform Settings</h1>
        <p className="text-gray-400 text-sm">Configure global platform options and defaults.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Platform Branding */}
        <SettingsSection icon={Globe} title="Platform Branding">
          <Field label="Platform Name">
            <input
              className={inputCls}
              value={settings.platformName}
              onChange={e => update('platformName', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Support Email">
              <input
                className={inputCls}
                type="email"
                value={settings.supportEmail}
                onChange={e => update('supportEmail', e.target.value)}
              />
            </Field>
            <Field label="Support Phone">
              <input
                className={inputCls}
                value={settings.supportPhone}
                onChange={e => update('supportPhone', e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Default Currency">
              <select className={inputCls} value={settings.currency} onChange={e => update('currency', e.target.value)}>
                <option value="NPR">NPR – Nepali Rupee</option>
                <option value="USD">USD – US Dollar</option>
              </select>
            </Field>
            <Field label="Platform Timezone">
              <select className={inputCls} value={settings.timezone} onChange={e => update('timezone', e.target.value)}>
                <option value="Asia/Kathmandu">Asia/Kathmandu (NPT +5:45)</option>
                <option value="UTC">UTC</option>
              </select>
            </Field>
          </div>
        </SettingsSection>

        {/* Registration & Trial */}
        <SettingsSection icon={Clock} title="Registration & Trials">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Trial Period (days)" description="Default trial duration for new business signups.">
              <input
                className={inputCls}
                type="number"
                min={1}
                max={90}
                value={settings.trialDays}
                onChange={e => update('trialDays', Number(e.target.value))}
              />
            </Field>
            <Field label="Max Signups Per Day" description="Limit on new business registrations per day.">
              <input
                className={inputCls}
                type="number"
                min={1}
                value={settings.maxBusinessesPerDay}
                onChange={e => update('maxBusinessesPerDay', Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Default Subscription Plan">
            <select className={inputCls} value={settings.defaultPlan} onChange={e => update('defaultPlan', e.target.value)}>
              <option value="free_trial">Free Trial</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
            </select>
          </Field>
          <div className="flex items-center justify-between py-3 border-t border-gray-800">
            <div>
              <p className="text-sm font-semibold text-white">Auto-Approve Registrations</p>
              <p className="text-xs text-gray-500 mt-0.5">Skip manual review for new signups</p>
            </div>
            <Toggle checked={settings.autoApprove} onChange={v => update('autoApprove', v)} />
          </div>
          <div className="flex items-center justify-between py-3 border-t border-gray-800">
            <div>
              <p className="text-sm font-semibold text-white">Require Email Verification</p>
              <p className="text-xs text-gray-500 mt-0.5">Business owners must verify email before access</p>
            </div>
            <Toggle checked={settings.requireVerification} onChange={v => update('requireVerification', v)} />
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection icon={CreditCard} title="Notification Channels">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-white">SMS Notifications</p>
              <p className="text-xs text-gray-500 mt-0.5">Send SMS alerts for approvals and rejections</p>
            </div>
            <Toggle checked={settings.smsNotifications} onChange={v => update('smsNotifications', v)} />
          </div>
          <div className="flex items-center justify-between py-3 border-t border-gray-800">
            <div>
              <p className="text-sm font-semibold text-white">Email Notifications</p>
              <p className="text-xs text-gray-500 mt-0.5">Send email confirmations for status changes</p>
            </div>
            <Toggle checked={settings.emailNotifications} onChange={v => update('emailNotifications', v)} />
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection icon={Shield} title="Security & Maintenance">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-white">Maintenance Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">Temporarily disable access for all business tenants</p>
            </div>
            <Toggle checked={settings.maintenanceMode} onChange={v => update('maintenanceMode', v)} />
          </div>
          {settings.maintenanceMode && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <Shield size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">
                <strong>Warning:</strong> Enabling maintenance mode will lock out all business owners from their dashboards. Only the Super Admin panel will remain accessible.
              </p>
            </div>
          )}
        </SettingsSection>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4 pt-2">
          {saved && (
            <span className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle size={16} /> Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-bold shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminSettingsPage;
