export const EmptyAgentID = "1111111111111111111111111111111111111";

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function range(start: number, stop: number, step = 1): number[] {
    return [...Array(stop - start).keys()].filter((i) => !(i % Math.round(step))).map((v) => start + v);
}
