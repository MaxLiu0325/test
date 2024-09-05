import "./App.css";

import React, { useState, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
  TEXT: 'text',
  IMAGE: 'image',
};

const ComponentLibrary = () => {
  const [, dragText] = useDrag(() => ({
    type: ItemTypes.TEXT,
    item: { type: ItemTypes.TEXT },
  }));

  const [, dragImage] = useDrag(() => ({
    type: ItemTypes.IMAGE,
    item: { type: ItemTypes.IMAGE },
  }));

  return (
    <div className="component-library">
      <div ref={dragText} className="draggable-item">文字元件</div>
      <div ref={dragImage} className="draggable-item">圖片元件</div>
    </div>
  );
};

const PreviewArea = ({ components, onComponentClick, onDrop }) => {
  const previewRef = useRef(null);

  const [, drop] = useDrop(() => ({
    accept: [ItemTypes.TEXT, ItemTypes.IMAGE],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const previewRect = previewRef.current.getBoundingClientRect();
      const x = offset.x - previewRect.left;
      const y = offset.y - previewRect.top;
      onDrop(item.type, x, y);
    },
  }));

  return (
    <div ref={(node) => {
      drop(node);
      previewRef.current = node;
    }} className="preview-area">
      {components.map((component, index) => (
        <div
          key={index}
          className="preview-component"
          style={{
            position: 'absolute',
            left: `${component.left}px`,
            top: `${component.top}px`,
          }}
          onClick={() => onComponentClick(component)}
        >
          {component.type === ItemTypes.TEXT ? (component.text || '文字') : '圖片'}
        </div>
      ))}
    </div>
  );
};

const EditPanel = ({ selectedComponent, onUpdate }) => {
  if (!selectedComponent) return null;

  return (
    <div className="edit-panel">
      <h3>{selectedComponent.type === ItemTypes.TEXT ? '文字编辑' : '圖片编辑'}</h3>
      {selectedComponent.type === ItemTypes.TEXT && (
        <input
          type="text"
          value={selectedComponent.text || ''}
          onChange={(e) => onUpdate({ ...selectedComponent, text: e.target.value })}
        />
      )}
      {selectedComponent.type === ItemTypes.IMAGE && (
        <input
          type="text"
          value={selectedComponent.src || ''}
          onChange={(e) => onUpdate({ ...selectedComponent, src: e.target.value })}
          placeholder="输入图片URL"
        />
      )}
    </div>
  );
};

const WYSIWYGEditor = () => {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const handleComponentClick = useCallback((component) => {
    setSelectedComponent(component);
  }, []);

  const handleUpdate = useCallback((updatedComponent) => {
    setComponents(prevComponents => 
      prevComponents.map(c => c === selectedComponent ? updatedComponent : c)
    );
    setSelectedComponent(updatedComponent);
  }, [selectedComponent]);

  const handleDrop = useCallback((type, x, y) => {
    const newComponent = { 
      id: Date.now(), 
      type, 
      left: x, 
      top: y, 
      text: type === ItemTypes.TEXT ? '新文字' : '',
      src: type === ItemTypes.IMAGE ? '' : undefined
    };
    setComponents(prevComponents => [...prevComponents, newComponent]);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="wysiwyg-editor">
        <div className="header">This is a fixed header, no need to modify</div>
        <div className="main-content">
          <ComponentLibrary />
          <PreviewArea 
            components={components}
            onComponentClick={handleComponentClick}
            onDrop={handleDrop}
          />
          <EditPanel 
            selectedComponent={selectedComponent}
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default WYSIWYGEditor;
