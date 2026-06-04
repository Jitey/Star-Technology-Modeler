import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CustomNodeData } from '../types';

export default memo(function OutputNode({ data, selected }: NodeProps) {
  const d = data as Extract<CustomNodeData, { type: 'output' }>;
  const calc = d.calculation;

  return (
    <div style={{
      background: 'var(--bg-2)', border: `1.5px solid ${selected ? 'var(--orange)' : 'var(--border-b)'}`,
      borderRadius: 'var(--r-lg)', padding: '10px 14px', minWidth: 180, position: 'relative',
    }}>
      <Handle type="target" position={Position.Left} id="input" />
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--mono)' }}>
        ⬡ Output
      </div>
      {calc && calc.inputRates.length > 0
        ? calc.inputRates.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, gap: 12 }}>
              <span style={{ color: 'var(--t0)', fontFamily: 'var(--mono)' }}>{r.itemName}</span>
              <span style={{ color: 'var(--orange)', fontFamily: 'var(--mono)' }}>{r.rate.toFixed(4)}/s</span>
            </div>
          ))
        : <div style={{ fontSize: 11, color: 'var(--t2)', fontStyle: 'italic' }}>No input connected</div>
      }
    </div>
  );
});
