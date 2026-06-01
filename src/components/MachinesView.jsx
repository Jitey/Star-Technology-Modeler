import React, { useState } from 'react'
import { useStore } from '../store/index.js'

export default function MachinesView() {
  const machines = useStore(s => s.machines)
  const recipes = useStore(s => s.recipes)
  const addMachine = useStore(s => s.addMachine)
  const removeMachine = useStore(s => s.removeMachine)
  const updateMachine = useStore(s => s.updateMachine)
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="view-layout">
      <div className="view-toolbar">
        <h2 className="view-title">Machines</h2>
        <button className="btn-primary" onClick={addMachine}>+ New Machine</button>
      </div>

      {machines.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">⚙</span>
          <p>No machines yet. A machine links a recipe with speed, parallelism and count modifiers.</p>
        </div>
      )}

      <div className="card-list">
        {machines.map(machine => {
          const recipe = recipes.find(r => r.id === machine.recipeId)
          const effectiveCycle = recipe
            ? ((recipe.cycleTime * machine.timeMultiplier) / machine.speedMultiplier).toFixed(2)
            : null

          return (
            <div key={machine.id} className="machine-card">
              <div className="machine-header" onClick={() => setExpandedId(expandedId === machine.id ? null : machine.id)}>
                <div className="machine-header-left">
                  <span className="expand-arrow">{expandedId === machine.id ? '▾' : '▸'}</span>
                  <input
                    className="inline-name-input"
                    value={machine.name}
                    onChange={e => updateMachine(machine.id, { name: e.target.value })}
                    onClick={e => e.stopPropagation()}
                    placeholder="Machine name"
                  />
                  {recipe && (
                    <span className="machine-recipe-badge">{recipe.name}</span>
                  )}
                </div>
                <div className="machine-header-right">
                  {effectiveCycle && (
                    <span className="effective-cycle">
                      <span className="eff-label">Effective</span>
                      <span className="eff-val">{effectiveCycle}s</span>
                    </span>
                  )}
                  <button className="btn-danger-sm" onClick={e => { e.stopPropagation(); removeMachine(machine.id) }}>✕</button>
                </div>
              </div>

              {expandedId === machine.id && (
                <div className="machine-body">
                  <div className="machine-grid">
                    {/* Recipe */}
                    <div className="field-group">
                      <label className="field-label">Recipe</label>
                      <select
                        value={machine.recipeId || ''}
                        onChange={e => updateMachine(machine.id, { recipeId: e.target.value || null })}
                      >
                        <option value="">— Select recipe —</option>
                        {recipes.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Count */}
                    <div className="field-group">
                      <label className="field-label">Number of machines</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={machine.count}
                        onChange={e => updateMachine(machine.id, { count: Math.max(1, parseInt(e.target.value) || 1) })}
                        style={{ width: 80 }}
                      />
                    </div>

                    {/* Parallel slots */}
                    <div className="field-group">
                      <label className="field-label">Parallel slots <span className="field-hint">(simultaneous recipes)</span></label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={machine.parallelSlots}
                        onChange={e => updateMachine(machine.id, { parallelSlots: Math.max(1, parseInt(e.target.value) || 1) })}
                        style={{ width: 80 }}
                      />
                    </div>

                    {/* Speed multiplier */}
                    <div className="field-group">
                      <label className="field-label">Speed multiplier <span className="field-hint">(divides cycle time)</span></label>
                      <div className="input-row">
                        <input
                          type="number"
                          min="0.01"
                          step="0.1"
                          value={machine.speedMultiplier}
                          onChange={e => updateMachine(machine.id, { speedMultiplier: Math.max(0.01, parseFloat(e.target.value) || 1) })}
                          style={{ width: 80 }}
                        />
                        <span className="unit">×</span>
                      </div>
                    </div>

                    {/* Time multiplier */}
                    <div className="field-group">
                      <label className="field-label">Time multiplier <span className="field-hint">(multiplies cycle time, e.g. 1.6 = +60%)</span></label>
                      <div className="input-row">
                        <input
                          type="number"
                          min="0.01"
                          step="0.05"
                          value={machine.timeMultiplier}
                          onChange={e => updateMachine(machine.id, { timeMultiplier: Math.max(0.01, parseFloat(e.target.value) || 1) })}
                          style={{ width: 80 }}
                        />
                        <span className="unit">×</span>
                      </div>
                    </div>
                  </div>

                  {/* Live preview */}
                  {recipe && (
                    <div className="machine-preview">
                      <div className="preview-title">Throughput per machine</div>
                      <div className="preview-outputs">
                        {recipe.outputs.map(out => {
                          const perCycle = out.amount * (out.probability / 100) * machine.parallelSlots
                          const cycleTime = (recipe.cycleTime * machine.timeMultiplier) / machine.speedMultiplier
                          const rate = perCycle / cycleTime
                          const ratePerMin = rate * 60
                          return (
                            <div key={out.id} className="preview-row">
                              <span className="preview-item">{out.name || '(unnamed)'}</span>
                              <span className="preview-prob">{out.probability}%</span>
                              <span className="preview-rate">
                                {rate.toFixed(4)}/s
                                <span className="preview-rate-alt">= {ratePerMin.toFixed(2)}/min</span>
                              </span>
                              <span className="preview-total">
                                × {machine.count} = <strong>{(rate * machine.count).toFixed(4)}/s</strong>
                              </span>
                            </div>
                          )
                        })}
                        {recipe.inputs.map(inp => {
                          const cycleTime = (recipe.cycleTime * machine.timeMultiplier) / machine.speedMultiplier
                          const rate = (inp.amount * machine.parallelSlots) / cycleTime
                          return (
                            <div key={inp.id} className="preview-row input-row-preview">
                              <span className="preview-item input-item">{inp.name || '(unnamed)'}</span>
                              <span className="preview-prob">consumed</span>
                              <span className="preview-rate">
                                {rate.toFixed(4)}/s
                              </span>
                              <span className="preview-total">
                                × {machine.count} = <strong>{(rate * machine.count).toFixed(4)}/s</strong>
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        .view-layout { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .view-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .view-title { font-size: 16px; font-weight: 700; color: var(--text-0); }
        .card-list { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
        .machine-card { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
        .machine-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; cursor: pointer; transition: background 0.1s;
        }
        .machine-header:hover { background: var(--bg-3); }
        .machine-header-left { display: flex; align-items: center; gap: 10px; flex: 1; }
        .machine-header-right { display: flex; align-items: center; gap: 14px; }
        .expand-arrow { color: var(--text-2); font-size: 12px; width: 12px; }
        .inline-name-input {
          background: transparent; border: none; border-bottom: 1px solid transparent;
          color: var(--text-0); font-size: 14px; font-weight: 600; font-family: var(--font-ui);
          padding: 2px 4px; outline: none;
        }
        .inline-name-input:hover { border-bottom-color: var(--border); }
        .inline-name-input:focus { border-bottom-color: var(--accent); }
        .machine-recipe-badge {
          font-size: 11px; background: var(--accent-glow); color: var(--accent);
          border: 1px solid var(--accent-dim); border-radius: 999px; padding: 2px 10px;
          font-family: var(--font-mono);
        }
        .effective-cycle { display: flex; flex-direction: column; align-items: flex-end; }
        .eff-label { font-size: 10px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; }
        .eff-val { font-size: 13px; color: var(--green); font-family: var(--font-mono); font-weight: 700; }
        .machine-body { padding: 16px; border-top: 1px solid var(--border); }
        .machine-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-bottom: 16px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 11px; color: var(--text-1); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .field-hint { font-weight: 400; color: var(--text-2); text-transform: none; letter-spacing: 0; }
        .input-row { display: flex; align-items: center; gap: 6px; }
        .unit { font-size: 12px; color: var(--text-2); font-family: var(--font-mono); }
        select {
          background: var(--bg-0); border: 1px solid var(--border); border-radius: var(--radius);
          color: var(--text-0); padding: 6px 10px; font-size: 13px; font-family: var(--font-ui); outline: none;
        }
        select:focus { border-color: var(--accent); }
        .machine-preview {
          background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 12px 14px;
        }
        .preview-title { font-size: 10px; font-weight: 700; color: var(--text-2); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .preview-outputs { display: flex; flex-direction: column; gap: 6px; }
        .preview-row {
          display: grid; grid-template-columns: 1fr 60px 130px 160px;
          align-items: center; gap: 10px; font-size: 12px;
        }
        .preview-item { color: var(--green); font-family: var(--font-mono); }
        .input-item { color: var(--blue); }
        .preview-prob { color: var(--text-2); font-size: 11px; }
        .preview-rate { color: var(--text-0); font-family: var(--font-mono); }
        .preview-rate-alt { color: var(--text-2); margin-left: 6px; font-size: 11px; }
        .preview-total { color: var(--accent); font-family: var(--font-mono); }
        .preview-total strong { color: var(--accent); }
        .btn-primary {
          background: var(--accent); color: #000; border-radius: var(--radius);
          padding: 7px 16px; font-size: 13px; font-weight: 700; font-family: var(--font-ui);
          transition: opacity 0.15s;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-danger-sm {
          font-size: 11px; color: var(--text-2); padding: 3px 7px;
          border: 1px solid var(--border); border-radius: var(--radius);
          transition: all 0.15s; font-family: var(--font-ui);
        }
        .btn-danger-sm:hover { background: var(--red-dim); color: var(--red); border-color: var(--red); }
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          flex: 1; gap: 12px; color: var(--text-2); padding: 40px;
        }
        .empty-icon { font-size: 36px; }
        .empty-state p { font-size: 13px; text-align: center; max-width: 300px; line-height: 1.6; }
      `}</style>
    </div>
  )
}
