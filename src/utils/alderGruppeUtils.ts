/**
 * Utility functions for dynamic age group handling
 * Aldersgrupper skal alltid hentes dynamisk fra API-responsen og aldri hardkodes
 */

// Base colors that can be used for age groups - these will be assigned dynamically
const BASE_AGE_COLORS = [
  "#0e4d1b", // Dark green
  "#208444", // Medium green  
  "#32bf66", // Light green
  "#999b9d", // Gray for unknown
  "#1a5f3f", // Alternative green 1
  "#2a7f5f", // Alternative green 2
  "#4abf7f", // Alternative green 3
  "#6adf9f", // Alternative green 4
];

/**
 * Genererer dynamiske farger for aldersgrupper basert på gruppene som kommer fra API
 * @param aldersgrupper Array av aldersgrupper fra API
 * @returns Map med aldersgruppe -> farge mapping
 */
export function generateDynamicAgeColors(aldersgrupper: string[]): Map<string, string> {
  const fargeMap = new Map<string, string>();
  
  // Sorter aldersgrupper for konsistent fargeutdeling
  const sorterteGrupper = [...aldersgrupper].sort((a, b) => {
    // "Ukjent alder" skal alltid komme sist
    if (a.includes("Ukjent") || a.includes("ukjent")) return 1;
    if (b.includes("Ukjent") || b.includes("ukjent")) return -1;
    
    // Prøv å sortere numerisk hvis mulig
    const aNum = parseInt(a.replace(/[^0-9]/g, ''));
    const bNum = parseInt(b.replace(/[^0-9]/g, ''));
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    
    // Fallback til alfabetisk sortering
    return a.localeCompare(b);
  });
  
  sorterteGrupper.forEach((gruppe, index) => {
    fargeMap.set(gruppe, BASE_AGE_COLORS[index % BASE_AGE_COLORS.length]);
  });
  
  return fargeMap;
}

/**
 * Henter alle unike aldersgrupper fra API-data
 * @param data Array av data med alderGrupper property
 * @returns Sortert array av unike aldersgrupper
 */
export function extractUniqueAgeGroups(data: Array<{ alderGrupper?: Record<string, number> }>): string[] {
  const grupperSet = new Set<string>();
  
  data.forEach(entry => {
    if (entry.alderGrupper) {
      Object.keys(entry.alderGrupper).forEach(gruppe => grupperSet.add(gruppe));
    }
  });
  
  return Array.from(grupperSet).sort((a, b) => {
    // "Ukjent alder" skal alltid komme sist  
    if (a.includes("Ukjent") || a.includes("ukjent")) return 1;
    if (b.includes("Ukjent") || b.includes("ukjent")) return -1;
    
    // Prøv å sortere numerisk hvis mulig
    const aNum = parseInt(a.replace(/[^0-9]/g, ''));
    const bNum = parseInt(b.replace(/[^0-9]/g, ''));
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    
    // Fallback til alfabetisk sortering
    return a.localeCompare(b);
  });
}

/**
 * Sjekker om en seksjon eller avdeling er maskert
 * @param item Objekt som kan ha erMaskert property
 * @returns true hvis maskert, false ellers
 */
export function isMasked(item: { erMaskert?: boolean }): boolean {
  return Boolean(item.erMaskert);
}

/**
 * Returnerer styling for maskerte elementer
 * @param isMasked Om elementet er maskert
 * @returns CSS properties objekt
 */
export function getMaskedStyle(isMasked: boolean): React.CSSProperties {
  if (!isMasked) return {};
  
  return {
    opacity: 0.5,
    filter: 'grayscale(100%)',
    pointerEvents: 'none' as const,
  };
}

/**
 * Returnerer maskert tekst for tall hvis nødvendig
 * @param value Opprinnelig verdi
 * @param isMasked Om verdien skal maskeres
 * @returns Verdien eller "***" hvis maskert
 */
export function getMaskedValue(value: number | string, isMasked: boolean): string {
  if (isMasked) return "***";
  return typeof value === 'number' ? value.toString() : value;
}