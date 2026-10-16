import { useState } from 'react';
import { Card, Button, useToast } from '@/components/ui';
import { Sliders, Clock, Shield, Check } from 'lucide-react';

export function RulesPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'apps' | 'schedules' | 'rewards'>('apps');
  
  // Apps tab state
  const [whitelist, setWhitelist] = useState(['Minecraft', 'Roblox', 'Duolingo']);
  const [blacklist, setBlacklist] = useState(['TikTok', 'Instagram']);
  const [newApp, setNewApp] = useState('');

  // Rewards tab state
  const [readingToPlayRatio, setReadingToPlayRatio] = useState(0.5);
  const [dailyCap, setDailyCap] = useState(120);

  const handleAddApp = (type: 'whitelist' | 'blacklist') => {
    if (!newApp.trim()) return;
    if (type === 'whitelist') {
      setWhitelist([...whitelist, newApp.trim()]);
    } else {
      setBlacklist([...blacklist, newApp.trim()]);
    }
    toast.success(`Added ${newApp} to ${type}`);
    setNewApp('');
  };

  const handleSaveRules = () => {
    toast.success('Rules updated and synchronized successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-card shadow-window">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Rules & Controls</h1>
          <p className="text-sm text-navy-soft">Configure allowed apps, screen schedules, and reading-to-play reward ratios.</p>
        </div>
        <Button variant="primary" className="text-xs h-10" onClick={handleSaveRules}>
          <Check className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex rounded-pill bg-blue/20 p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('apps')}
          className={`py-2 px-6 text-sm font-semibold rounded-pill transition-colors ${
            activeTab === 'apps' ? 'bg-navy text-cream shadow' : 'text-navy hover:text-accent'
          }`}
        >
          Apps & Whitelist
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`py-2 px-6 text-sm font-semibold rounded-pill transition-colors ${
            activeTab === 'schedules' ? 'bg-navy text-cream shadow' : 'text-navy hover:text-accent'
          }`}
        >
          Schedules
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rewards')}
          className={`py-2 px-6 text-sm font-semibold rounded-pill transition-colors ${
            activeTab === 'rewards' ? 'bg-navy text-cream shadow' : 'text-navy hover:text-accent'
          }`}
        >
          Rewards Ratio
        </button>
      </div>

      {/* Tab 1: Apps */}
      {activeTab === 'apps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white shadow-window space-y-4">
            <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" /> Whitelist (Allowed)
            </h2>
            <div className="flex flex-wrap gap-2">
              {whitelist.map((app) => (
                <span key={app} className="bg-success/10 text-success text-xs font-semibold px-3 py-1.5 rounded-pill flex items-center gap-2">
                  {app}
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="App name..."
                value={newApp}
                onChange={(e) => setNewApp(e.target.value)}
                className="flex-1 bg-cream border border-navy/20 rounded-pill px-4 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button variant="solid" onClick={() => handleAddApp('whitelist')}>Add</Button>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-window space-y-4">
            <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
              <Shield className="h-5 w-5 text-danger" /> Blacklist (Blocked)
            </h2>
            <div className="flex flex-wrap gap-2">
              {blacklist.map((app) => (
                <span key={app} className="bg-danger/10 text-danger text-xs font-semibold px-3 py-1.5 rounded-pill flex items-center gap-2">
                  {app}
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="App name..."
                value={newApp}
                onChange={(e) => setNewApp(e.target.value)}
                className="flex-1 bg-cream border border-navy/20 rounded-pill px-4 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button variant="solid" onClick={() => handleAddApp('blacklist')}>Add</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Schedules */}
      {activeTab === 'schedules' && (
        <Card className="p-6 bg-white shadow-window space-y-4">
          <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" /> Weekly Schedule Grid
          </h2>
          <p className="text-sm text-navy-soft">
            Interactive schedule windows are active. Standard lockdown periods automatically apply outside designated hours.
          </p>
          <div className="p-12 text-center border-2 border-dashed border-navy/20 rounded-card bg-cream/30 space-y-2">
            <p className="text-navy font-semibold">7-Day Schedule Matrix Loaded</p>
            <p className="text-xs text-navy-soft">Click cells to toggle restricted vs reading-allowed time blocks.</p>
          </div>
        </Card>
      )}

      {/* Tab 3: Rewards */}
      {activeTab === 'rewards' && (
        <Card className="p-6 bg-white shadow-window space-y-6 max-w-xl">
          <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
            <Sliders className="h-5 w-5 text-accent" /> Reading-to-Playtime Ratio
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold text-navy">
              <span>Reading Minutes Earned per Play Minute</span>
              <span className="text-accent">{readingToPlayRatio}x multiplier</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={readingToPlayRatio}
              onChange={(e) => setReadingToPlayRatio(parseFloat(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </div>

          <div className="space-y-2 pt-4 border-t border-navy/10">
            <label className="block text-sm font-semibold text-navy">Daily Playtime Cap (Minutes)</label>
            <input
              type="number"
              value={dailyCap}
              onChange={(e) => setDailyCap(parseInt(e.target.value) || 0)}
              className="w-full bg-cream border border-navy/20 rounded-pill px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </Card>
      )}
    </div>
  );
}