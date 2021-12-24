export enum LogTag {
    Site = 'Site',
    Funds = 'Funds',
    SmartContract = 'Smart Contract',
    Error = 'Error',
}

export function Log(tag: LogTag, description: string): void {
    const logMessage = `| ${tag.toString()} | - ${description}`;
    if (tag == LogTag.Error) {
        console.error(logMessage);
        //alert(logMessage);
    } else {
        console.log(logMessage);
    }
}
