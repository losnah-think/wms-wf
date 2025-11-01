// ============================================================================
// Navigation Types
// ============================================================================

export interface MenuItem {
  label?: string  // Deprecated: use labelKey instead
  labelKey: string  // Translation key for the label
  href: string
  icon?: string
}

export interface MenuSection {
  title?: string  // Deprecated: use titleKey instead
  titleKey: string  // Translation key for the section title
  items: MenuItem[]
}

// ============================================================================
// Translation Key Helpers
// ============================================================================

export function getSectionTranslationKey(titleKey: string): string {
  return `nav.section.${titleKey}`
}

export function getItemTranslationKey(labelKey: string): string {
  return `nav.item.${labelKey}`
}

// ============================================================================
// Menu Structure (Optimized - Only Active Features)
// ============================================================================

export const menuSections: MenuSection[] = [
  {
    titleKey: 'warehouse',
    items: [
      { labelKey: 'warehouseInfo', href: '/warehouse' },
      { labelKey: 'warehouseLayout', href: '/warehouse/layout' },
      { labelKey: 'locationMgmt', href: '/warehouse/location' },
      { labelKey: 'barcodeMgmt', href: '/warehouse/barcode' },
    ],
  },
  {
    titleKey: 'inventory',
    items: [
      { labelKey: 'stockStatus', href: '/stock-status' },
      { labelKey: 'stockAudit', href: '/stock-audit' },
    ],
  },
]

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a menu item by its href path
 * @param href - The href to search for
 * @returns The matching MenuItem or undefined
 */
export function getMenuItemByHref(href: string): MenuItem | undefined {
  for (const section of menuSections) {
    const item = section.items.find((item) => item.href === href)
    if (item) {
      return item
    }
  }
  return undefined
}

/**
 * Get all menu items flattened into a single array
 * @returns Array of all menu items
 */
export function getAllMenuItems(): MenuItem[] {
  return menuSections.flatMap((section) => section.items)
}

/**
 * Get the section that contains a specific href
 * @param href - The href to search for
 * @returns The MenuSection containing the href or undefined
 */
export function getSectionByHref(href: string): MenuSection | undefined {
  return menuSections.find((section) =>
    section.items.some((item) => item.href === href)
  )
}

/**
 * Check if a given href exists in the menu structure
 * @param href - The href to check
 * @returns True if the href exists
 */
export function isValidRoute(href: string): boolean {
  return getAllMenuItems().some((item) => item.href === href)
}

/**
 * Get all hrefs as an array of strings
 * @returns Array of all href paths
 */
export function getAllHrefs(): string[] {
  return getAllMenuItems().map((item) => item.href)
}
