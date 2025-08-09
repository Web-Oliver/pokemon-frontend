/**
 * useToggle Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Standardized boolean state management hook
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles boolean toggle logic
 * - DRY: Eliminates repetitive boolean useState patterns
 * - Reusability: Generic hook for any boolean state needs
 */

import { useCallback, useState } from 'react';

export interface UseToggleReturn {
  /** Current boolean state value */
  value: boolean;
  /** Toggle the boolean state */
  toggle: () => void;
  /** Set state to true */
  setTrue: () => void;
  /** Set state to false */
  setFalse: () => void;
  /** Set state to specific boolean value */
  setValue: (value: boolean) => void;
}

/**
 * Custom hook for boolean state management with toggle functionality
 * Replaces repetitive boolean useState patterns throughout the application
 * 
 * @param initialValue - Initial boolean value (default: false)
 * @returns Object with value, toggle, setTrue, setFalse, setValue functions
 * 
 * @example
 * ```typescript
 * // Replace: const [isModalOpen, setIsModalOpen] = useState(false);
 * const modal = useToggle(false);
 * 
 * // Usage:
 * <button onClick={modal.toggle}>Toggle Modal</button>
 * <button onClick={modal.setTrue}>Open Modal</button>
 * <button onClick={modal.setFalse}>Close Modal</button>
 * {modal.value && <Modal onClose={modal.setFalse} />}
 * ```
 */
export const useToggle = (initialValue: boolean = false): UseToggleReturn => {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const setValueCallback = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue: setValueCallback,
  };
};

/**
 * Multiple toggle states management hook
 * For managing multiple related boolean states
 * 
 * @param initialStates - Object with initial boolean states
 * @returns Object with toggle functions for each state
 * 
 * @example
 * ```typescript
 * const {
 *   isModalOpen,
 *   showPreview,
 *   isLoading
 * } = useMultipleToggle({
 *   isModalOpen: false,
 *   showPreview: true,
 *   isLoading: false
 * });
 * 
 * // Usage:
 * isModalOpen.toggle();
 * showPreview.setFalse();
 * isLoading.setTrue();
 * ```
 */
export const useMultipleToggle = <T extends Record<string, boolean>>(
  initialStates: T
): Record<keyof T, UseToggleReturn> => {
  const result = {} as Record<keyof T, UseToggleReturn>;
  
  Object.keys(initialStates).forEach(key => {
    result[key as keyof T] = useToggle(initialStates[key as keyof T]);
  });
  
  return result;
};

/**
 * Conditional toggle hook with validation
 * Toggle state only if condition is met
 * 
 * @param initialValue - Initial boolean value
 * @param condition - Function that returns whether toggle should be allowed
 * @returns UseToggleReturn with conditional toggle behavior
 * 
 * @example
 * ```typescript
 * const modal = useConditionalToggle(false, () => !isLoading);
 * // modal.toggle() will only work if isLoading is false
 * ```
 */
export const useConditionalToggle = (
  initialValue: boolean = false,
  condition: () => boolean
): UseToggleReturn => {
  const baseToggle = useToggle(initialValue);

  const conditionalToggle = useCallback(() => {
    if (condition()) {
      baseToggle.toggle();
    }
  }, [baseToggle.toggle, condition]);

  const conditionalSetTrue = useCallback(() => {
    if (condition()) {
      baseToggle.setTrue();
    }
  }, [baseToggle.setTrue, condition]);

  const conditionalSetFalse = useCallback(() => {
    if (condition()) {
      baseToggle.setFalse();
    }
  }, [baseToggle.setFalse, condition]);

  const conditionalSetValue = useCallback((value: boolean) => {
    if (condition()) {
      baseToggle.setValue(value);
    }
  }, [baseToggle.setValue, condition]);

  return {
    ...baseToggle,
    toggle: conditionalToggle,
    setTrue: conditionalSetTrue,
    setFalse: conditionalSetFalse,
    setValue: conditionalSetValue,
  };
};

export default useToggle;