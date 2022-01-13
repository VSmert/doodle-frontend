// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as wasmclient from "./index"
import {Base58} from "./crypto";
import {Buffer} from "./buffer";
import { Colors } from "./colors";

export class Transfer {
    private xfer = new Map<string, wasmclient.Uint64>();

    static iotas(amount: wasmclient.Uint64): Transfer {
        return Transfer.tokens(Colors.IOTA_COLOR, amount);
    }

    static tokens(color: string, amount: wasmclient.Uint64): Transfer {
        const transfer = new Transfer();
        transfer.set(color, amount);
        return transfer;
    }

    set(color: string, amount: wasmclient.Uint64) {
        if (color == Colors.IOTA_COLOR) {
            color = Colors.IOTA_COLOR_STRING
        }
        this.xfer.set(color, amount);
    }

    get(color: string): wasmclient.Uint64 {
        if (color == Colors.IOTA_COLOR) color = Colors.IOTA_COLOR_STRING;
        const amount = this.xfer.get(color) ?? 0n;
        return amount;
    }

    // Encode returns a byte array that encodes the Transfer as follows:
    // Sort all nonzero transfers in ascending color order (very important,
    // because this data will be part of the data that will be signed,
    // so the order needs to be 100% deterministic). Then emit the 4-byte
    // transfer count. Next for each color emit the 32-byte color value,
    // and then the 8-byte amount.
    encode(): wasmclient.Bytes {
        const keys = new Array<string>();
        for (const [key, val] of this.xfer) {
            // filter out zero transfers
            if (val != BigInt(0)) {
                keys.push(key);
            }
        }
        keys.sort((lhs, rhs) => lhs.localeCompare(rhs));

        let buf = Buffer.alloc(4);
        buf.writeUInt32LE(keys.length, 0);
        for (const key of keys) {
            const val = this.xfer.get(key);
            if (!val) {
                throw new Error("Transfer.encode: missing amount?");
            }
            const keyBuf = Base58.decode(key);
            const valBuf = Buffer.alloc(8);
            valBuf.writeBigUInt64LE(val, 0);
            buf = Buffer.concat([buf, keyBuf, valBuf]);
        }
        return buf;
    }
}
