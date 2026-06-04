import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CustomNodeData, SourceOutput } from '../types';

export default memo(function SourceNode({ data, selected }: NodeProps) {
  const d = data as Extract<CustomNodeData, { type: 'source' }>;
  const outputs = d.config.outputs;

  return (
    <div style={{
      background: 'var(--bg-2)', border: `1.5px solid ${selected ? 'var(--green)' : 'var(--border-b)'}`,
      borderRadius: 'var(--r-lg)', padding: '10px 14px', minWidth: 180, position: 'relative',
      boxShadow: selected ? '0 0 0 1px var(--green)' : 'none',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--mono)' }}>
        ◈ Source
      </div>
      {outputs.length === 0
        ? <div style={{ fontSize: 11, color: 'var(--t2)', fontStyle: 'italic' }}>No outputs (configure →)</div>
        : outputs.map((o: SourceOutput, i: number) => (
            <div key={i} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, gap: 12 }}>
              <span style={{ color: 'var(--t0)', fontFamily: 'var(--mono)' }}>{o.itemName}</span>
              <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)' }}>
                {(o.amount * (o.probability / 100) / o.interval).toFixed(3)}/s
              </span>
              <Handle type="source" position={Position.Right} id={o.itemName} style={{ right: -5 }} />
            </div>
          ))
      }
    </div>
  );
});
