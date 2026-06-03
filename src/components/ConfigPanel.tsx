import { useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { MACHINE_TYPES } from '../templates/machineTypes';
import { VOLTAGE_TIERS, type VoltageTier, type CustomNodeData, type SourceOutput } from '../types';
import { getRecipesForType, findMatchingRecipes } from '../templates/recipes';
import { X, Trash2 } from 'lucide-react';

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  panel: { width: 300, background: 'var(--bg-1)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' as const, height: '100%', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 },
  body: { flex: 1, overflowY: 'auto' as const, padding: 14, display: 'flex', flexDirection: 'column' as const, gap: 14 },
  section: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  label: { fontSize: 10, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase' as const, letterSpacing: 0.8, fontFamily: 'var(--mono)' },
  input: { background: 'var(--bg-0)', border: '1px solid var(--border-b)', borderRadius: 'var(--r)', color: 'var(--t0)', padding: '6px 10px', fontSize: 12, fontFamily: 'var(--mono)', outline: 'none', width: '100%' },
  row: { display: 'flex', gap: 6, alignItems: 'center' },
  chip: (active: boolean, activeColor = '#3b6fd4') => ({
    padding: '4px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--mono)' as const,
    border: `1px solid ${active ? activeColor : 'var(--border-b)'}`,
    background: active ? `${activeColor}22` : 'var(--bg-3)',
    color: active ? activeColor : 'var(--t2)',
    cursor: 'pointer', transition: 'all 0.1s',
  }),
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={S.section}><div style={S.label}>{label}</div>{children}</div>;
}

// ─── Source panel ─────────────────────────────────────────────────────────────
function SourcePanel({ nodeId, data }: { nodeId: string; data: Extract<CustomNodeData, { type: 'source' }> }) {
  const updateNodeData = useStore(s => s.updateNodeData);
  const removeSelectedNode = useStore(s => s.removeSelectedNode);
  const setSelectedNode = useStore(s => s.setSelectedNode);

  const setOutputs = (outputs: SourceOutput[]) => updateNodeData(nodeId, { ...data, config: { outputs } } as any);

  const addOutput = () => setOutputs([...data.config.outputs, { itemName: 'new item', amount: 1, probability: 100, interval: 8 }]);
  const removeOutput = (i: number) => setOutputs(data.config.outputs.filter((_, idx) => idx !== i));
  const updateOutput = (i: number, patch: Partial<SourceOutput>) => {
    const next = [...data.config.outputs];
    next[i] = { ...next[i], ...patch };
    setOutputs(next);
  };

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <span style={{ fontWeight: 700, color: 'var(--green)' }}>◈ Input Source</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={removeSelectedNode} style={{ padding: 4, borderRadius: 4, color: 'var(--red)' }}><Trash2 size={13} /></button>
          <button onClick={() => setSelectedNode(null)} style={{ padding: 4, borderRadius: 4, color: 'var(--t2)' }}><X size={13} /></button>
        </div>
      </div>
      <div style={S.body}>
        {data.config.outputs.map((o, i) => (
          <div key={i} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Output #{i + 1}</span>
              <button onClick={() => removeOutput(i)} style={{ color: 'var(--t2)' }}><X size={11} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="Item">
                <input style={S.input} value={o.itemName} onChange={e => updateOutput(i, { itemName: e.target.value })} />
              </Field>
              <Field label="Amount">
                <input type="number" style={S.input} value={o.amount} min={0.1} step={0.5} onChange={e => updateOutput(i, { amount: parseFloat(e.target.value) || 0 })} />
              </Field>
              <Field label="Probability %">
                <input type="number" style={S.input} value={o.probability} min={0} max={100} onChange={e => updateOutput(i, { probability: Math.min(100, parseFloat(e.target.value) || 0) })} />
              </Field>
              <Field label="Interval (s)">
                <input type="number" style={S.input} value={o.interval} min={0.1} step={0.25} onChange={e => updateOutput(i, { interval: parseFloat(e.target.value) || 1 })} />
              </Field>
            </div>
            <div style={{ marginTop: 8, textAlign: 'right', fontSize: 11, color: 'var(--green)', fontFamily: 'var(--mono)' }}>
              → {(o.amount * (o.probability / 100) / o.interval).toFixed(4)}/s
            </div>
          </div>
        ))}
        <button onClick={addOutput} style={{ border: '1px dashed var(--border-b)', borderRadius: 'var(--r)', padding: '8px', fontSize: 12, color: 'var(--t2)', width: '100%' }}>
          + Add Output
        </button>
      </div>
    </div>
  );
}

