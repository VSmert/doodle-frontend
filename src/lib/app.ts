import config from '../conf.dev';
import type { Bet } from './doodle_client';
import { DoodleService } from './doodle_client';
import { delay } from './utils';
import { BasicClient, Colors, PoWWorkerManager, WalletService, Buffer, IKeyPair } from './wasp_client';
import { Base58 } from './wasp_client/crypto/base58';
import { Seed } from './wasp_client/crypto/seed';

let client: BasicClient;
let walletService: WalletService;
let doodleService: DoodleService;

let timestamp : number
let seed : Buffer;
let addressIndex: number;
let address : string;
let keyPair : IKeyPair;
let firstTimeRequestingFunds: boolean = true;
let requestingFunds: boolean;
let balance: bigint;
// eslint-disable-next-line no-undef
let timestampUpdaterHandle: NodeJS.Timer | undefined;
let initialized: boolean = false;

const powManager: PoWWorkerManager = new PoWWorkerManager();
export const BETTING_NUMBERS = 8;
export const ROUND_LENGTH = 60; // in seconds

const DEFAULT_AUTODISMISS_TOAST_TIME = 5000; // in milliseconds

export const GOSHIMMER_ADDRESS_EXPLORER_URL = 'https://goshimmer.sc.iota.org/explorer/address';

export enum LogTag {
  Site = 'Site',
  Funds = 'Funds',
  SmartContract = 'Smart Contract',
  Error = 'Error',
}

export enum StateMessage {
  Running = 'Running',
  Start = 'Start',
  AddFunds = 'AddFunds',
  ChoosingNumber = 'ChoosingNumber',
  ChoosingAmount = 'ChoosingAmount',
  PlacingBet = 'PlacingBet',
}

export function log(tag: string, description: string): void {
  console.log(tag,description);
}

export async function initialize(): Promise<void> {
  if (initialized) {
    return;
  }
  log(LogTag.Site, 'Initializing wallet');
  if (config.seed) {
    seed = Base58.decode(config.seed);
  } else {
    seed = Seed.generate();
  }
  client = new BasicClient({
    GoShimmerAPIUrl: config.goshimmerApiUrl,
    WaspAPIUrl: config.waspApiUrl,
    SeedUnsafe: seed,
  });

  doodleService = new DoodleService(client, config.chainId);
  walletService = new WalletService(client);

  //powManager.load('/build/pow.worker.js');

  subscribeToDoodleEvents();
  setAddress(0);
  void updateFunds();

  startTimeUpdater();
  let tableCount : number;
  const requests = [
    doodleService.getTableCount().then((x) => {
      tableCount = x;
      console.log("tables: "+x);
    }),
  ];

  try {
    await Promise.all(requests);
    log(LogTag.Site, 'Demo loaded');
  } catch (e: unknown) {
    log(LogTag.Error, 'There was an error loading the demo');
  }

  initialized = true;
}

export function setAddress(index: number): void {
  address = Seed.generateAddress(seed, index);
  keyPair = Seed.generateKeyPair(seed, index);
}

export function createNewAddress(): void {
  // addressesHistory.update((_history) => [..._history, get(address)]);
  // addressIndex.update(($addressIndex) => $addressIndex + 1);
  setAddress(0);
}

export async function updateFunds(): Promise<void> {
  let _balance = 0n;
  try {
    _balance = await walletService.getFunds(address, Colors.IOTA_COLOR_STRING);
  } finally {
    balance = _balance;
    log("new fund", _balance.toString());
  }
}

export async function updateFundsMultiple(nTimes: number): Promise<void> {
  const _balance = balance;

  for (let i = 0; i < nTimes; i++) {
    await updateFunds();

    if (_balance != balance) {
      // Exit early if the balance updated
      return;
    }

    await delay(2500);
  }
}

export function startTimeUpdater(): void {
  if (timestampUpdaterHandle) {
    clearInterval(timestampUpdaterHandle);
    timestampUpdaterHandle = undefined;
  }
  timestampUpdaterHandle = setInterval(() => timestamp = Date.now() / 1000), 1000;
}

export async function joinNextHand(tableNumber: number, tableSeatNumber: number): Promise<void> {
  try {
    console.log("current balance is: " + balance);
    await doodleService.joinNextHand(
      keyPair,
      address
    );

    log(LogTag.SmartContract, 'joined next hand');
  } catch (ex: unknown) {
    const error = ex as Error;
    log(LogTag.Error, error.message);
    throw ex;
  }
}

