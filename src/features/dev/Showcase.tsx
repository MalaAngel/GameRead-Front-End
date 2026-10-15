import { useState } from 'react';
import { Clock, Gamepad2, Plus } from 'lucide-react';
import {
  Avatar, BookCover, Button, Card, DataState, Input, Modal, Pill, ProgressBar, Select, Sidebar, StatTile,
  StatusChip, TabPanel, Tabs, Toggle, WindowFrame, useToast, type NavItem,
} from '@/components/ui';
import { useBooks, useCurrentReads, useStats, useWallet } from '@/hooks/queries';
import { useActiveChild } from '@/hooks/useActiveChild';
import { Link } from 'react-router-dom';

const nav: NavItem[] = [
  { label: 'Home', to: '/dev/components', end: true },
  { label: 'History', to: '/child/history' },
  { label: 'Assigned Tasks', to: '/child/tasks' },
];

/**
 * Component gallery (/dev/components): a living style guide and the visual check for the design tokens.
 * Shows the child-home composition from the slide built purely from shared components + service hooks.
 */
export function Showcase() {
  const { childId } = useActiveChild();
  const reads = useCurrentReads(childId);
  const wallet = useWallet(childId);
  const stats = useStats(childId);
  const books = useBooks();
  const toast = useToast();
  const [tab, setTab] = useState('a');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(10);
  const [on, setOn] = useState(true);

  return (
    <div className="space-y-10 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">GameRead component gallery</h1>
        <Link to="/" className="underline">Back to app</Link>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Child home composition (slide 1)</h2>
        <WindowFrame tone="pink">
          <div className="flex h-full">
            <Sidebar items={nav} settingsTo="/child/settings" />
            <div className="min-w-0 flex-1 space-y-4 px-6 pb-6 pt-14">
              <Card className="py-5">
                <div className="mb-2 text-center text-sm uppercase tracking-wide">Read–Play Converter</div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                  <StatTile label="Hours read" minutes={wallet.data?.total_read_minutes ?? 0} icon={<Clock className="h-16 w-16" strokeWidth={1.5} />} />
                  <svg width="110" height="30" viewBox="0 0 110 30" aria-hidden><path d="M0 15h96M84 3l14 12-14 12" stroke="#0B4470" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <StatTile label="Play hours unlocked" minutes={wallet.data?.total_earned_minutes ?? 0} icon={<Gamepad2 className="h-16 w-16" strokeWidth={1.5} />} />
                </div>
              </Card>
              <Card className="flex items-center gap-6">
                <div className="w-28 text-xl font-light uppercase leading-tight">Current Reads</div>
                <DataState isLoading={reads.isLoading} error={reads.error} isEmpty={reads.data?.length === 0}>
                  <div className="flex items-center gap-5">
                    {reads.data?.map((b) => <BookCover key={b.id} book={b} />)}
                    <button type="button" className="flex flex-col items-center gap-1 text-sm uppercase" aria-label="More books">
                      <Plus className="h-14 w-14 rounded-full border-2 border-navy p-2" /> More
                    </button>
                  </div>
                </DataState>
              </Card>
            </div>
          </div>
        </WindowFrame>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card tone="cream" className="space-y-4">
          <h2 className="text-xl font-semibold">Buttons, pills, status</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button><Button variant="solid">Solid</Button><Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button><Button loading>Loading</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>Blue</Pill><Pill tone="pink">Pink</Pill><Pill tone="ok">OK</Pill><Pill tone="warn">Warn</Pill><Pill tone="danger">Danger</Pill>
            <StatusChip status="reading" /><StatusChip status="locked" /><StatusChip status="playing" /><StatusChip status="offline" />
          </div>
          <div className="flex items-center gap-4">
            <Avatar name="Victoria" size={72} />
            <Toggle checked={on} onChange={setOn} label="Example toggle" />
            <Button size="sm" onClick={() => toast.success('Saved (toast example)')}>Toast</Button>
            <Button size="sm" variant="solid" onClick={() => setOpen(true)}>Modal</Button>
          </div>
        </Card>

        <Card tone="cream" className="space-y-4">
          <h2 className="text-xl font-semibold">Forms</h2>
          <Input label="Username" placeholder="e.g. victoria-parent" hint="Shown to your family" />
          <Input label="Password" type="password" error="Use at least 8 characters." />
          <Select label="Age band" options={[{ value: '7-9', label: '7–9' }, { value: '10-12', label: '10–12' }]} />
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Progress and tabs</h2>
          <ProgressBar value={page} max={20} min={1} onChange={setPage} label="Page" />
          <Pill className="mx-auto flex w-fit">{page}/20</Pill>
          <Tabs tabs={[{ id: 'a', label: 'Playtime' }, { id: 'b', label: 'History' }, { id: 'c', label: 'Alerts', badge: 2 }]} value={tab} onChange={setTab} />
          <TabPanel id="a" active={tab === 'a'}>Playtime panel</TabPanel>
          <TabPanel id="b" active={tab === 'b'}>History panel</TabPanel>
          <TabPanel id="c" active={tab === 'c'}>Alerts panel</TabPanel>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-semibold">Book covers (generated)</h2>
          <div className="flex flex-wrap gap-4">
            {books.data?.slice(0, 6).map((b) => <BookCover key={b.id} book={b} size="sm" />)}
          </div>
          <p className="text-sm">Weekly minutes (from stats service): <strong>{stats.data?.weekly_minutes ?? '…'}</strong></p>
        </Card>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Modal example" footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
        Focus is trapped, Esc closes, and the backdrop dismisses.
      </Modal>
    </div>
  );
}
