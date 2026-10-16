import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Button, useToast } from '@/components/ui';
import { Clock, ShieldAlert, History, Wallet, CheckCircle } from 'lucide-react';

export function PlaytimePage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'playtime';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Sample tamper alerts
  const [alerts, setAlerts] = useState([
    { id: '1', child: 'Leo', type: 'Tamper Attempt', description: 'Attempted to bypass screen lock at 4:15 PM', time: '10 mins ago', acknowledged: false },
    { id: '2', child: 'Emma', type: 'Time Limit Reached', description: 'Daily playtime cap reached; session locked.', time: '2 hours ago', acknowledged: true },
  ]);

  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success('Alert acknowledged');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-card shadow-window">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Playtime & History</h1>
          <p className="text-sm text-navy-soft">Review wallet balances, historical activity logs, and security tamper alerts.</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex rounded-pill bg-blue/20 p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('playtime')}
          className={`py-2 px-6 text-sm font-semibold rounded-pill transition-colors ${
            currentTab === 'playtime' ? 'bg-navy text-cream shadow' : 'text-navy hover:text-accent'
          }`}
        >
          Playtime Wallet
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`py-2 px-6 text-sm font-semibold rounded-pill transition-colors ${
            currentTab === 'history' ? 'bg-navy text-cream shadow' : 'text-navy hover:text-accent'
          }`}
        >
          History Ledger
        </button>
        <button
          type="button"
          onClick={() => setTab('alerts')}
          className={`py-2 px-6 text-sm font-semibold rounded-pill transition-colors ${
            currentTab === 'alerts' ? 'bg-navy text-cream shadow' : 'text-navy hover:text-accent'
          }`}
        >
          Security Alerts
        </button>
      </div>

      {/* Tab 1: Playtime Wallet */}
      {currentTab === 'playtime' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white shadow-window space-y-2">
            <p className="text-xs uppercase tracking-wider text-navy-soft font-semibold">Available Balance</p>
            <div className="text-3xl font-bold text-navy flex items-center gap-2">
              <Wallet className="h-6 w-6 text-accent" /> 45 mins
            </div>
            <p className="text-xs text-navy-soft">Earned from today's reading session.</p>
          </Card>

          <Card className="p-6 bg-white shadow-window space-y-2">
            <p className="text-xs uppercase tracking-wider text-navy-soft font-semibold">Daily Cap Limit</p>
            <div className="text-3xl font-bold text-navy flex items-center gap-2">
              <Clock className="h-6 w-6 text-success" /> 120 mins
            </div>
            <p className="text-xs text-navy-soft">Maximum allowed play per day.</p>
          </Card>

          <Card className="p-6 bg-white shadow-window space-y-2">
            <p className="text-xs uppercase tracking-wider text-navy-soft font-semibold">Ratio Multiplier</p>
            <div className="text-3xl font-bold text-navy">0.5x</div>
            <p className="text-xs text-navy-soft">2 mins reading = 1 min playtime.</p>
          </Card>
        </div>
      )}

      {/* Tab 2: History Ledger */}
      {currentTab === 'history' && (
        <Card className="p-6 bg-white shadow-window space-y-4">
          <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
            <History className="h-5 w-5 text-accent" /> Activity Ledger
          </h2>
          <div className="divide-y divide-navy/10 text-sm">
            <div className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-navy">Read "The Magic Treehouse" (Chapters 1-3)</p>
                <p className="text-xs text-navy-soft">Today at 3:30 PM • 30 mins reading</p>
              </div>
              <span className="text-success font-semibold text-xs bg-success/10 px-2.5 py-1 rounded-pill">+15 min play earned</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-navy">Played Minecraft</p>
                <p className="text-xs text-navy-soft">Today at 4:00 PM • 45 mins usage</p>
              </div>
              <span className="text-danger font-semibold text-xs bg-danger/10 px-2.5 py-1 rounded-pill">-45 min wallet deduction</span>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Security Alerts */}
      {currentTab === 'alerts' && (
        <Card className="p-6 bg-white shadow-window space-y-4">
          <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-danger" /> Tamper & Security Feed
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-card border border-navy/10 bg-cream/30 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy">{alert.child}</span>
                    <span className="text-xs px-2 py-0.5 rounded-pill bg-danger/10 text-danger font-medium">{alert.type}</span>
                    <span className="text-xs text-navy-soft">• {alert.time}</span>
                  </div>
                  <p className="text-sm text-navy-soft">{alert.description}</p>
                </div>
                {alert.acknowledged ? (
                  <span className="text-xs text-success font-medium flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Acknowledged
                  </span>
                ) : (
                  <Button variant="primary" className="text-xs h-8" onClick={() => handleAcknowledge(alert.id)}>
                    Acknowledge
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}