import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CustomNodeData } from '../types';
import { MACHINE_TYPES } from '../templates/machineTypes';
import { getRecipeById } from '../templates/recipes';

function UtilBar({ pct }: { pct: number }) {
  const color = pct > 100 ? 'var(--red)' : pct > 85 ? 'var(--accent)' : 'var(--green)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
      <div style={{ flex: 1, height: 3, background: 'var(--bg-0)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color, minWidth: 38, textAlign: 'right' }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

export default memo(function MachineNode({ data, selected }: NodeProps) {
  const d = data as Extract<CustomNodeData, { type: 'machine' }>;
  const { config } = d;
  const mt = MACHINE_TYPES.find(t => t.id === config.machineTypeId);
  const recipe = config.selectedRecipeId ? getRecipeById(config.selectedRecipeId) : null;
  const calc = d.calculation;
  const isBottleneck = calc?.isBottleneck;

  const borderColor = selected ? 'var(--accent)' : isBottleneck ? 'var(--red)' : recipe ? 'var(--blue-dim)' : 'var(--border-b)';

  return (
    <div style={{
      background: 'var(--bg-2)', border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--r-lg)', padding: '10px 14px', minWidth: 220,
      boxShadow: selected ? `0 0 0 1px var(--accent)` : 'none',
    }}>
      <Handle type="target" position={Position.Left} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', fontFamily: 'var(--mono)' }}>
          {mt?.name ?? 'Machine'}
        </span>
        <span style={{ fontSize: 10, background: 'var(--bg-3)', color: 'var(--t1)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--mono)' }}>
          {config.voltageTier}
        </span>
        {config.parallelCount > 1 && (
          <span style={{ fontSize: 10, background: 'var(--accent-glow)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--accent-dim)', fontFamily: 'var(--mono)' }}>
            ×{config.parallelCount}
          </span>
        )}
      </div>

      {/* Recipe */}
      {recipe ? (
        <div style={{ fontSize: 11, color: 'var(--t0)', marginBottom: 6, fontFamily: 'var(--mono)' }}>
          {recipe.name}
          <div style={{ color: 'var(--t2)', marginTop: 2 }}>
            {recipe.inputs.map(i => i.itemName).join(', ')} → {recipe.outputs.map(o => o.itemName).join(', ')}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: 'var(--t2)', fontStyle: 'italic', marginBottom: 6 }}>
          Connecte un input pour assigner une recette
        </div>
      )}

      {/* Calc results */}
      {calc && recipe && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--t1)' }}>Machines needed</span>
            <span style={{ color: isBottleneck ? 'var(--red)' : 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 700 }}>
              {calc.machinesNeeded}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--t1)' }}>Duration</span>
            <span style={{ color: 'var(--t0)', fontFamily: 'var(--mono)' }}>{calc.effectiveDuration.toFixed(3)}s</span>
          </div>
          {calc.outputRates.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: 'var(--t1)' }}>{r.itemName}</span>
              <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)' }}>{r.rate.toFixed(4)}/s</span>
            </div>
          ))}
          <UtilBar pct={calc.utilization * 100} />
        </div>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  );
});
