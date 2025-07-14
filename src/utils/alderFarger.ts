export function getAlderFarger(grupper: string[]): Map<string, string> {
    const defaultColors = [
        "#0e4d1b", "#208444", "#32bf66", "#999b9d", "#b2ebf2", "#ffb74d", "#d32f2f", "#4527a0", "#fbc02d", "#388e3c"
    ];
    const map = new Map<string, string>();
    grupper.forEach((gruppe, i) => {
        map.set(gruppe, defaultColors[i % defaultColors.length]);
    });
    return map;
}