import { useRef, useEffect, useCallback, useState } from 'react';
import { Menu, Text, ActionIcon, Group, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Copy, Scissors, Layers, Ungroup, Lock, Unlock, Lightbulb } from 'lucide-react';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { useAnimation } from '@/hooks/useAnimation';
import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { isPointInBuilding, isBuildingInBox, isPointInGroup, snapToGrid } from '@/utils/canvas';
import { NEON_PINK, ELECTRIC_BLUE } from '@/utils/colors';
import { LightConfig } from '@/types';
import CanvasOverlay from './CanvasOverlay';

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  targetType: 'building' | 'group' | 'canvas' | null;
  targetId: string | null;
}

export default function CityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { startRendering, stopRendering } = useCanvasRenderer(canvasRef);
  const { startPlayback, stopPlayback } = useAnimation();

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    targetType: null,
    targetId: null,
  });

  const buildings = useDesignStore((s) => s.buildings);
  const groups = useDesignStore((s) => s.groups);
  const selectedBuildingId = useDesignStore((s) => s.selectedBuildingId);
  const selectedBuildingIds = useDesignStore((s) => s.selectedBuildingIds);
  const selectedGroupId = useDesignStore((s) => s.selectedGroupId);
  const activeGroupId = useDesignStore((s) => s.activeGroupId);
  const selectBuilding = useDesignStore((s) => s.selectBuilding);
  const selectBuildings = useDesignStore((s) => s.selectBuildings);
  const toggleBuildingSelection = useDesignStore((s) => s.toggleBuildingSelection);
  const selectGroup = useDesignStore((s) => s.selectGroup);
  const clearSelection = useDesignStore((s) => s.clearSelection);
  const updateBuilding = useDesignStore((s) => s.updateBuilding);
  const createGroup = useDesignStore((s) => s.createGroup);
  const ungroup = useDesignStore((s) => s.ungroup);
  const enterGroupEditMode = useDesignStore((s) => s.enterGroupEditMode);
  const exitGroupEditMode = useDesignStore((s) => s.exitGroupEditMode);
  const moveGroup = useDesignStore((s) => s.moveGroup);
  const scaleGroup = useDesignStore((s) => s.scaleGroup);
  const applyLightConfigToGroup = useDesignStore((s) => s.applyLightConfigToGroup);
  const updateGroup = useDesignStore((s) => s.updateGroup);
  const copyBuilding = useDesignStore((s) => s.copyBuilding);
  const pasteBuilding = useDesignStore((s) => s.pasteBuilding);
  const clipboard = useDesignStore((s) => s.clipboard);

  const zoom = useCanvasStore((s) => s.zoom);
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const groundY = useCanvasStore((s) => s.groundY);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const setCanvasSize = useCanvasStore((s) => s.setCanvasSize);
  const startDrag = useCanvasStore((s) => s.startDrag);
  const updateDrag = useCanvasStore((s) => s.updateDrag);
  const endDrag = useCanvasStore((s) => s.endDrag);
  const isDragging = useCanvasStore((s) => s.isDragging);
  const dragTarget = useCanvasStore((s) => s.dragTarget);
  const dragGroupId = useCanvasStore((s) => s.dragGroupId);
  const startBoxSelection = useCanvasStore((s) => s.startBoxSelection);
  const updateBoxSelection = useCanvasStore((s) => s.updateBoxSelection);
  const endBoxSelection = useCanvasStore((s) => s.endBoxSelection);
  const boxSelection = useCanvasStore((s) => s.boxSelection);
  const recordClick = useCanvasStore((s) => s.recordClick);

  const dragBuildingOffsetRef = useRef({ x: 0, y: 0 });
  const dragGroupOffsetRef = useRef({ x: 0, y: 0 });
  const boxSelectionStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    startRendering();
    return () => {
      stopRendering();
      stopPlayback();
    };
  }, [startRendering, stopRendering, startPlayback, stopPlayback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (selectedGroupId) {
          ungroup(selectedGroupId);
          notifications.show({
            title: '已取消分组',
            message: '建筑组已解散',
            color: 'yellow',
            autoClose: 2000,
            styles: {
              root: { backgroundColor: '#0A0A14' },
              title: { color: '#FFE600', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 },
              description: { color: '#B0B0C0' },
            },
          });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (selectedBuildingIds.length >= 2) {
          const groupId = createGroup(selectedBuildingIds);
          if (groupId) {
            notifications.show({
              title: '已创建分组',
              message: `选中的 ${selectedBuildingIds.length} 栋建筑已组合`,
              color: 'cyan',
              autoClose: 2000,
              styles: {
                root: { backgroundColor: '#0A0A14', borderColor: ELECTRIC_BLUE },
                title: { color: ELECTRIC_BLUE, fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 },
                description: { color: '#B0B0C0' },
              },
            });
          }
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedGroupId || selectedBuildingId) {
          copyBuilding(selectedGroupId || selectedBuildingId || '');
          notifications.show({
            title: '已复制',
            message: selectedGroupId ? '组已复制到剪贴板' : '建筑已复制到剪贴板',
            color: 'cyan',
            autoClose: 2000,
            icon: <Copy size={16} />,
            styles: {
              root: { backgroundColor: '#0A0A14', borderColor: ELECTRIC_BLUE },
              title: { color: ELECTRIC_BLUE, fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 },
              description: { color: '#B0B0C0' },
            },
          });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (clipboard) {
          pasteBuilding();
          notifications.show({
            title: '已粘贴',
            message: '粘贴成功',
            color: 'pink',
            autoClose: 2000,
            styles: {
              root: { backgroundColor: '#0A0A14', borderColor: NEON_PINK },
              title: { color: NEON_PINK, fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 },
              description: { color: '#B0B0C0' },
            },
          });
        }
      }

      if (e.key === 'Escape') {
        if (activeGroupId) {
          exitGroupEditMode();
        } else {
          clearSelection();
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBuildingId) {
          // 删除建筑逻辑可在此添加
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedBuildingId,
    selectedBuildingIds,
    selectedGroupId,
    activeGroupId,
    clipboard,
    createGroup,
    ungroup,
    copyBuilding,
    pasteBuilding,
    clearSelection,
    exitGroupEditMode,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.scale(dpr, dpr);
        }
        setCanvasSize(width, height);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [setCanvasSize]);

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { cx: 0, cy: 0 };
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      return {
        cx: (sx - panX) / zoom,
        cy: (sy - panY) / zoom - (groundY - 500),
      };
    },
    [panX, panY, zoom, groundY]
  );

  const findBuildingAtPoint = useCallback(
    (cx: number, cy: number) => {
      for (let i = buildings.length - 1; i >= 0; i--) {
        if (activeGroupId && buildings[i].groupId !== activeGroupId) continue;
        if (!activeGroupId && buildings[i].groupId) continue;
        if (isPointInBuilding(cx, cy, buildings[i])) {
          return buildings[i];
        }
      }
      return null;
    },
    [buildings, activeGroupId]
  );

  const findGroupAtPoint = useCallback(
    (cx: number, cy: number) => {
      for (let i = groups.length - 1; i >= 0; i--) {
        if (isPointInGroup(cx, cy, groups[i], buildings)) {
          return groups[i];
        }
      }
      return null;
    },
    [groups, buildings]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, targetType: null, targetId: null });
      }

      if (e.button === 1) {
        e.preventDefault();
        startDrag('canvas', e.clientX, e.clientY);
        return;
      }

      if (e.button === 2) {
        e.preventDefault();
        const { cx, cy } = screenToCanvas(e.clientX, e.clientY);

        let targetType: ContextMenuState['targetType'] = 'canvas';
        let targetId: string | null = null;

        if (activeGroupId) {
          const building = findBuildingAtPoint(cx, cy);
          if (building) {
            targetType = 'building';
            targetId = building.id;
          }
        } else {
          const group = findGroupAtPoint(cx, cy);
          if (group) {
            targetType = 'group';
            targetId = group.id;
          } else {
            const building = findBuildingAtPoint(cx, cy);
            if (building) {
              targetType = 'building';
              targetId = building.id;
            }
          }
        }

        setContextMenu({
          show: true,
          x: e.clientX,
          y: e.clientY,
          targetType,
          targetId,
        });
        return;
      }

      if (e.button !== 0) return;

      const { cx, cy } = screenToCanvas(e.clientX, e.clientY);
      const isDoubleClick = recordClick(cx, cy);

      if (activeGroupId) {
        const building = findBuildingAtPoint(cx, cy);
        if (building) {
          if (e.ctrlKey || e.metaKey) {
            toggleBuildingSelection(building.id);
          } else {
            selectBuilding(building.id);
          }
          dragBuildingOffsetRef.current = { x: cx - building.x, y: cy - building.y };
          startDrag('building', e.clientX, e.clientY, building.id);
          return;
        }
      } else {
        const group = findGroupAtPoint(cx, cy);
        if (group) {
          if (isDoubleClick) {
            enterGroupEditMode(group.id);
            notifications.show({
              title: '进入组编辑模式',
              message: `正在编辑: ${group.name}`,
              color: 'yellow',
              autoClose: 2000,
              styles: {
                root: { backgroundColor: '#0A0A14' },
                title: { color: '#FFE600', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 },
                description: { color: '#B0B0C0' },
              },
            });
            return;
          }

          if (!group.locked) {
            selectGroup(group.id);
            dragGroupOffsetRef.current = { x: cx - group.pivotX, y: cy - group.pivotY };
            startDrag('group', e.clientX, e.clientY, null, group.id);
            return;
          }
        }

        const building = findBuildingAtPoint(cx, cy);
        if (building) {
          if (e.ctrlKey || e.metaKey) {
            toggleBuildingSelection(building.id);
          } else {
            selectBuilding(building.id);
          }
          dragBuildingOffsetRef.current = { x: cx - building.x, y: cy - building.y };
          startDrag('building', e.clientX, e.clientY, building.id);
          return;
        }
      }

      if (e.shiftKey && !activeGroupId) {
        boxSelectionStartRef.current = { x: cx, y: cy };
        startBoxSelection(cx, cy + (groundY - 500));
        startDrag('selection', e.clientX, e.clientY);
        return;
      }

      clearSelection();
      startDrag('canvas', e.clientX, e.clientY);
    },
    [
      contextMenu.show,
      activeGroupId,
      screenToCanvas,
      findBuildingAtPoint,
      findGroupAtPoint,
      recordClick,
      selectBuilding,
      toggleBuildingSelection,
      selectGroup,
      clearSelection,
      enterGroupEditMode,
      startDrag,
      startBoxSelection,
      groundY,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;

      if (dragTarget === 'canvas') {
        updateDrag(e.clientX, e.clientY);
      } else if (dragTarget === 'selection') {
        const { cx, cy } = screenToCanvas(e.clientX, e.clientY);
        updateBoxSelection(cx, cy + (groundY - 500));
      } else if (dragTarget === 'building' && selectedBuildingId) {
        const { cx, cy } = screenToCanvas(e.clientX, e.clientY);
        const newX = snapToGrid(cx - dragBuildingOffsetRef.current.x);
        const newY = snapToGrid(cy - dragBuildingOffsetRef.current.y);
        updateBuilding(selectedBuildingId, { x: newX, y: newY });
      } else if (dragTarget === 'group' && dragGroupId) {
        const { cx, cy } = screenToCanvas(e.clientX, e.clientY);
        const group = groups.find((g) => g.id === dragGroupId);
        if (!group) return;
        const newPivotX = snapToGrid(cx - dragGroupOffsetRef.current.x);
        const newPivotY = snapToGrid(cy - dragGroupOffsetRef.current.y);
        const deltaX = newPivotX - group.pivotX;
        const deltaY = newPivotY - group.pivotY;
        if (deltaX !== 0 || deltaY !== 0) {
          moveGroup(dragGroupId, deltaX, deltaY);
        }
      }
    },
    [
      isDragging,
      dragTarget,
      selectedBuildingId,
      dragGroupId,
      groups,
      screenToCanvas,
      updateDrag,
      updateBoxSelection,
      updateBuilding,
      moveGroup,
      groundY,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (boxSelection.active) {
      const { startX, startY, endX, endY } = boxSelection;
      const offsetY = groundY - 500;

      const selectedIds: string[] = [];
      for (const building of buildings) {
        if (activeGroupId && building.groupId !== activeGroupId) continue;
        if (!activeGroupId && building.groupId) continue;
        if (isBuildingInBox(building, startX, startY - offsetY, endX, endY - offsetY)) {
          selectedIds.push(building.id);
        }
      }

      if (selectedIds.length > 0) {
        selectBuildings(selectedIds);
      }

      endBoxSelection();
    }

    if (isDragging) {
      endDrag();
    }
  }, [isDragging, boxSelection, buildings, activeGroupId, selectBuildings, endBoxSelection, endDrag, groundY]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * delta, 0.2), 5);
      setZoom(newZoom);
    },
    [zoom, setZoom]
  );

  const handleCreateGroup = () => {
    if (selectedBuildingIds.length >= 2) {
      const groupId = createGroup(selectedBuildingIds);
      if (groupId) {
        notifications.show({
          title: '已创建分组',
          message: `选中的 ${selectedBuildingIds.length} 栋建筑已组合`,
          color: 'cyan',
          autoClose: 2000,
          styles: {
            root: { backgroundColor: '#0A0A14', borderColor: ELECTRIC_BLUE },
            title: { color: ELECTRIC_BLUE, fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 },
            description: { color: '#B0B0C0' },
          },
        });
      }
    }
    setContextMenu({ show: false, x: 0, y: 0, targetType: null, targetId: null });
  };

  const handleUngroup = () => {
    if (contextMenu.targetId) {
      ungroup(contextMenu.targetId);
      notifications.show({
        title: '已取消分组',
        message: '建筑组已解散',
        color: 'yellow',
        autoClose: 2000,
        styles: {
          root: { backgroundColor: '#0A0A14' },
          title: { color: '#FFE600', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 },
          description: { color: '#B0B0C0' },
        },
      });
    }
    setContextMenu({ show: false, x: 0, y: 0, targetType: null, targetId: null });
  };

  const handleToggleLock = () => {
    if (contextMenu.targetId && contextMenu.targetType === 'group') {
      const group = groups.find((g) => g.id === contextMenu.targetId);
      if (group) {
        updateGroup(contextMenu.targetId, { locked: !group.locked });
      }
    }
    setContextMenu({ show: false, x: 0, y: 0, targetType: null, targetId: null });
  };

  const handleApplyUniformLight = () => {
    if (contextMenu.targetId && contextMenu.targetType === 'group') {
      const lightConfig: Partial<LightConfig> = {
        color: '#FF2E97',
        animation: 'breathe',
        speed: 1,
        intensity: 0.8,
        delay: 0,
      };
      applyLightConfigToGroup(contextMenu.targetId, lightConfig);
      notifications.show({
        title: '灯光已同步',
        message: '统一灯光配置已应用到组内所有建筑',
        color: 'pink',
        autoClose: 2000,
        styles: {
          root: { backgroundColor: '#0A0A14', borderColor: NEON_PINK },
          title: { color: NEON_PINK, fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 },
          description: { color: '#B0B0C0' },
        },
      });
    }
    setContextMenu({ show: false, x: 0, y: 0, targetType: null, targetId: null });
  };

  const handleEnterEditMode = () => {
    if (contextMenu.targetId) {
      enterGroupEditMode(contextMenu.targetId);
    }
    setContextMenu({ show: false, x: 0, y: 0, targetType: null, targetId: null });
  };

  const handleExitEditMode = () => {
    exitGroupEditMode();
    setContextMenu({ show: false, x: 0, y: 0, targetType: null, targetId: null });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        data-city-canvas="true"
        className="block w-full h-full"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.05), 0 0 1px rgba(0, 240, 255, 0.3)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {contextMenu.show && (
        <Menu
          opened={contextMenu.show}
          withinPortal
          position="bottom-start"
          offset={0}
          shadow="xl"
        >
          <Menu.Dropdown
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              backgroundColor: '#0A0A14',
              borderColor: 'rgba(0, 240, 255, 0.3)',
              minWidth: 180,
            }}
          >
            {contextMenu.targetType === 'canvas' && (
              <>
                <Menu.Item
                  onClick={handleCreateGroup}
                  disabled={selectedBuildingIds.length < 2}
                  leftSection={<Layers size={16} />}
                >
                  创建分组 (Ctrl+G)
                </Menu.Item>
                <Divider my="xs" />
                <Menu.Item
                  onClick={() => pasteBuilding()}
                  disabled={!clipboard}
                  leftSection={<Copy size={16} />}
                >
                  粘贴
                </Menu.Item>
              </>
            )}

            {contextMenu.targetType === 'building' && (
              <>
                <Menu.Item
                  onClick={() => copyBuilding(contextMenu.targetId || '')}
                  leftSection={<Copy size={16} />}
                >
                  复制建筑
                </Menu.Item>
                <Menu.Item leftSection={<Scissors size={16} />}>剪切建筑</Menu.Item>
                <Divider my="xs" />
                <Menu.Item
                  onClick={handleCreateGroup}
                  disabled={selectedBuildingIds.length < 2}
                  leftSection={<Layers size={16} />}
                >
                  创建分组 (Ctrl+G)
                </Menu.Item>
              </>
            )}

            {contextMenu.targetType === 'group' && (
              <>
                <Menu.Item
                  onClick={handleEnterEditMode}
                  leftSection={<Layers size={16} />}
                >
                  进入组编辑
                </Menu.Item>
                <Menu.Item
                  onClick={handleUngroup}
                  leftSection={<Ungroup size={16} />}
                >
                  取消分组 (Ctrl+Shift+G)
                </Menu.Item>
                <Divider my="xs" />
                <Menu.Item
                  onClick={handleToggleLock}
                  leftSection={
                    groups.find((g) => g.id === contextMenu.targetId)?.locked ? (
                      <Unlock size={16} />
                    ) : (
                      <Lock size={16} />
                    )
                  }
                >
                  {groups.find((g) => g.id === contextMenu.targetId)?.locked
                    ? '解锁组'
                    : '锁定组'}
                </Menu.Item>
                <Menu.Item
                  onClick={handleApplyUniformLight}
                  leftSection={<Lightbulb size={16} />}
                >
                  统一灯光配置
                </Menu.Item>
                <Divider my="xs" />
                <Menu.Item
                  onClick={() => copyBuilding(contextMenu.targetId || '')}
                  leftSection={<Copy size={16} />}
                >
                  复制组
                </Menu.Item>
              </>
            )}

            {activeGroupId && (
              <>
                <Divider my="xs" />
                <Menu.Item
                  onClick={handleExitEditMode}
                  color="yellow"
                >
                  退出组编辑 (Esc)
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      )}

      <CanvasOverlay />
    </div>
  );
}
