import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, useToast } from '@/components/ui';
import { useCurrentUser } from '@/hooks/queries';
import { useSignOut } from '@/hooks/mutations';
import { User, Bell, Trash2, LogOut, Shield } from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: user } = useCurrentUser();
  const signOutMutation = useSignOut();

  const [notifications, setNotifications] = useState(true);
  const [reportFrequency, setReportFrequency] = useState('weekly');

  const handleSaveSettings = () => {
    toast.success('Preferences saved successfully!');
  };

  const handleSignOut = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Signed out successfully');
        navigate('/');
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-card shadow-window">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Parent Settings</h1>
          <p className="text-sm text-navy-soft">Manage account profile, alert notifications, and data privacy options.</p>
        </div>
        <Button variant="primary" className="text-xs h-10" onClick={handleSaveSettings}>
          Save Preferences
        </Button>
      </div>

      {/* Profile Details Card */}
      <Card className="p-6 bg-white shadow-window space-y-4">
        <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
          <User className="h-5 w-5 text-accent" /> Account Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-xs uppercase tracking-wider text-navy-soft font-semibold">Username</span>
            <span className="font-medium text-navy">{user?.username || 'SarahM'}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-navy-soft font-semibold">Email Address</span>
            <span className="font-medium text-navy">{user?.email || 'parent@example.com'}</span>
          </div>
        </div>
      </Card>

      {/* Notifications Card */}
      <Card className="p-6 bg-white shadow-window space-y-4">
        <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
          <Bell className="h-5 w-5 text-accent" /> Notifications & Reports
        </h2>

        <div className="flex items-center justify-between py-2 border-b border-navy/10">
          <div>
            <p className="font-medium text-navy text-sm">Real-time Tamper Alerts</p>
            <p className="text-xs text-navy-soft">Receive instant notifications when security rules are triggered.</p>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="rounded border-navy/30 text-accent focus:ring-accent h-5 w-5 cursor-pointer"
          />
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-sm font-medium text-navy">Summary Report Frequency</label>
          <select
            value={reportFrequency}
            onChange={(e) => setReportFrequency(e.target.value)}
            className="w-full sm:w-72 bg-cream border border-navy/20 rounded-pill px-4 py-2.5 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="daily">Daily Summary</option>
            <option value="weekly">Weekly Digest</option>
            <option value="monthly">Monthly Report</option>
          </select>
        </div>
      </Card>

      {/* Privacy & Danger Zone */}
      <Card className="p-6 bg-white shadow-window space-y-4 border border-danger/20">
        <h2 className="text-lg font-semibold text-danger flex items-center gap-2">
          <Shield className="h-5 w-5" /> Data Privacy & Account Actions
        </h2>
        <p className="text-sm text-navy-soft">
          Permanently delete cached child activity logs or sign out of your current parent session.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="solid"
            className="text-xs h-9 text-danger hover:bg-danger/10 border border-danger/20"
            onClick={() => toast.error('Child data deletion requires guardian verification.')}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Child Data
          </Button>

          <Button
            variant="solid"
            className="text-xs h-9 bg-navy text-cream hover:bg-navy/90"
            onClick={handleSignOut}
            disabled={signOutMutation.isPending}
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}