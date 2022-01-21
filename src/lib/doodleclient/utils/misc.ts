export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const EmptyAgentID = "1111111111111111111111111111111111111";
