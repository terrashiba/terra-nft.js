import {
  LCDClient,
  Wallet,
  Key,
  SyncTxBroadcastResult,
  CreateTxOptions,
  TxInfo
} from '@terra-money/terra.js'

import { delay } from 'bluebird'

export class Executor {
  wallet: Wallet
  lcd: LCDClient
  
  constructor(key: Key, lcd: LCDClient) {
    this.wallet = new Wallet(lcd, key)
    this.lcd = lcd
  }

  async execute(options: CreateTxOptions): Promise<SyncTxBroadcastResult> {
    try {
      const tx = await this.wallet.createAndSignTx(options)
      return this.wallet.lcd.tx.broadcastSync(tx)
    } catch (err) {
      console.log(err)
    }
  }

  async pollingTx(result: SyncTxBroadcastResult): Promise<TxInfo> {
    if (result.raw_log !== '[]') {
      throw new Error (result.raw_log)
    }

    let txInfo

    while (txInfo) {
      txInfo = await this.lcd.tx.txInfo(result.txhash)
      await delay(1000)
    }

    return txInfo
  }
}
