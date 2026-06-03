import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { MACHINE_TYPES } from '../templates/machineTypes';

export default function Sidebar() {
  const addSourceNode = useStore(s => s.addSourceNode);
  const addMachineNode = useStore(s => s.addMachineNode);
  const addOutputNode = useStore(s => s.addOutputNode);
  const nodes = useStore(s => s.nodes);

  const onDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('application/reactflow', id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const baseY = () => 80 + nodes.length * 60;

  return (
    <aside style={{ width: 220, background: 'var(--bg-1)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t0)', letterSpacing: 0.5 }}>
          ◈ <span style={{ color: 'var(--accent)' }}>Star</span> Tech
        </div>
        <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 2 }}>Drag or click to add</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {/* Sources */}
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t2)', letterSpacing: 1, textTransform: 'uppercase', padding: '6px 6px 4px', fontFamily: 'var(--mono)' }}>Sources</div>
        <SidebarBtn color="var(--green)" onClick={() => addSourceNode({ x: 80, y: baseY() })}>
          ◈ Input Source
        </SidebarBtn>

        {/* Machines */}
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t2)', letterSpacing: 1, textTransform: 'uppercase', padding: '12px 6px 4px', fontFamily: 'var(--mono)' }}>Machines</div>
        {MACHINE_TYPES.map(mt => (
          <SidebarBtn
            key={mt.id}
            color="var(--blue)"
            draggable
            onDragStart={e => onDragStart(e, mt.id)}
            onClick={() => addMachineNode(mt.id, { x: 340, y: baseY() })}
            badge={mt.defaultTier}
          >
            {mt.name}
          </SidebarBtn>
        ))}

        {/* Output */}
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t2)', letterSpacing: 1, textTransform: 'uppercase', padding: '12px 6px 4px', fontFamily: 'var(--mono)' }}>Outputs</div>
        <SidebarBtn color="var(--orange)" onClick={() => addOutputNode({ x: 680, y: baseY() })}>
          ⬡ Output Collector
        </SidebarBtn>
      </div>
    </aside>
  );
}

function SidebarBtn({ color, children, badge, onClick, draggable, onDragStart }: {
  color: string; children: React.ReactNode; badge?: string;
  onClick?: () => void; draggable?: boolean; onDragStart?: (e: React.DragEvent) => void;
}) {
  return (
    <button
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px', borderRadius: 'var(--r)', marginBottom: 2,
        fontSize: 12, color: 'var(--t1)', transition: 'all 0.1s',
        textAlign: 'left', cursor: draggable ? 'grab' : 'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-3)'; (e.currentTarget as HTMLElement).style.color = color; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--t1)'; }}
    >
      <span style={{ flex: 1 }}>{children}</span>
      {badge && <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--t2)', background: 'var(--bg-3)', padding: '1px 5px', borderRadius: 3 }}>{badge}</span>}
    </button>
  );
}
