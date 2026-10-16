import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { Card, Button, StatusChip, Duration } from '@/components/ui';
import { useCurrentUser, useChildren } from '@/hooks/queries';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: children = [] } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || '');

  // Sample assigned readings data
  const readings = [
    { id: '1', title: 'The Magic Treehouse', dueDate: '2026-10-25', progress: 65 },
    { id: '2', title: 'Charlotte\'s Web', dueDate: '2026-10-30', progress: 30 },
  ];

  const activeChild = children.find((c) => c.id === selectedChildId) || children[0];

  // Chart data reflecting monthly reading activity
  const chartData = [
    { month: 'June', pages: 23, minutes: 180 },
    { month: 'July', pages: 30, minutes: 240 },
    { month: 'August', pages: 19, minutes: 150 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar / Child Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-card shadow-window">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue/20 flex items-center justify-center font-bold text-navy text-lg">
            {activeChild?.name ? activeChild.name.substring(0, 2).toUpperCase() : 'CH'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-navy">
              Welcome back, {user?.username || 'Parent'}
            </h1>
            <p className="text-sm text-navy-soft">
              Monitoring {activeChild?.name || 'Child'} • Level: {(activeChild as any)?.reading_level || 'Standard'}
            </p>
          </div>
        </div>

        {children.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-navy">Active Child:</span>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="bg-cream border border-navy/20 rounded-pill px-4 py-2 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Hours Tile */}
        <Card className="p-6 bg-white shadow-window flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-navy-soft font-semibold">Weekly Reading Time</p>
            <div className="text-3xl font-bold text-navy mt-1">
              <Duration minutes={145} />
            </div>
            <p className="text-xs text-accent mt-1">+12% compared to last week</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue/20 flex items-center justify-center text-accent">
            <Clock className="h-6 w-6" />
          </div>
        </Card>

        {/* Live Status Tile */}
        <Card className="p-6 bg-white shadow-window flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-navy-soft font-semibold">Device Status</p>
            <div className="mt-2">
              <StatusChip status={(activeChild as any)?.status || 'idle'} />
            </div>
            <p className="text-xs text-navy-soft mt-1">Last active recently</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-cream flex items-center justify-center text-navy">
            <BookOpen className="h-6 w-6" />
          </div>
        </Card>

        {/* Alerts Tile */}
        <Card 
          className="p-6 bg-white shadow-window flex items-center justify-between cursor-pointer hover:border-accent transition-colors"
          onClick={() => navigate('/parent/playtime?tab=alerts')}
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-navy-soft font-semibold">Security Alerts</p>
            <div className="text-3xl font-bold text-danger mt-1">1</div>
            <p className="text-xs text-navy-soft mt-1">Tap to review tamper logs</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Recharts Analytics Section */}
      <Card className="p-6 bg-white shadow-window">
        <h2 className="text-lg font-semibold text-navy mb-4">Monthly Pages Read Trend</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" stroke="#1E293B" fontSize={12} />
              <YAxis stroke="#1E293B" fontSize={12} />
              <Tooltip />
              <Bar dataKey="pages" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Assigned Readings Shelf */}
      <Card className="p-6 bg-white shadow-window">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy">Assigned Readings Shelf</h2>
          <Button
            variant="primary"
            className="text-xs h-9"
            onClick={() => navigate('/parent/tasks')}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Reading
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {readings.length === 0 ? (
            <p className="text-sm text-navy-soft col-span-full py-8 text-center">
              No books currently assigned. Click '+ Add Reading' to assign a book.
            </p>
          ) : (
            readings.map((book: any) => (
              <div key={book.id} className="border border-navy/10 rounded-card p-4 bg-cream/30 space-y-2">
                <h3 className="font-semibold text-navy">{book.title}</h3>
                <p className="text-xs text-navy-soft">Due: {book.dueDate}</p>
                <div className="w-full bg-navy/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-navy h-full rounded-full" style={{ width: `${book.progress}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}