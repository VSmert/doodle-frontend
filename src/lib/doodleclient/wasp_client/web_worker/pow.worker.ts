/* eslint-disable no-console */
import { Log, LogTag } from '../../utils/logger';
import ProofOfWork from '../proof_of_work';
import type { PowWorkerRequest, PowWorkerResponse } from './pow_worker_manager';

const ctx: Worker = self as never;

ctx.onmessage = (e) => {
    const message: PowWorkerRequest = e.data;

    if (message.type != 'pow_request') {
        return;
    }

    let nonce = -1;

    Log(LogTag.Funds, `[${message.uuid}] Starting PoW!`);

    try {
        nonce = ProofOfWork.calculateProofOfWork(message.difficulty, message.data);
    } catch (ex) {
        ctx.postMessage({ type: 'pow_response', error: ex, uuid: message.uuid });
        Log(LogTag.Error, 'PoW failed!');
        return;
    }

    Log(LogTag.Funds, `[${message.uuid}] PoW Done!`);

    const response: PowWorkerResponse = { type: 'pow_response', data: nonce, uuid: message.uuid };

    ctx.postMessage(response);
};
