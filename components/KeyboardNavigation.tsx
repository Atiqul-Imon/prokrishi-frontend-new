"use client";

import { useEffect } from "react";

/**
 * Keyboard Navigation Enhancement Component
 * Improves keyboard navigation throughout the app
 */
export default function KeyboardNavigation() {
  useEffect(() => {
    // Handle Escape key to close modals/drawers
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Find and close any open modals or drawers
        const modals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]');
        const drawers = document.querySelectorAll('[data-drawer-open="true"]');
        
        // Close the last opened modal/drawer
        if (modals.length > 0) {
          const lastModal = modals[modals.length - 1] as HTMLElement;
          const closeButton = lastModal.querySelector('[data-close-modal]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        } else if (drawers.length > 0) {
          const lastDrawer = drawers[drawers.length - 1] as HTMLElement;
          const closeButton = lastDrawer.querySelector('[data-close-drawer]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };

    // Handle Enter key on buttons and links
    const handleEnter = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // If Enter is pressed on a button or link, trigger click
      if (e.key === 'Enter' && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
        // Let default behavior handle it
        return;
      }

      // Handle Enter on elements with role="button"
      if (e.key === 'Enter' && target.getAttribute('role') === 'button') {
        e.preventDefault();
        target.click();
      }
    };

    // Handle Arrow keys for navigation in lists
    const handleArrowKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Only handle in lists, menus, or grids
      const isInList = target.closest('[role="list"]') || target.closest('[role="menu"]') || target.closest('[role="grid"]');
      if (!isInList) return;

      const items = Array.from(
        isInList.querySelectorAll('[role="listitem"], [role="menuitem"], [role="gridcell"], [role="option"]')
      ) as HTMLElement[];

      const currentIndex = items.indexOf(target);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      }

      if (nextIndex !== currentIndex) {
        items[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleEnter);
    document.addEventListener('keydown', handleArrowKeys);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleEnter);
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, []);

  return null;
}

