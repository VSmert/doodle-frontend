export interface IPlayer {
    name: string;
    color: string;
    bank: bigint;
    onTable: bigint;
    hasCards: boolean;
    tableNumber: number;
    tableSeatNumber: number;
}
