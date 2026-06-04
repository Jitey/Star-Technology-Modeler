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

  const inputCount = recipe ? recipe.inputs.length : 1;
  const outputCount = recipe ? recipe.outputs.length : 1;
  const maxRows = Math.max(inputCount, outputCount);

  return (
    <div style={{
      background: 'var(--bg-2)', border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--r-lg)', padding: '10px 14px', minWidth: 260, position: 'relative',
      boxShadow: selected ? `0 0 0 1px var(--accent)` : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingLeft: 6 }}>
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

      {/* Recipe name */}
      {recipe ? (
        <div style={{ fontSize: 11, color: 'var(--t0)', marginBottom: 6, fontFamily: 'var(--mono)', paddingLeft: 6 }}>
          {recipe.name}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: 'var(--t2)', fontStyle: 'italic', marginBottom: 6, paddingLeft: 6 }}>
          Connecte un input pour assigner une recette
        </div>
      )}

      {/* I/O rows with handles */}
      {recipe ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 6 }}>
          {Array.from({ length: maxRows }).map((_, i) => {
            const inp = recipe.inputs[i] ?? null;
            const out = recipe.outputs[i] ?? null;
            const inpRate = inp ? calc?.inputRates.find(r => r.itemName === inp.itemName) : null;
            const outRate = out ? calc?.outputRates.find(r => r.itemName === out.itemName) : null;

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, position: 'relative', minHeight: 20 }}>
                {/* Input side */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--t2)', fontFamily: 'var(--mono)' }}>
                  {inp && (
                    <>
                      <Handle type="target" position={Position.Left} id={inp.itemName} style={{ left: -5 }} />
                      <span style={{ color: 'var(--t0)' }}>{inp.itemName}</span>
                      {inpRate && <span style={{ color: 'var(--blue)', fontSize: 10 }}>{inpRate.rate.toFixed(3)}/s</span>}
                    </>
                  )}
                </div>

                {/* Arrow */}
                <span style={{ color: 'var(--t2)' }}>→</span>

                {/* Output side */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, color: 'var(--t2)', fontFamily: 'var(--mono)', textAlign: 'right' }}>
                  {out && (
                    <>
                      {outRate && <span style={{ color: 'var(--green)', fontSize: 10 }}>{outRate.rate.toFixed(3)}/s</span>}
                      <span style={{ color: 'var(--t0)' }}>{out.itemName}</span>
                      <Handle type="source" position={Position.Right} id={out.itemName} style={{ right: -5 }} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single generic handles when no recipe selected */
        <div style={{ position: 'relative', minHeight: 1 }}>
          <Handle type="target" position={Position.Left} id="input" style={{ left: -5 }} />
          <Handle type="source" position={Position.Right} id="output" style={{ right: -5 }} />
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
          <UtilBar pct={calc.utilization * 100} />
        </div>
      )}
    </div>
  );
});
