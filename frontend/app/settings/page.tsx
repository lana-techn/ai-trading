'use client';

import { useState } from 'react';
import { 
  CogIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    trading: true,
    analysis: true
  });

  const [apiKeys, setApiKeys] = useState({
    gemini: { value: '', visible: false },
    alphavantage: { value: '', visible: false }
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleApiKeyVisibility = (key: keyof typeof apiKeys) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: { ...prev[key], visible: !prev[key].visible }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-xl">
          <CogIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your AI trading preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme Preference</label>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-sm text-muted-foreground">System, Light, or Dark mode</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trading Risk Level</label>
              <select className="w-full p-2 border border-border rounded-lg bg-background">
                <option>Conservative</option>
                <option>Moderate</option>
                <option>Aggressive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Default Currency</label>
              <select className="w-full p-2 border border-border rounded-lg bg-background">
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
                <option>GBP - British Pound</option>
                <option>JPY - Japanese Yen</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellIcon className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">{key.replace('_', ' ')} Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {key === 'email' && 'Receive updates via email'}
                    {key === 'push' && 'Browser push notifications'}
                    {key === 'trading' && 'Trading alerts and signals'}
                    {key === 'analysis' && 'AI analysis completion alerts'}
                  </p>
                </div>
                <button
                  onClick={() => toggleNotification(key as keyof typeof notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(apiKeys).map(([key, config]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium capitalize">
                  {key === 'gemini' ? 'Google Gemini API Key' : 'Alpha Vantage API Key'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={config.visible ? 'text' : 'password'}
                      value={config.value}
                      onChange={(e) => setApiKeys(prev => ({
                        ...prev,
                        [key]: { ...prev[key as keyof typeof apiKeys], value: e.target.value }
                      }))}
                      placeholder="Enter API key..."
                      className="w-full p-2 pr-10 border border-border rounded-lg bg-background"
                    />
                    <button
                      onClick={() => toggleApiKeyVisibility(key as keyof typeof apiKeys)}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                    >
                      {config.visible ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <Button variant="outline" size="sm">
                    Test
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Model Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CogIcon className="h-5 w-5" />
              AI Model Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Analysis Model</label>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Gemini 1.5 Flash
                </Badge>
                <Badge variant="outline">
                  Qwen 2.5 Coder
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Confidence Threshold</label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                defaultValue="0.75"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>75%</span>
                <span>95%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Auto-Analysis</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Enable automatic chart analysis</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          Save Settings
        </Button>
      </div>
    </div>
  );
}