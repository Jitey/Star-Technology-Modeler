import React, { useState } from 'react'
import { useStore } from '../store/index.js'
import { getMachinesNeeded, getTotalThroughput, getOutputThroughput, formatRate, toPerSecond } from '../utils/calc.js'

const UNITS = [
  { value: 'per_second', label: '/s' },
  { value: 'per_minute', label: '/min' },
  { value: 'per_hour', label: '/h' },
]

function UtilBar({ pct }) {
  const clamped = Math.min(pct, 150)
  const color = pct > 100 ? 'var(--red)' : pct > 85 ? 'var(--accent)' : 'var(--green)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-0)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(clamped, 100)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color, minWidth: 42, textAlign: 'right' }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  )
}

function StepCard({ step, chain, index }) {
  const machines = useStore(s => s.machines)
  const recipes = useStore(s => s.recipes)
  const updateStep = useStore(s => s.updateStep)
  const removeStep = useStore(s => s.removeStep)
  const moveStep = useStore(s => s.moveStep)

  const machine = machines.find(m => m.id === step.machineId)
  const recipe = machine ? recipes.find(r => r.id === machine.recipeId) : null

  const targetRatePerSecond = step.targetRate
    ? toPerSecond(step.targetRate, step.targetUnit)
    : null

  // Calculate for each output
  const outputCalcs = recipe ? recipe.outputs.map(out => {
    const perMachine = getOutputThroughput(recipe, machine, out)
    const total = getTotalThroughput(recipe, machine, out)
    const needed = targetRatePerSecond ? getMachinesNeeded(recipe, machine, out, targetRatePerSecond) : null
    const utilization = targetRatePerSecond && total > 0 ? (targetRatePerSecond / total) * 100 : null
    return { out, perMachine, total, needed, utilization }
  }) : []

  return (
    <div className="step-card">
      <div className="step-number">{index + 1}</div>
      <div className="step-content">
        <div className="step-row-top">
          <input
            className="step-name-input"
            value={step.name}
            onChange={e => updateStep(chain.id, step.id, { name: e.target.value })}
            placeholder="Step name"
          />
          <div className="step-actions">
            <button className="btn-icon" disabled={index === 0} onClick={() => moveStep(chain.id, index, index - 1)} title="Move up">↑</button>
            <button className="btn-icon" disabled={index === chain.steps.length - 1} onClick={() => moveStep(chain.id, index, index + 1)} title="Move down">↓</button>
            <button className="btn-icon btn-icon-danger" onClick={() => removeStep(chain.id, step.id)} title="Remove">✕</button>
          </div>
        </div>

        <div className="step-fields">
          {/* Machine selector */}
          <div className="step-field">
            <label className="step-field-label">Machine</label>
            <select
              value={step.machineId || ''}
              onChange={e => updateStep(chain.id, step.id, { machineId: e.target.value || null })}
            >
              <option value="">— Select machine —</option>
              {machines.map(m => {
                const r = recipes.find(r => r.id === m.recipeId)
                return <option key={m.id} value={m.id}>{m.name} {r ? `(${r.name})` : ''}</option>
              })}
            </select>
          </div>

          {/* Target rate */}
          <div className="step-field">
            <label className="step-field-label">Target output rate</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="number"
                min="0"
                step="0.1"
                value={step.targetRate || ''}
                onChange={e => updateStep(chain.id, step.id, { targetRate: parseFloat(e.target.value) || null })}
                placeholder="e.g. 3"
                style={{ width: 90 }}
              />
              <select
                value={step.targetUnit}
                onChange={e => updateStep(chain.id, step.id, { targetUnit: e.target.value })}
                style={{ width: 72 }}
              >
                {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results panel */}
        {machine && recipe && (
          <div className="step-results">
            {outputCalcs.map(({ out, perMachine, total, needed, utilization }) => (
              <div key={out.id} className="result-output">
                <div className="result-output-header">
                  <span className="result-item-name">{out.name || '(unnamed)'}</span>
                  <span className="result-prob">{out.probability}% chance</span>
                </div>

                <div className="result-stats">
                  <div className="stat">
                    <span className="stat-label">Per machine</span>
                    <span className="stat-val mono">{formatRate(perMachine)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total ({machine.count}×)</span>
                    <span className="stat-val mono">{formatRate(total)}</span>
                  </div>
                  {needed !== null && (
                    <div className="stat highlight">
                      <span className="stat-label">Machines needed</span>
                      <span className="stat-val mono accent">{needed}</span>
                    </div>
                  )}
                  {needed !== null && machine.count < needed && (
                    <div className="bottleneck-warning">
                      ⚠ Bottleneck! Need {needed} but only {machine.count} configured
                    </div>
                  )}
                  {needed !== null && machine.count > needed && (
                    <div className="overcap-info">
                      ✓ {machine.count - needed} machine{machine.count - needed > 1 ? 's' : ''} spare
                    </div>
                  )}
                </div>

                {utilization !== null && (
                  <div style={{ marginTop: 8 }}>
                    <UtilBar pct={utilization} />
                  </div>
                )}
              </div>
            ))}

            {outputCalcs.length === 0 && (
              <div className="no-outputs">Recipe has no outputs defined.</div>
            )}
          </div>
        )}

        {!machine && (
          <div className="step-placeholder">Select a machine to see throughput calculations.</div>
        )}
      </div>

      <style>{`
        .step-card {
          display: flex; gap: 0;
          background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .step-number {
          width: 36px; flex-shrink: 0;
          background: var(--bg-3); display: flex; align-items: flex-start; justify-content: center;
          padding-top: 14px;
          font-size: 11px; font-weight: 700; font-family: var(--font-mono);
          color: var(--text-2); border-right: 1px solid var(--border);
        }
        .step-content { flex: 1; padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
        .step-row-top { display: flex; align-items: center; justify-content: space-between; }
        .step-name-input {
          background: transparent; border: none; border-bottom: 1px solid transparent;
          color: var(--text-0); font-size: 14px; font-weight: 600; font-family: var(--font-ui);
          padding: 2px 4px; outline: none; flex: 1;
        }
        .step-name-input:hover { border-bottom-color: var(--border); }
        .step-name-input:focus { border-bottom-color: var(--accent); }
        .step-actions { display: flex; gap: 4px; }
        .btn-icon {
          width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: var(--text-2); border: 1px solid var(--border);
          border-radius: var(--radius); transition: all 0.15s; font-family: var(--font-ui);
        }
        .btn-icon:hover:not(:disabled) { background: var(--bg-3); color: var(--text-0); }
        .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn-icon-danger:hover { background: var(--red-dim) !important; color: var(--red) !important; border-color: var(--red) !important; }
        .step-fields { display: flex; gap: 16px; flex-wrap: wrap; }
        .step-field { display: flex; flex-direction: column; gap: 6px; }
        .step-field-label { font-size: 11px; color: var(--text-1); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        select {
          background: var(--bg-0); border: 1px solid var(--border); border-radius: var(--radius);
          color: var(--text-0); padding: 6px 10px; font-size: 13px; font-family: var(--font-ui); outline: none;
        }
        select:focus { border-color: var(--accent); }
        .step-results { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; display: flex; flex-direction: column; gap: 12px; }
        .result-output { display: flex; flex-direction: column; gap: 8px; }
        .result-output + .result-output { border-top: 1px solid var(--border); padding-top: 12px; }
        .result-output-header { display: flex; align-items: center; gap: 10px; }
        .result-item-name { font-size: 13px; font-weight: 600; color: var(--green); font-family: var(--font-mono); }
        .result-prob { font-size: 11px; color: var(--text-2); }
        .result-stats { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .stat { display: flex; flex-direction: column; gap: 2px; }
        .stat-label { font-size: 10px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-val { font-size: 14px; color: var(--text-0); font-family: var(--font-mono); }
        .stat-val.accent { color: var(--accent); font-weight: 700; font-size: 18px; }
        .highlight { background: var(--accent-glow); border: 1px solid var(--accent-dim); border-radius: var(--radius); padding: 6px 10px; }
        .bottleneck-warning {
          font-size: 12px; color: var(--red); background: var(--red-dim);
          border: 1px solid var(--red); border-radius: var(--radius); padding: 4px 10px;
        }
        .overcap-info {
          font-size: 12px; color: var(--green); background: var(--green-dim);
          border: 1px solid var(--green); border-radius: var(--radius); padding: 4px 10px;
        }
        .step-placeholder { font-size: 12px; color: var(--text-2); font-style: italic; }
        .no-outputs { font-size: 12px; color: var(--text-2); font-style: italic; }
        .mono { font-family: var(--font-mono); }
      `}</style>
    </div>
  )
}

export default function ChainsView() {
  const chains = useStore(s => s.chains)
  const activeChainId = useStore(s => s.activeChainId)
  const addChain = useStore(s => s.addChain)
  const removeChain = useStore(s => s.removeChain)
  const updateChain = useStore(s => s.updateChain)
  const addStep = useStore(s => s.addStep)
  const setActiveChain = useStore(s => s.setActiveChain)

  const activeChain = chains.find(c => c.id === activeChainId) || chains[0] || null

  return (
    <div className="chains-layout">
      {/* Sidebar */}
      <div className="chains-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Chains</span>
          <button className="btn-icon-accent" onClick={addChain} title="New chain">+</button>
        </div>
        <div className="sidebar-list">
          {chains.map(c => (
            <div
              key={c.id}
              className={`sidebar-item ${activeChain?.id === c.id ? 'active' : ''}`}
              onClick={() => setActiveChain(c.id)}
            >
              <span className="sidebar-item-name">{c.name}</span>
              <span className="sidebar-item-count">{c.steps.length} steps</span>
              {chains.length > 1 && (
                <button className="sidebar-remove" onClick={e => { e.stopPropagation(); removeChain(c.id) }}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="chains-main">
        {activeChain ? (
          <>
            <div className="chain-toolbar">
              <input
                className="chain-name-input"
                value={activeChain.name}
                onChange={e => updateChain(activeChain.id, { name: e.target.value })}
                placeholder="Chain name"
              />
              <button className="btn-primary" onClick={() => addStep(activeChain.id)}>+ Add Step</button>
            </div>

            <div className="steps-list">
              {activeChain.steps.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">⛓</span>
                  <p>Add steps to model your production chain.<br />Each step is a machine with a recipe and a target output rate.</p>
                  <button className="btn-primary" onClick={() => addStep(activeChain.id)}>+ Add First Step</button>
                </div>
              )}
              {activeChain.steps.map((step, idx) => (
                <StepCard key={step.id} step={step} chain={activeChain} index={idx} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">⛓</span>
            <p>Create a chain to start modeling.</p>
            <button className="btn-primary" onClick={addChain}>+ New Chain</button>
          </div>
        )}
      </div>

      <style>{`
        .chains-layout { display: flex; height: 100%; overflow: hidden; }
        .chains-sidebar {
          width: 220px; flex-shrink: 0; background: var(--bg-1);
          border-right: 1px solid var(--border); display: flex; flex-direction: column;
        }
        .sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .sidebar-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-2); }
        .btn-icon-accent {
          width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: var(--accent); border: 1px solid var(--accent-dim);
          border-radius: var(--radius); transition: all 0.15s; background: var(--accent-glow);
        }
        .btn-icon-accent:hover { opacity: 0.8; }
        .sidebar-list { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 2px; }
        .sidebar-item {
          display: flex; align-items: center; gap: 6px; padding: 8px 10px;
          border-radius: var(--radius); cursor: pointer; transition: background 0.1s;
        }
        .sidebar-item:hover { background: var(--bg-3); }
        .sidebar-item.active { background: var(--accent-glow); border: 1px solid var(--accent-dim); }
        .sidebar-item-name { flex: 1; font-size: 13px; color: var(--text-0); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-item-count { font-size: 10px; color: var(--text-2); font-family: var(--font-mono); }
        .sidebar-remove {
          font-size: 10px; color: var(--text-2); padding: 1px 4px;
          border-radius: 3px; transition: all 0.15s; opacity: 0;
        }
        .sidebar-item:hover .sidebar-remove { opacity: 1; }
        .sidebar-remove:hover { background: var(--red-dim); color: var(--red); }
        .chains-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .chain-toolbar {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 14px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .chain-name-input {
          background: transparent; border: none; border-bottom: 1px solid transparent;
          color: var(--text-0); font-size: 18px; font-weight: 700; font-family: var(--font-ui);
          padding: 2px 4px; outline: none; flex: 1;
        }
        .chain-name-input:hover { border-bottom-color: var(--border); }
        .chain-name-input:focus { border-bottom-color: var(--accent); }
        .steps-list { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
        .btn-primary {
          background: var(--accent); color: #000; border-radius: var(--radius);
          padding: 7px 16px; font-size: 13px; font-weight: 700; font-family: var(--font-ui);
          transition: opacity 0.15s; flex-shrink: 0;
        }
        .btn-primary:hover { opacity: 0.85; }
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          flex: 1; gap: 12px; color: var(--text-2); padding: 40px; text-align: center;
        }
        .empty-icon { font-size: 36px; }
        .empty-state p { font-size: 13px; line-height: 1.7; max-width: 280px; }
      `}</style>
    </div>
  )
}
