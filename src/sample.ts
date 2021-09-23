import { Fee, LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
import { CW721 } from 'contracts'
import { Executor } from 'executor'
import { getContractAddressFromInstantiateResult } from 'utils'

// this is a sample code for bomboay-10

// test wallet address - terra1p204wtykwke52hcyt6vdh630725rdayczyzcvz
// if there are no UST in the wallet get UST from https://faucet.terra.money/
const MNEMONIC = 'attack chase glow recall give what liberty feel left include vague language dove boring rely repeat minor initial weasel income melt license camp rigid'

// On bombay cw721-base contract already deployed and that codeId is 9575
// cw721-base contract https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw721-base
const cw721CodeId = 9575

async function main() {
  // set wallet
  const lcd = new LCDClient({
    URL: 'https://bombay-lcd.terra.dev',
    chainID: 'bombay-11',
    gasPrices: '0.15uusd',
    gasAdjustment: '1.4'
  })

  // recommand to use fixed fee
  const fee = new Fee(500000, '75000uusd')

  const key = new MnemonicKey({mnemonic: MNEMONIC})

  const wallet = new Wallet(lcd, key)

  let sequence = await wallet.sequence()

  const accountNumber = await wallet.accountNumber()

  // generate executor
  const executor = new Executor(key, lcd)

  // CW721 contract
  const cw721 = new CW721({
    codeID: cw721CodeId,
    lcd,
    key
  })

  // instantiateCW721
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
  
  sequence++

  const initTxInfo = await executor.pollingTx(initBroadcastResult)

  const nftContractAddress = getContractAddressFromInstantiateResult(initTxInfo)

  cw721.contractAddress = nftContractAddress

  console.log(`Generate NFT contract, contract address - ${nftContractAddress}`)

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

  await executor.pollingTx(mint)

  sequence++

  const transferMsg = cw721.transfer(
    'terra123xkp64gmwqxklgcf224a6r4pkmunggzpd420l',
    'NFT_1'
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