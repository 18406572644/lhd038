import { useEffect } from 'react';
import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useTimelineStore } from '@/store/useTimelineStore';

interface GlobalHotkeysOptions {
  onSave?: () => void;
  onPreview?: () => void;
}

export function useGlobalHotkeys({ onSave, onPreview }: GlobalHotkeysOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        const { isPlaying, play, pause } = useTimelineStore.getState();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const { selectedBuildingId, selectedGroupId, removeBuilding, removeGroup } = useDesignStore.getState();
        if (selectedBuildingId) {
          removeBuilding(selectedBuildingId);
        } else if (selectedGroupId) {
          removeGroup(selectedGroupId);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        useDesignStore.getState().redo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        useDesignStore.getState().undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const { selectedGroupId, selectedBuildingId, copyBuilding } = useDesignStore.getState();
        if (selectedGroupId || selectedBuildingId) {
          copyBuilding(selectedGroupId || selectedBuildingId || '');
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        const { clipboard, pasteBuilding } = useDesignStore.getState();
        if (clipboard) {
          pasteBuilding();
        }
        return;
      }

      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        const { zoom, setZoom } = useCanvasStore.getState();
        setZoom(Math.min(zoom * 1.2, 5));
        return;
      }

      if (e.key === '-') {
        e.preventDefault();
        const { zoom, setZoom } = useCanvasStore.getState();
        setZoom(Math.max(zoom / 1.2, 0.2));
        return;
      }

      if (e.key === '0') {
        useCanvasStore.getState().resetView();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onPreview]);
}
