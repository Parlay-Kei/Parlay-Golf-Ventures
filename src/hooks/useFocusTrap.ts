/**
 * useFocusTrap Hook
 * 
 * A custom hook that traps focus within a specified element when active.
 * This is essential for modal dialogs, dropdown menus, and other components
 * that need to restrict keyboard focus for accessibility.
 */

import { useEffect, useRef } from 'react';

type FocusableElement = HTMLButtonElement | HTMLAnchorElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLElement;

/**
 * Hook for trapping focus within a specified container element
 * @param isActive Whether the focus trap is active
 * @param onEscape Callback function to execute when Escape key is pressed
 * @returns A ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(isActive: boolean, onEscape?: () => void) {
  const containerRef = useRef<T | null>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    
    // Save the element that had focus before activating the trap
    const previouslyFocused = document.activeElement as HTMLElement;
    
    // Find all focusable elements within the container
    const getFocusableElements = (): FocusableElement[] => {
      const selector = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable]'
      ].join(',');
      
      const elements = Array.from(container.querySelectorAll<FocusableElement>(selector))
        .filter(el => el.tabIndex !== -1 && !el.hasAttribute('data-focus-trap-exclude'));
      
      return elements;
    };
    
    // Focus the first element when the trap activates
    const focusFirstElement = () => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        // If no focusable elements, focus the container itself
        container.setAttribute('tabindex', '-1');
        container.focus();
      }
    };
    
    // Handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }
      
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If shift+tab on first element, move to last element
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        // If tab on last element, move to first element
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    // Set initial focus
    focusFirstElement();
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Remove tabindex if we added it
      if (container.getAttribute('tabindex') === '-1') {
        container.removeAttribute('tabindex');
      }
      
      // Restore focus to the previously focused element
      if (previouslyFocused && 'focus' in previouslyFocused) {
        previouslyFocused.focus();
      }
    };
  }, [isActive, onEscape]);
  
  return containerRef;
}
