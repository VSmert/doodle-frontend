export function toColor(playerSeatNumber: number): string {
    switch (playerSeatNumber) {
        case 1:
            return "dodgerblue";
        case 2:
            return "cyan";
        case 3:
            return "lightcoral";
        case 4:
            return "crimson";
        case 5:
            return "#444";
        case 6:
            return "forestgreen";
        case 7:
            return "goldenrod";
        case 8:
            return "gold";
        case 9:
            return "#999";
        default:
            return "";
    }
}
