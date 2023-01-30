/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  DraggableCollectionOptions,
  DraggableItemProps,
  DraggableItemResult,
  DragPreview,
  DropIndicatorAria,
  DropIndicatorProps,
  DroppableCollectionOptions,
  DroppableCollectionResult,
  DroppableItemOptions,
  DroppableItemResult,
  isVirtualDragging,
  useDraggableCollection,
  useDraggableItem,
  useDropIndicator,
  useDroppableCollection,
  useDroppableItem
} from '@react-aria/dnd';
import {DraggableCollectionProps, DragItem} from '@react-types/shared';
import {
  DraggableCollectionState,
  DraggableCollectionStateOptions,
  DroppableCollectionState,
  DroppableCollectionStateOptions,
  useDraggableCollectionState,
  useDroppableCollectionState
} from '@react-stately/dnd';
import {DroppableCollectionProps} from '@react-types/shared';
import {Key, RefObject, useMemo} from 'react';

interface DraggableCollectionStateOpts extends Omit<DraggableCollectionStateOptions, 'getItems'> {}

interface DragHooks {
  useDraggableCollectionState?: (props: DraggableCollectionStateOpts) => DraggableCollectionState,
  useDraggableCollection?: (props: DraggableCollectionOptions, state: DraggableCollectionState, ref: RefObject<HTMLElement>) => void,
  useDraggableItem?: (props: DraggableItemProps, state: DraggableCollectionState) => DraggableItemResult,
  DragPreview?: typeof DragPreview
}

interface DropHooks {
  useDroppableCollectionState?: (props: DroppableCollectionStateOptions) => DroppableCollectionState,
  useDroppableCollection?: (props: DroppableCollectionOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>) => DroppableCollectionResult,
  useDroppableItem?: (options: DroppableItemOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>) => DroppableItemResult,
  useDropIndicator?: (props: DropIndicatorProps, state: DroppableCollectionState, ref: RefObject<HTMLElement>) => DropIndicatorAria
}

export interface DragAndDropHooks {
  /** Drag and drop hooks for the collection element.  */
  dragAndDropHooks: DragHooks & DropHooks & {isVirtualDragging?: () => boolean}
}

export interface DragAndDropOptions extends Omit<DraggableCollectionProps, 'preview' | 'getItems'>, DroppableCollectionProps {
  /**
   * A function that returns the items being dragged. If not specified, we assume that the collection is not draggable.
   * @default () => []
   */
  getItems?: (keys: Set<Key>) => DragItem[]
}

/**
 * Provides the hooks required to enable drag and drop behavior for a drag and drop compatible React Spectrum component.
 */
export function useDragAndDrop(options: DragAndDropOptions): DragAndDropHooks {
  let dragAndDropHooks = useMemo(() => {
    let {
      onDrop,
      onInsert,
      onItemDrop,
      onReorder,
      onRootDrop,
      getItems
     } = options;

    let isDraggable = !!getItems;
    let isDroppable = !!(onDrop || onInsert || onItemDrop || onReorder || onRootDrop);

    let hooks = {} as DragHooks & DropHooks & {isVirtualDragging?: () => boolean};
    if (isDraggable) {
      hooks.useDraggableCollectionState = function useDraggableCollectionStateOverride(props: DraggableCollectionStateOptions) {
        return useDraggableCollectionState({...props, ...options});
      };
      hooks.useDraggableCollection = useDraggableCollection;
      hooks.useDraggableItem = useDraggableItem;
      hooks.DragPreview = DragPreview;
    }

    if (isDroppable) {
      hooks.useDroppableCollectionState = function useDroppableCollectionStateOverride(props: DroppableCollectionStateOptions) {
        return useDroppableCollectionState({...props, ...options});
      },
      hooks.useDroppableItem = useDroppableItem;
      hooks.useDroppableCollection = function useDroppableCollectionOverride(props: DroppableCollectionOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>) {
        return useDroppableCollection({...props, ...options}, state, ref);
      };
      hooks.useDropIndicator = useDropIndicator;
    }

    if (isDraggable || isDroppable) {
      hooks.isVirtualDragging = isVirtualDragging;
    }

    return hooks;
  }, [options]);

  return {
    dragAndDropHooks: dragAndDropHooks
  };
}