export interface ITableInfo {
    number: number;
    size: number;
    smallBlindInSeatNumber: number;
    bigBlindInSeatNumber: number;
    handInProgress: boolean;
    potsCount: number;
}

export interface ITableSeat {
    number: number;
    agentID: string;
    chipCount: bigint;
    isInHand: boolean;
    joiningNextBigBlind: boolean;
    joiningNextHand: boolean;
}
