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
  seqeunce: number
  
  constructor(key: Key, lcd: LCDClient) {
    this.wallet = new Wallet(lcd, key)
    this.lcd = lcd
  }

  async execute(options: CreateTxOptions): Promise<TxInfo> {
    if (!this.seqeunce) {
      this.seqeunce = await this.wallet.sequence()
    }

    try {
      const tx = await this.wallet.createAndSignTx(options)
      const boradcastResult = await this.wallet.lcd.tx.broadcastSync(tx)
      const txInfo = await this.pollingTx(boradcastResult)
      this.seqeunce++
      return txInfo
    } catch (err) {
      console.log(err)
    }
  }

  async pollingTx(result: SyncTxBroadcastResult): Promise<TxInfo> {
    if (result.raw_log !== '[]') {
      throw new Error (result.raw_log)
    }

    let txInfo

    while (txInfo == undefined) {
      txInfo = await this.lcd.tx.txInfo(result.txhash).catch(err => undefined)
      await delay(1000)
    }

    return txInfo
  }
}
