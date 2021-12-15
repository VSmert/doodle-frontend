import config from '../conf.dev';
import type { GameEnded, GameStarted, PlayerJoin, PlayerLeft } from './doodle_client';
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
  doodleService.on('playerJoinsNextHand', (msg : PlayerJoin) => {
    log(LogTag.SmartContract, "playerJoinsNextHand: " + msg.playerAgentId + " " + msg.playersInitialChipCount + " " +msg.tableNumber + " " +msg.tableSeatNumber);
  });
  doodleService.on('gameStarted', (msg : GameStarted) => {
    log(LogTag.SmartContract, "gameStarted: " +  msg.paidBigBlindTableSeatNumber + " " + msg.paidSmallBlindTableSeatNumber + " " +msg.tableNumber);
  });
  doodleService.on('gameEnded', (msg : GameEnded) => {
    log(LogTag.SmartContract,  "gameEnded: " + msg.tableNumber);
  });
  doodleService.on('playerLeft', (msg : PlayerLeft) => {
    log(LogTag.SmartContract,  "playerLeft: " + msg.tableNumber + " " + msg.tableSeatNumber);
  });
 }

export function isWealthy(balance: bigint): boolean {
  return balance >= 200;
}
