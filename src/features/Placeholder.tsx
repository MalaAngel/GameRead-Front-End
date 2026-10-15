import { useNavigate } from 'react-router-dom';
import { Card, WindowFrame } from '@/components/ui';

/** Temporary stand-in so every route is navigable from day one. */
export function Placeholder({ title, phase, framed }: { title: string; phase: string; framed?: boolean }) {
  const navigate = useNavigate();
  const body = (
    <Card tone="cream" className="m-8">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-navy-soft">Screen coming in {phase}.</p>
    </Card>
  );
  if (framed) {
    return <WindowFrame tone="cream" onClose={() => navigate('/')}>{body}</WindowFrame>;
  }
  return body;
}
