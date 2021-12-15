import config from '../../conf.dev';
import { BasicClient, Buffer, Colors, IKeyPair, IOffLedger, IOnLedger, OffLedger, WalletService } from '../wasp_client';
import { createNanoEvents, Emitter, Unsubscribe } from 'nanoevents';
import { HName } from '../wasp_client/crypto/hname';

type MessageHandlers = { [key: string]: () => void };
type ParameterResult = { [key: string]: Buffer };

export interface PlayerJoin {
  tableNumber: number;
  tableSeatNumber: number;
  playerAgentId: string;
  playersInitialChipCount: bigint;
}
export interface PlayerLeft {
  tableNumber: number;
  tableSeatNumber: number;
}

export interface GameStarted {
  tableNumber: number;
  paidBigBlindTableSeatNumber: number;
  paidSmallBlindTableSeatNumber: number;
}

export interface GameEnded {
  tableNumber: number;
}

export interface Events {
  playerJoinsNextHand: (msg: PlayerJoin) => void;
  gameStarted: (msg: GameStarted) => void;
  gameEnded: (msg: GameEnded) => void;
  playerLeft: (msg: PlayerLeft) => void;
}

export class ViewEntrypoints {
  public static readonly getTableCount: string = 'getTableCount';
}

export class DoodleService {
  private readonly scName: string = config.contractName;
  private readonly scHName: string = HName.HashAsString(this.scName);
  private readonly scPlaceBet: string = 'placeBet';

  private client: BasicClient;
  private walletService: WalletService;
  private webSocket: WebSocket | undefined;
  private emitter: Emitter;

  public chainId: string;
  public static readonly roundLength: number = 60; // in seconds

  constructor(client: BasicClient, chainId: string) {
    this.walletService = new WalletService(client);
    this.client = client;
    this.chainId = chainId;
    this.emitter = createNanoEvents();

    this.connectWebSocket();
  }

  private connectWebSocket(): void {
    const webSocketUrl = config.waspWebSocketUrl.replace('%chainId', this.chainId);
    // eslint-disable-next-line no-console
    console.log(`Connecting to Websocket => ${webSocketUrl}`);
    this.webSocket = new WebSocket(webSocketUrl);
    this.webSocket.addEventListener('message', (x) => this.handleIncomingMessage(x));
    this.webSocket.addEventListener('close', () => setTimeout(this.connectWebSocket.bind(this), 1000));
  }

  private handleVmMessage(message: string[]): void {
    const messageHandlers: MessageHandlers = {
      'doodle.playerJoinsNextHand': () => {
        const playerJoin: PlayerJoin = {
          playerAgentId: message[2],
          playersInitialChipCount: BigInt(message[3]),
          tableNumber: Number(message[4]),
          tableSeatNumber: Number(message[5]),
        };

        this.emitter.emit('playerJoinsNextHand', playerJoin);
      },
      'doodle.gameStarted': () => {
        const gameStarted: GameStarted = {
          paidBigBlindTableSeatNumber: Number(message[2]),
          paidSmallBlindTableSeatNumber: Number(message[3]),
          tableNumber: Number(message[4]),
        };

        this.emitter.emit('gameStarted', gameStarted);
      },
      'doodle.gameEnded': () => {
        const gameEnded: GameEnded = {
          tableNumber: Number(message[2]),
        };

        this.emitter.emit('gameEnded', gameEnded);
      },
      'doodle.playerLeft': () => {
        const playerLeft: PlayerLeft = {
          tableNumber: Number(message[2]),
          tableSeatNumber: Number(message[3]),
        };

        this.emitter.emit('playerLeft', playerLeft);
      },
    };

    const topic=message[0].substr(message[0].indexOf(": ")).replace(": ","");

    if (typeof messageHandlers[topic] != 'undefined') {
      messageHandlers[topic]();
    }
  }

  private handleIncomingMessage(message: MessageEvent<string>): void {
    const msg = message.data.toString().split('|');

    if (msg.length == 0 || !msg[0].startsWith('vmmsg')) {
      return;
    }

    this.handleVmMessage(msg);
  }

  public async placeBetOffLedger(keyPair: IKeyPair, betNumber: number, take: bigint): Promise<void> {
    let betRequest: IOffLedger = {
      requestType: 1,
      arguments: [{ key: '-number', value: betNumber }],
      balances: [{ balance: take, color: Colors.IOTA_COLOR_BYTES }],
      contract: HName.HashAsNumber(this.scName),
      entrypoint: HName.HashAsNumber(this.scPlaceBet),
      noonce: BigInt(performance.now() + performance.timeOrigin * 10000000),
    };

    betRequest = OffLedger.Sign(betRequest, keyPair);

    await this.client.sendOffLedgerRequest(this.chainId, betRequest);
    await this.client.sendExecutionRequest(this.chainId, OffLedger.GetRequestId(betRequest));
  }

  public async placeBetOnLedger(keyPair: IKeyPair, address: string, betNumber: number, take: bigint): Promise<void> {
    const betRequest: IOnLedger = {
      contract: HName.HashAsNumber(this.scName),
      entrypoint: HName.HashAsNumber(this.scPlaceBet),
      arguments: [
        {
          key: '-number',
          value: betNumber,
        },
      ],
    };

    await this.walletService.sendOnLedgerRequest(keyPair, address, this.chainId, betRequest, take);
  }

  public async joinNextHand(keyPair: IKeyPair, address: string): Promise<void> {
    const joinNextHandRequest: IOnLedger = {
      contract: HName.HashAsNumber(this.scName),
      entrypoint: HName.HashAsNumber(this.scPlaceBet),
      // arguments: [
      //   {
      //     key: '-tableNumber',
      //     value: tableNumber,
      //   },
      //   {
      //     key: '-tableSeatNumber',
      //     value: tableSeatNumber,
      //   }
      //   ,
      // ],
    };

    await this.walletService.sendOnLedgerRequest(keyPair, address, this.chainId, joinNextHandRequest);
  }



  public async callView(viewName: string): Promise<ParameterResult> {
    const response = await this.client.callView(this.chainId, this.scHName, viewName);
    const resultMap: ParameterResult = {};
    if (response.Items) {
      for (const item of response.Items) {
        const key = Buffer.from(item.Key, 'base64').toString();
        const value = Buffer.from(item.Value, 'base64');

        resultMap[key] = value;
      }
    }

    return resultMap;
  }

  public async getTableCount(): Promise<number> {
    const response = await this.callView(ViewEntrypoints.getTableCount);
    const tableCount = response["tableCount"];

    if (!tableCount) {
      throw Error(`Failed to get ${ViewEntrypoints.getTableCount}`);
    }
    return tableCount.readInt32LE(0);
  }

  public on<E extends keyof Events>(event: E, callback: Events[E]): Unsubscribe {
    return this.emitter.on(event, callback);
  }
}
