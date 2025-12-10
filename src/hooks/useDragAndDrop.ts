import { useState, useCallback, DragEvent } from 'react';

export function useDragAndDrop<T>() {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const handleDragStart = useCallback((item: T) => (e: DragEvent) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    // Add a subtle opacity to the dragged element
    const target = e.currentTarget as HTMLElement;
    if (target) {
      setTimeout(() => {
        target.style.opacity = '0.5';
      }, 0);
    }
  }, []);

  const handleDragEnd = useCallback((e: DragEvent) => {
    setDraggedItem(null);
    setDragOverTarget(null);
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '1';
    }
  }, []);

  const handleDragOver = useCallback((targetId: string) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget(targetId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverTarget(null);
  }, []);

  const handleDrop = useCallback((targetId: string, onDrop: (item: T, targetId: string) => void) => (e: DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);
    
    if (draggedItem) {
      onDrop(draggedItem, targetId);
      setDraggedItem(null);
    }
  }, [draggedItem]);

  return {
    draggedItem,
    dragOverTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
