import L from "leaflet";

interface LongPressCallbacks {
  onLongPress: () => void;
}

interface LongPressConfig {
  threshold?: number; // ms to hold before triggering (default: 500)
  moveTolerance?: number; // px allowed before canceling (default: 10)
}

/**
 * Attaches long-press touch and mouse listeners to a Leaflet layer.
 * Returns a cleanup function to remove listeners.
 */
export function attachLongPressToLayer(
  layer: L.Layer,
  callbacks: LongPressCallbacks,
  config?: LongPressConfig,
): () => void {
  const threshold = config?.threshold ?? 500;
  const moveTolerance = config?.moveTolerance ?? 10;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;
  let isLongPressTriggered = false;
  let attachedElement: HTMLElement | null = null;

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  // Touch event handlers (native DOM - touch doesn't interfere with Leaflet hover)
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      clearTimer();
      return;
    }

    isLongPressTriggered = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    timer = setTimeout(() => {
      isLongPressTriggered = true;
      callbacks.onLongPress();
    }, threshold);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!timer) return;

    const touch = e.touches[0];
    if (!touch) {
      clearTimer();
      return;
    }

    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);

    if (deltaX > moveTolerance || deltaY > moveTolerance) {
      clearTimer();
    }
  };

  const handleTouchEnd = () => {
    clearTimer();
  };

  const handleContextMenu = (e: Event) => {
    if (isLongPressTriggered) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Mouse handlers using Leaflet's event system
  const handleMouseDown = (e: L.LeafletMouseEvent) => {
    isLongPressTriggered = false;
    startX = e.originalEvent.clientX;
    startY = e.originalEvent.clientY;

    // Add document-level listeners for move/up
    document.addEventListener("mousemove", handleDocumentMouseMove);
    document.addEventListener("mouseup", handleDocumentMouseUp);

    timer = setTimeout(() => {
      isLongPressTriggered = true;
      callbacks.onLongPress();
      removeDocumentMouseListeners();
    }, threshold);
  };

  const handleDocumentMouseMove = (e: MouseEvent) => {
    if (!timer) return;

    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);

    if (deltaX > moveTolerance || deltaY > moveTolerance) {
      clearTimer();
      removeDocumentMouseListeners();
    }
  };

  const handleDocumentMouseUp = () => {
    clearTimer();
    removeDocumentMouseListeners();
  };

  const removeDocumentMouseListeners = () => {
    document.removeEventListener("mousemove", handleDocumentMouseMove);
    document.removeEventListener("mouseup", handleDocumentMouseUp);
  };

  // Attach Leaflet mouse event
  layer.on("mousedown", handleMouseDown);

  const attachTouchListeners = (element: HTMLElement) => {
    attachedElement = element;
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    element.addEventListener("contextmenu", handleContextMenu);
  };

  const removeTouchListeners = () => {
    if (attachedElement) {
      attachedElement.removeEventListener("touchstart", handleTouchStart);
      attachedElement.removeEventListener("touchmove", handleTouchMove);
      attachedElement.removeEventListener("touchend", handleTouchEnd);
      attachedElement.removeEventListener("touchcancel", handleTouchEnd);
      attachedElement.removeEventListener("contextmenu", handleContextMenu);
      attachedElement = null;
    }
  };

  // Try to get the DOM element from the layer for touch events
  const pathLayer = layer as L.Path & { _path?: HTMLElement };
  const element = pathLayer._path;

  if (element) {
    attachTouchListeners(element);
  } else {
    const onAdd = () => {
      const el = pathLayer._path;
      if (el) {
        attachTouchListeners(el);
      }
    };
    layer.on("add", onAdd);

    return () => {
      clearTimer();
      removeDocumentMouseListeners();
      layer.off("add", onAdd);
      layer.off("mousedown", handleMouseDown);
      removeTouchListeners();
    };
  }

  return () => {
    clearTimer();
    removeDocumentMouseListeners();
    layer.off("mousedown", handleMouseDown);
    removeTouchListeners();
  };
}
