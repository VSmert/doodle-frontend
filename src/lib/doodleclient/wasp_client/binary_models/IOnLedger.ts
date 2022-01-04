export interface OnLedgerArgument {
    key: string;
    value: number;
}

export interface IOnLedger {
    contract?: number;
    entrypoint?: number;
    arguments?: OnLedgerArgument[];
    noonce?: number;
}
