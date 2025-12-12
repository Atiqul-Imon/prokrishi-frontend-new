"use client";

import { useState } from "react";
import { Save, Bell, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Prokrishi",
    siteDescription: "Fresh agricultural products marketplace",
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
  });

  const handleSave = async () => {
    setLoading(true);
    // TODO: Implement save settings API call
    setTimeout(() => {
      setLoading(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your application settings</p>
      </div>

      {/* General Settings */}
      <div className="bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500">
            <Globe className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            <p className="text-sm text-gray-500">Basic site configuration</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Site Description
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-500">
            <Bell className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">Manage notification preferences</p>
          </div>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive email notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Order Notifications</p>
              <p className="text-sm text-gray-500">Get notified of new orders</p>
            </div>
            <input
              type="checkbox"
              checked={settings.orderNotifications}
              onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Low Stock Alerts</p>
              <p className="text-sm text-gray-500">Alert when products are low in stock</p>
            </div>
            <input
              type="checkbox"
              checked={settings.lowStockAlerts}
              onChange={(e) => setSettings({ ...settings, lowStockAlerts: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500">
            <Shield className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-500">Security and access settings</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-500">
              Security settings will be available in a future update.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

