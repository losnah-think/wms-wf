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
// Menu Structure (8 Sections, 21 Items)
// ============================================================================

export const menuSections: MenuSection[] = [
  {
    titleKey: 'dashboard',
    items: [
      { labelKey: 'dashboard', href: '/' },
    ],
  },
  {
    titleKey: 'inbound',
    items: [
      { labelKey: 'inboundSchedule', href: '/inbound/schedule' },
      { labelKey: 'inboundApproval', href: '/inbound/approval' },
    ],
  },
  {
    titleKey: 'inventory',
    items: [
      { labelKey: 'products', href: '/products' },
      { labelKey: 'warehouse', href: '/warehouse' },
      { labelKey: 'stockStatus', href: '/stock-status' },
      { labelKey: 'stockSettings', href: '/stock-settings' },
      { labelKey: 'inboundOutbound', href: '/inbound-outbound' },
      { labelKey: 'advanced', href: '/advanced-inventory' },
    ],
  },
  {
    titleKey: 'operations',
    items: [
      { labelKey: 'pickingMgmt', href: '/picking' },
      { labelKey: 'packingMgmt', href: '/packing' },
      { labelKey: 'workers', href: '/workers' },
      { labelKey: 'returnPicking', href: '/return-picking' },
    ],
  },
  {
    titleKey: 'returns',
    items: [
      { labelKey: 'returnRequest', href: '/returns/request' },
      { labelKey: 'processing', href: '/returns/process' },
      { labelKey: 'status', href: '/returns/status' },
    ],
  },
  {
    titleKey: 'shipping',
    items: [
      { labelKey: 'shipments', href: '/shipping' },
      { labelKey: 'settings', href: '/shipping/settings' },
    ],
  },
  {
    titleKey: 'reports',
    items: [
      { labelKey: 'currentReport', href: '/reports/current' },
      { labelKey: 'analysis', href: '/reports/analysis' },
    ],
  },
  {
    titleKey: 'system',
    items: [
      { labelKey: 'operationRules', href: '/system/rules' },
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