// ─── Machine panel ────────────────────────────────────────────────────────────
function MachinePanel({ nodeId, data }: { nodeId: string; data: Extract<CustomNodeData, { type: 'machine' }> }) {
  const { config } = data;
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const updateNodeData = useStore(s => s.updateNodeData);
  const removeSelectedNode = useStore(s => s.removeSelectedNode);
  const setSelectedNode = useStore(s => s.setSelectedNode);
  const mt = MACHINE_TYPES.find(t => t.id === config.machineTypeId);

  // What items are flowing into this node
  const incomingItems = useMemo(() => {
    const flows: string[] = [];
    for (const edge of edges.filter(e => e.target === nodeId)) {
      const src = nodes.find(n => n.id === edge.source);
      if (!src) continue;
      if (src.data.type === 'source') flows.push(...src.data.config.outputs.map((o: any) => o.itemName));
      else if (src.data.type === 'machine' && src.data.calculation) flows.push(...src.data.calculation.outputRates.map((r: any) => r.itemName));
    }
    return [...new Set(flows)];
  }, [nodes, edges, nodeId]);

  // Recipes: all for this machine type, filtered by incoming if any
  const allRecipes = useMemo(() => getRecipesForType(config.machineTypeId), [config.machineTypeId]);
  const matchingRecipes = useMemo(() => incomingItems.length > 0 ? findMatchingRecipes(config.machineTypeId, incomingItems) : allRecipes, [config.machineTypeId, incomingItems, allRecipes]);

  const update = useCallback((patch: any) => updateNodeData(nodeId, { ...data, config: { ...config, ...patch } } as any), [data, config, nodeId, updateNodeData]);

  const calc = data.calculation;

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--blue)', fontSize: 13 }}>{mt?.name ?? 'Machine'}</div>
          <div style={{ fontSize: 10, color: 'var(--t2)', fontFamily: 'var(--mono)' }}>{nodeId}</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={removeSelectedNode} style={{ padding: 4, borderRadius: 4, color: 'var(--red)' }}><Trash2 size={13} /></button>
          <button onClick={() => setSelectedNode(null)} style={{ padding: 4, borderRadius: 4, color: 'var(--t2)' }}><X size={13} /></button>
        </div>
      </div>
      <div style={S.body}>

        {/* Incoming items indicator */}
        {incomingItems.length > 0 && (
          <Field label="Incoming items">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {incomingItems.map(item => (
                <span key={item} style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--green)', background: 'var(--green-dim)', border: '1px solid rgba(41,212,154,0.3)', borderRadius: 4, padding: '2px 8px' }}>{item}</span>
              ))}
            </div>
          </Field>
        )}

        {/* Recipe selector */}
        <Field label={incomingItems.length > 0 ? `Recipe (filtered by input)` : 'Recipe (all)'}>
          {matchingRecipes.length === 0
            ? <div style={{ fontSize: 11, color: 'var(--t2)', fontStyle: 'italic' }}>No matching recipes. Check your connections.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {matchingRecipes.map(r => {
                  const isSelected = config.selectedRecipeId === r.id;
                  const isMatch = incomingItems.length > 0 && r.inputs.some(i => incomingItems.includes(i.itemName));
                  return (
                    <button key={r.id}
                      onClick={() => update({ selectedRecipeId: r.id })}
                      style={{
                        textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--r)',
                        border: `1px solid ${isSelected ? 'var(--accent)' : isMatch ? 'rgba(41,212,154,0.3)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--accent-glow)' : isMatch ? 'var(--green-dim)' : 'var(--bg-2)',
                        color: isSelected ? 'var(--accent)' : 'var(--t0)',
                        fontSize: 12, transition: 'all 0.1s',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 2 }}>
                        {r.inputs.map(i => `${i.amount}× ${i.itemName}`).join(' + ')} → {r.outputs.map(o => `${o.amount}× ${o.itemName}${o.probability < 100 ? ` (${o.probability}%)` : ''}`).join(', ')}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--t2)' }}>{r.duration}s · {r.baseTier}</div>
                    </button>
                  );
                })}
                {config.selectedRecipeId && (
                  <button onClick={() => update({ selectedRecipeId: null })} style={{ fontSize: 11, color: 'var(--t2)', padding: '4px', textAlign: 'left' }}>✕ Clear selection</button>
                )}
              </div>
          }
        </Field>

        {/* Voltage tier */}
        <Field label="Voltage Tier">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {VOLTAGE_TIERS.map(tier => (
              <button key={tier} style={S.chip(config.voltageTier === tier, 'var(--blue)')} onClick={() => update({ voltageTier: tier })}>{tier}</button>
            ))}
          </div>
        </Field>

        {/* Parallel */}
        {mt?.supportsParallel && (
          <Field label="Parallel Hatch">
            <input type="number" style={S.input} value={config.parallelCount} min={1} max={256} onChange={e => update({ parallelCount: parseInt(e.target.value) || 1 })} />
          </Field>
        )}

        {/* Results */}
        {calc && (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontFamily: 'var(--mono)' }}>Results</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <ResultRow label="Machines needed" value={String(calc.machinesNeeded)} color={calc.isBottleneck ? 'var(--red)' : 'var(--accent)'} />
              <ResultRow label="Effective duration" value={`${calc.effectiveDuration.toFixed(3)}s`} />
              <ResultRow label="Utilization" value={`${(calc.utilization * 100).toFixed(1)}%`} color={calc.utilization > 0.99 ? 'var(--red)' : 'var(--green)'} />
              {calc.outputRates.map((r, i) => <ResultRow key={i} label={`→ ${r.itemName}`} value={`${r.rate.toFixed(4)}/s`} color="var(--green)" />)}
              {calc.inputRates.map((r, i) => <ResultRow key={i} label={`← ${r.itemName}`} value={`${r.rate.toFixed(4)}/s`} color="var(--blue)" />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({ label, value, color = 'var(--t0)' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--t1)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', color }}>{value}</span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ConfigPanel() {
  const nodes = useStore(s => s.nodes);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) return null;

  const { data } = selectedNode;
  if (data.type === 'source') return <SourcePanel nodeId={selectedNode.id} data={data} />;
  if (data.type === 'machine') return <MachinePanel nodeId={selectedNode.id} data={data} />;
  return null;
}
