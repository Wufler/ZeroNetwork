"use client";

import { type HTMLAttributes, type PointerEvent, useRef } from "react";

export function useDragScroll(): HTMLAttributes<HTMLDivElement> {
  const drag = useRef({ active: false, moved: false, x: 0, scrollLeft: 0 });
  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    drag.current.active = false;
    delete event.currentTarget.dataset.dragging;
  };

  return {
    onPointerDown(event) {
      drag.current.moved = false;
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = {
        active: true,
        moved: false,
        x: event.clientX,
        scrollLeft: event.currentTarget.scrollLeft,
      };
    },
    onPointerMove(event) {
      const state = drag.current;
      if (!state.active) return;
      const distance = event.clientX - state.x;
      if (!state.moved && Math.abs(distance) < 5) return;

      if (!state.moved) {
        state.moved = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.dragging = "true";
      }
      event.currentTarget.scrollLeft = state.scrollLeft - distance;
    },
    onPointerUp: stopDragging,
    onPointerCancel: stopDragging,
    onLostPointerCapture: stopDragging,
    onPointerLeave(event) {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        drag.current.active = false;
      }
    },
    onClickCapture(event) {
      if (drag.current.moved && event.detail > 0) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    onDragStart(event) {
      event.preventDefault();
    },
  };
}
