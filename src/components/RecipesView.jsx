import React, { useState } from 'react'
import { useStore } from '../store/index.js'

export default function RecipesView() {
  const recipes = useStore(s => s.recipes)
  const addRecipe = useStore(s => s.addRecipe)
  const removeRecipe = useStore(s => s.removeRecipe)
  const updateRecipe = useStore(s => s.updateRecipe)
  const addOutput = useStore(s => s.addOutput)
  const updateOutput = useStore(s => s.updateOutput)
  const removeOutput = useStore(s => s.removeOutput)
  const addInput = useStore(s => s.addInput)
  const updateInput = useStore(s => s.updateInput)
  const removeInput = useStore(s => s.removeInput)

  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="view-layout">
      <div className="view-toolbar">
        <h2 className="view-title">Recipes</h2>
        <button className="btn-primary" onClick={() => { addRecipe(); }}>
          + New Recipe
        </button>
      </div>

      {recipes.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>No recipes yet. Create one to define inputs, outputs and cycle time.</p>
        </div>
      )}

      <div className="card-list">
        {recipes.map(recipe => (
          <div key={recipe.id} className="recipe-card">
            <div className="recipe-header" onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}>
              <div className="recipe-header-left">
                <span className="expand-arrow">{expandedId === recipe.id ? '▾' : '▸'}</span>
                <input
                  className="inline-name-input"
                  value={recipe.name}
                  onChange={e => updateRecipe(recipe.id, { name: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  placeholder="Recipe name"
                />
              </div>
              <div className="recipe-header-right">
                <div className="cycle-time-field" onClick={e => e.stopPropagation()}>
                  <label>Cycle</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.25"
                    value={recipe.cycleTime}
                    onChange={e => updateRecipe(recipe.id, { cycleTime: parseFloat(e.target.value) || 1 })}
                    style={{ width: 70 }}
                  />
                  <span className="unit">s</span>
                </div>
                <button className="btn-danger-sm" onClick={e => { e.stopPropagation(); removeRecipe(recipe.id) }}>✕</button>
              </div>
            </div>

            {expandedId === recipe.id && (
              <div className="recipe-body">
                <div className="io-columns">
                  {/* INPUTS */}
                  <div className="io-section">
                    <div className="io-section-header">
                      <span className="io-label input-label">INPUTS</span>
                      <button className="btn-ghost-sm" onClick={() => addInput(recipe.id)}>+ Add</button>
                    </div>
                    {recipe.inputs.length === 0 && <div className="io-empty">No inputs (free recipe)</div>}
                    {recipe.inputs.map(inp => (
                      <div key={inp.id} className="io-row">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={inp.amount}
                          onChange={e => updateInput(recipe.id, inp.id, { amount: parseFloat(e.target.value) || 0 })}
                          style={{ width: 56 }}
                        />
                        <input
                          type="text"
                          value={inp.name}
                          onChange={e => updateInput(recipe.id, inp.id, { name: e.target.value })}
                          placeholder="Item name"
                          style={{ flex: 1 }}
                        />
                        <button className="btn-danger-sm" onClick={() => removeInput(recipe.id, inp.id)}>✕</button>
                      </div>
                    ))}
                  </div>

                  <div className="io-arrow">→</div>

                  {/* OUTPUTS */}
                  <div className="io-section">
                    <div className="io-section-header">
                      <span className="io-label output-label">OUTPUTS</span>
                      <button className="btn-ghost-sm" onClick={() => addOutput(recipe.id)}>+ Add</button>
                    </div>
                    {recipe.outputs.length === 0 && <div className="io-empty">No outputs defined</div>}
                    {recipe.outputs.map(out => (
                      <div key={out.id} className="io-row">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={out.amount}
                          onChange={e => updateOutput(recipe.id, out.id, { amount: parseFloat(e.target.value) || 0 })}
                          style={{ width: 56 }}
                        />
                        <input
                          type="text"
                          value={out.name}
                          onChange={e => updateOutput(recipe.id, out.id, { name: e.target.value })}
                          placeholder="Item name"
                          style={{ flex: 1 }}
                        />
                        <div className="prob-field">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={out.probability}
                            onChange={e => updateOutput(recipe.id, out.id, { probability: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                            style={{ width: 52 }}
                          />
                          <span className="unit">%</span>
                        </div>
                        <button className="btn-danger-sm" onClick={() => removeOutput(recipe.id, out.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .view-layout { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .view-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .view-title { font-size: 16px; font-weight: 700; color: var(--text-0); }
        .card-list { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
        .recipe-card {
          background: var(--bg-2); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow: hidden;
        }
        .recipe-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; cursor: pointer; transition: background 0.1s;
        }
        .recipe-header:hover { background: var(--bg-3); }
        .recipe-header-left { display: flex; align-items: center; gap: 10px; flex: 1; }
        .recipe-header-right { display: flex; align-items: center; gap: 12px; }
        .expand-arrow { color: var(--text-2); font-size: 12px; width: 12px; }
        .inline-name-input {
          background: transparent; border: none; border-bottom: 1px solid transparent;
          color: var(--text-0); font-size: 14px; font-weight: 600; font-family: var(--font-ui);
          padding: 2px 4px; outline: none;
        }
        .inline-name-input:hover { border-bottom-color: var(--border); }
        .inline-name-input:focus { border-bottom-color: var(--accent); }
        .cycle-time-field { display: flex; align-items: center; gap: 6px; }
        .cycle-time-field label { font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; }
        .unit { font-size: 12px; color: var(--text-2); font-family: var(--font-mono); }
        .recipe-body { padding: 0 16px 16px; border-top: 1px solid var(--border); }
        .io-columns { display: flex; align-items: flex-start; gap: 0; margin-top: 14px; }
        .io-section { flex: 1; }
        .io-arrow { padding: 28px 16px 0; color: var(--text-2); font-size: 18px; }
        .io-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .io-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; font-family: var(--font-mono); }
        .input-label { color: var(--blue); }
        .output-label { color: var(--green); }
        .io-empty { font-size: 12px; color: var(--text-2); font-style: italic; padding: 6px 0; }
        .io-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .prob-field { display: flex; align-items: center; gap: 4px; }
        .btn-primary {
          background: var(--accent); color: #000; border-radius: var(--radius);
          padding: 7px 16px; font-size: 13px; font-weight: 700; font-family: var(--font-ui);
          transition: opacity 0.15s;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-ghost-sm {
          font-size: 11px; color: var(--text-1); padding: 3px 8px;
          border: 1px solid var(--border); border-radius: var(--radius);
          transition: all 0.15s; font-family: var(--font-ui);
        }
        .btn-ghost-sm:hover { background: var(--bg-3); color: var(--text-0); }
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
        .empty-state p { font-size: 13px; text-align: center; max-width: 280px; line-height: 1.6; }
      `}</style>
    </div>
  )
}
