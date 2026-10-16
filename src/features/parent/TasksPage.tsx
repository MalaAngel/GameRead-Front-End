import { useState } from 'react';
import { Card, Button, useToast } from '@/components/ui';
import { useChildren } from '@/hooks/queries';
import { Plus, BookOpen, Calendar } from 'lucide-react';

export function TasksPage() {
  const toast = useToast();
  const { data: children = [] } = useChildren();
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');

  // Sample tasks/readings data
  const [tasks, setTasks] = useState([
    { id: '1', title: 'The Magic Treehouse', child: 'Leo', dueDate: '2026-10-25', progress: 65, status: 'In Progress' },
    { id: '2', title: "Charlotte's Web", child: 'Emma', dueDate: '2026-10-30', progress: 30, status: 'Pending' },
    { id: '3', title: 'Treasure Island', child: 'Leo', dueDate: '2026-10-15', progress: 100, status: 'Completed' },
  ]);

  const filteredTasks = selectedChildFilter === 'all' 
    ? tasks 
    : tasks.filter(t => t.child.toLowerCase() === selectedChildFilter.toLowerCase());

  const handleAssignBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      title: newBookTitle,
      child: children[0]?.name || 'Child',
      dueDate: '2026-11-10',
      progress: 0,
      status: 'Pending',
    };

    setTasks([newTask, ...tasks]);
    toast.success(`Successfully assigned "${newBookTitle}"!`);
    setNewBookTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-card shadow-window">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Assigned Tasks</h1>
          <p className="text-sm text-navy-soft">Assign books, track reading progress, and set target minutes.</p>
        </div>
        <Button
          variant="primary"
          className="text-xs h-10"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Assign New Book
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-card shadow-window">
        <span className="text-sm font-medium text-navy">Filter by Child:</span>
        <select
          value={selectedChildFilter}
          onChange={(e) => setSelectedChildFilter(e.target.value)}
          className="bg-cream border border-navy/20 rounded-pill px-4 py-2 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All Children</option>
          {children.map((child: any) => (
            <option key={child.id} value={child.name}>{child.name}</option>
          ))}
        </select>
      </div>

      {/* Tasks Table */}
      <Card className="p-6 bg-white shadow-window overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-navy/10 text-xs uppercase tracking-wider text-navy-soft">
              <th className="pb-3 font-semibold">Book Title</th>
              <th className="pb-3 font-semibold">Child</th>
              <th className="pb-3 font-semibold">Due Date</th>
              <th className="pb-3 font-semibold">Progress</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10 text-sm">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-navy-soft">
                  No assigned tasks found matching the filter.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-cream/20 transition-colors">
                  <td className="py-4 font-medium text-navy flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-accent" /> {task.title}
                  </td>
                  <td className="py-4 text-navy-soft">{task.child}</td>
                  <td className="py-4 text-navy-soft flex items-center gap-1.5 mt-1">
                    <Calendar className="h-3.5 w-3.5" /> {task.dueDate}
                  </td>
                  <td className="py-4 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-navy/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-navy h-full rounded-full" style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-navy">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-semibold ${
                      task.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-blue/10 text-accent'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Button
                      variant="solid"
                      className="text-xs h-8"
                      onClick={() => toast.success(`Reminder sent for ${task.title}`)}
                    >
                      Remind
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Assign Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-white shadow-window w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-navy">Assign New Reading</h2>
            <p className="text-xs text-navy-soft">Select a book and set a target completion date.</p>

            <form onSubmit={handleAssignBook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-navy mb-1">Book Title</label>
                <input
                  type="text"
                  placeholder="e.g. Alice in Wonderland"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full bg-cream border border-navy/20 rounded-pill px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="solid" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Assign Book
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}