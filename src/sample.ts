import { Fee, LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
import { CW721 } from 'contracts'
import { Executor } from 'executor'
import { getContractAddressFromInstantiateResult } from 'utils'

// this is a sample code for bomboay-11
// sample of instantiate, mint and transfer

// test wallet address - terra1p204wtykwke52hcyt6vdh630725rdayczyzcvz
// if there are no UST in the wallet get UST from https://faucet.terra.money/
const MNEMONIC = 'attack chase glow recall give what liberty feel left include vague language dove boring rely repeat minor initial weasel income melt license camp rigid'

// On bombay cw721-base contract already deployed and that codeId is 9575
// cw721-base contract https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw721-base
const cw721CodeId = 10278

async function main() {
  // set wallet
  const lcd = new LCDClient({
    URL: 'https://bombay-lcd.terra.dev',
    chainID: 'bombay-12',
    gasPrices: '0.15uusd',
    gasAdjustment: '1.4'
  })

  // recommand to use fixed fee

  // gas_limit: gas amount, amount: total fee amount. (calculation of amount: gas_price * gas_limit + tax)
  const fee = new Fee(500000, '75000uusd')

  const key = new MnemonicKey({mnemonic: MNEMONIC})

  const wallet = new Wallet(lcd, key)

  let sequence = await wallet.sequence()

  const accountNumber = await wallet.accountNumber()

  // generate executor
  const executor = new Executor(key, lcd)

  // CW721 class
  const cw721 = new CW721({
    codeID: cw721CodeId,
    lcd,
    key
  })

  // instantiate CW721 (make new cw721 contract)
  const initMsg = cw721.init({
    name: 'test nft',
    symbol: 'TNFT',
    minter: key.accAddress
  })

  const initBroadcastResult = await executor.execute({
    msgs: [initMsg],
    fee,
    sequence,
    accountNumber
  })

  // need Tx result to get cw721 contract address 
  const initTxInfo = await executor.pollingTx(initBroadcastResult)

  sequence++

  // pull contract address from the raw log
  const nftContractAddress = getContractAddressFromInstantiateResult(initTxInfo)

  // set address on cw721 class
  cw721.contractAddress = nftContractAddress

  console.log(`Generate NFT contract, contract address - ${nftContractAddress}`)


  // mint NFT
  const mintMsg = cw721.mint(
    'NFT_1', // NFT id
    'NFT', // NFT name
    'the test nft', // NFT description
    'https://terra.money', // image URL
    key.accAddress // owner of NFT
  )

  const mint = await executor.execute({
    msgs: [mintMsg],
    fee,
    sequence,
    accountNumber
  })

  console.log(`Mint new NFT`)

  // wait for polling, because without having own node you will get sequence problem.
  await executor.pollingTx(mint)

  sequence++

  const transferMsg = cw721.transfer(
    'terra123xkp64gmwqxklgcf224a6r4pkmunggzpd420l',
    'NFT_1',
  )

  await executor.execute({
    msgs: [transferMsg],
    fee,
    sequence,
    accountNumber
  })

  console.log(`Transfer NFT to terra123xkp64gmwqxklgcf224a6r4pkmunggzpd420l`)
}

main()