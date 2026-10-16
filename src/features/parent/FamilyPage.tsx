import { useState } from 'react';
import { Card, Button, StatusChip, useToast } from '@/components/ui';
import { useChildren } from '@/hooks/queries';
import { UserPlus, Shield, Trash2 } from 'lucide-react';

export function FamilyPage() {
  const toast = useToast();
  const { data: children = [] } = useChildren();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newChildName, setNewChildName] = useState('');

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    toast.success(`Successfully added ${newChildName}! Pair code generated.`);
    setNewChildName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Child Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-card shadow-window">
        <div>
          <h1 className="text-2xl font-semibold text-navy">My Family</h1>
          <p className="text-sm text-navy-soft">Manage connected child profiles, devices, and session controls.</p>
        </div>
        <Button
          variant="primary"
          className="text-xs h-10"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" /> Add Child Profile
        </Button>
      </div>

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.length === 0 ? (
          <Card className="p-8 bg-white shadow-window col-span-full text-center space-y-3">
            <p className="text-navy-soft text-sm">No child profiles found in your family group yet.</p>
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              Add Your First Child
            </Button>
          </Card>
        ) : (
          children.map((child: any) => (
            <Card key={child.id} className="p-6 bg-white shadow-window space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue/20 flex items-center justify-center font-bold text-navy text-lg">
                    {child.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-navy text-lg">{child.name}</h2>
                    <p className="text-xs text-navy-soft">Reading Level: {child.reading_level || 'Standard'}</p>
                  </div>
                </div>
                <StatusChip status={(child.status || 'online') as any} />
              </div>

              <div className="bg-cream/50 p-4 rounded-card border border-navy/10 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy-soft">Pairing Code:</span>
                  <span className="font-mono font-bold text-navy">482910</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-soft">Today's Read Time:</span>
                  <span className="font-semibold text-navy">35 mins</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy/10">
                <Button
                  variant="solid"
                  className="text-xs h-9"
                  onClick={() => toast.success(`Session paused for ${child.name}`)}
                >
                  <Shield className="h-3.5 w-3.5 mr-1.5" /> Pause Session
                </Button>
                <Button
                  variant="solid"
                  className="text-xs h-9 text-danger hover:bg-danger/10"
                  onClick={() => toast.error(`Remove flow initiated for ${child.name}`)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Child Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white shadow-window w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-navy">Add Child Profile</h2>
            <p className="text-xs text-navy-soft">Enter your child's name to generate a 6-digit family pairing code.</p>

            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-navy mb-1">Child Name</label>
                <input
                  type="text"
                  placeholder="e.g. Leo"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full bg-cream border border-navy/20 rounded-pill px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="solid"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Generate Code
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}