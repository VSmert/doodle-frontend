export enum LogTag {
    Site = 'Site',
    Funds = 'Funds',
    SmartContract = 'Smart Contract',
    Error = 'Error',
}

export function Log(tag: LogTag, description: string): void {
    console.log(tag.toString(), description);
}
