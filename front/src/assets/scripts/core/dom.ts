/**
 * DOM Utilities
 */

/**
 * Get a single DOM element by ID with optional type checking
 * @param id - The element ID
 * @param type - Optional constructor for runtime type validation
 * @returns The element cast to type T, or null if not found or type mismatch
 */
export function getElement<T extends HTMLElement>(
  id: string,
  type?: new () => T,
): T | null {
  const element = document.getElementById(id);
  if (!element) {
    return null;
  }
  // runtime type validation if type constructor provided
  if (type && !(element instanceof type)) {
    console.warn(
      `Element #${id} exists but is not of expected type ${type.name}`,
    );
    return null;
  }
  return element as T;
}

/**
 * ElementConfig type for getElements function
 */
type ElementConfig = Record<string, new () => HTMLElement>;

/**
 * Get multiple DOM elements by ID with type checking
 * @param config - Object mapping element IDs to their expected types
 * @returns Partial object with successfully retrieved elements
 */
export function getElements<T extends ElementConfig>(
  config: T,
): Partial<{ [K in keyof T]: InstanceType<T[K]> }> {
  const result: Partial<{ [K in keyof T]: InstanceType<T[K]> }> = {};
  for (const [id, Type] of Object.entries(config)) {
    const element = getElement(id, Type);
    if (element) {
      result[id as keyof T] = element as InstanceType<T[keyof T]>;
    }
  }
  return result;
}

/**
 * Safe querySelector with type casting
 * @param selector - CSS selector
 * @param parent - Parent element to search within (defaults to document)
 * @returns The first matching element, or null
 */
export function querySelector<T extends HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document,
): T | null {
  return parent.querySelector<T>(selector);
}

/**
 * Safe querySelectorAll with type casting
 * @param selector - CSS selector
 * @param parent - Parent element to search within (defaults to document)
 * @returns NodeList of matching elements
 */
export function querySelectorAll<T extends HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document,
): NodeListOf<T> {
  return parent.querySelectorAll<T>(selector);
}