export async function sendFaucetRequest(): Promise<void> {
  log(LogTag.Funds, 'GoShimmer nodes received a request for devnet funds. Sending funds to your wallet');

  if (!firstTimeRequestingFunds) {
    createNewAddress();
  }
  firstTimeRequestingFunds = false;

  requestingFunds = true;

  const faucetRequestResult = await walletService.getFaucetRequest(address);

  // In this example a difficulty of 12 is enough, might need a retune for prod to 21 or 22
  faucetRequestResult.faucetRequest.nonce = await powManager.requestProofOfWork(12, faucetRequestResult.poWBuffer);

  try {
    await client.sendFaucetRequest(faucetRequestResult.faucetRequest);
  } catch (ex: unknown) {
    const error = ex as Error;
    log(LogTag.Error, error.message);
  }
  requestingFunds = false;
  await updateFundsMultiple(3);
}

export function subscribeToDoodleEvents(): void {
  doodleService.on('joinsNextHand', (msg : Bet) => {
    // void updateFunds();
    // // To mitigate time sync variances, we ignore the provided timestamp and use our local one.
    // round.update(($round) => ({ ...$round, active: true, startedAt: Date.now() / 1000, logs: [] }));
    log(LogTag.SmartContract, msg.playerAgentId + " " + msg.playersInitialChipCount + " " +msg.tableNumber + " " +msg.tableSeatNumber);
  });

//   doodleService.on('roundStopped', () => {
//     void updateFunds();
//     if (get(placingBet) || get(showBettingSystem)) {
//       showNotification({
//         type: Notification.Info,
//         message: 'The current round just ended. Your bet will be placed in the next round. ',
//         timeout: DEFAULT_AUTODISMISS_TOAST_TIME,
//       });
//     } else if (get(round).betPlaced && !get(isAWinnerPlayer)) {
//       showNotification({
//         type: Notification.Lose,
//         message: 'Sorry, you lost this round. Try again!',
//         timeout: DEFAULT_AUTODISMISS_TOAST_TIME,
//       });
//     }
//     const winners = get(round).winners;

//     if (winners > 0) {
//       log(LogTag.SmartContract, `Distributed the iotas to  ${winners === 1 ? '1 winner.' : `${winners} winners.`}`);
//     }

//     resetRound();

//     log(LogTag.SmartContract, 'Round Ended. Current bets cleared');
//   });

//   doodleService.on('roundNumber', (roundNumber: bigint) => {
//     round.update(($round) => ({ ...$round, number: roundNumber }));
//     log(LogTag.SmartContract, `Round number: ${roundNumber}`);
//   });

//   doodleService.on('winningNumber', (winningNumber: bigint) => {
//     round.update(($round) => ({ ...$round, winningNumber }));
//     showWinningNumber.set(true);

//     log(LogTag.SmartContract, 'The winning number was decided');
//     log(LogTag.SmartContract, `${winningNumber} is the winning number!`);
//   });

//   doodleService.on('betPlaced', (bet: Bet) => {
//     placingBet.set(false);
//     round.update(($round) => {
//       if (bet.better === get(address)) {
//         $round.betPlaced = true;
//         $round.betAmount = 0n;
//         log(LogTag.SmartContract, 'Your number and betting amounts are saved');
//         void updateFunds();
//       }
//       $round.players.push({
//         address: bet.better,
//         bet: bet.amount,
//         number: bet.betNumber,
//       });
//       return $round;
//     });
//   });

//   doodleService.on('payout', (bet: Bet) => {
//     round.update(($round) => {
//       $round.winners += 1;
//       return $round;
//     });

//     if (bet.better === get(address) || get(addressesHistory).includes(bet.better)) {
//       showNotification({
//         type: Notification.Win,
//         message: `Congratulations! You just won the round. You received ${bet.amount} iotas.`,
//         timeout: DEFAULT_AUTODISMISS_TOAST_TIME,
//       });
//       showWinnerAnimation();
//       void updateFunds();
//     }
//     log(LogTag.SmartContract, `Payout for ${bet.better} with ${bet.amount}i`);
//   });
 }

export function isWealthy(balance: bigint): boolean {
  return balance >= 200;
}
