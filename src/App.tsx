import { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import ConfigPanel from './components/ConfigPanel';
import SourceNode from './components/SourceNode';
import MachineNode from './components/MachineNode';
import OutputNode from './components/OutputNode';

const nodeTypes = { sourceNode: SourceNode, machineNode: MachineNode, outputNode: OutputNode };

function Flow() {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const onNodesChange = useStore(s => s.onNodesChange);
  const onEdgesChange = useStore(s => s.onEdgesChange);
  const onConnect = useStore(s => s.onConnect);
  const addMachineNode = useStore(s => s.addMachineNode);
  const setSelectedNode = useStore(s => s.setSelectedNode);
  const removeSelectedNode = useStore(s => s.removeSelectedNode);
  const { screenToFlowPosition } = useReactFlow();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const typeId = e.dataTransfer.getData('application/reactflow');
    if (!typeId) return;
    addMachineNode(typeId, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
  }, [addMachineNode, screenToFlowPosition]);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  return (
    <div
      style={{ flex: 1, position: 'relative' }}
      tabIndex={0}
      onKeyDown={e => { if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) removeSelectedNode(); }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        fitView
        colorMode="dark"
        defaultEdgeOptions={{ animated: true, style: { stroke: 'var(--accent)', strokeWidth: 1.5 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e2630" />
        <Controls style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }} />
        <MiniMap
          style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
          nodeColor={n => n.type === 'sourceNode' ? '#29d49a' : n.type === 'outputNode' ? '#f07a28' : '#4d8ff5'}
          maskColor="rgba(8,11,15,0.7)"
        />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <Flow />
        <ConfigPanel />
      </div>
    </ReactFlowProvider>
  );
}
