import { Fee, LCDClient, MnemonicKey, MsgExecuteContract, Wallet } from '@terra-money/terra.js'
import { CW721 } from 'contracts'
import { Executor } from 'executor'
import { Extension } from 'types'
import { getContractAddressFromInstantiateResult } from 'utils'

// this is a sample code for bomboay-12
// sample of instantiate, mint and transfer

// test wallet address - terra1p204wtykwke52hcyt6vdh630725rdayczyzcvz
// if there are no UST in the wallet get UST from https://faucet.terra.money/
const MNEMONIC = 'attack chase glow recall give what liberty feel left include vague language dove boring rely repeat minor initial weasel income melt license camp rigid'

// On bombay cw721-base contract already deployed and that codeId is 10312
// cw721 contract https://github.com/CosmWasm/cw-nfts/tree/main/packages/cw721
const cw721CodeId = 12353

async function main() {
  // set wallet
  const lcd = new LCDClient({
    URL: 'https://bombay-lcd.terra.dev',
    chainID: 'bombay-12',
    gasPrices: '0.15uusd',
    gasAdjustment: '1.4'
  })

  const key = new MnemonicKey({mnemonic: MNEMONIC})

  // generate executor
  const executor = new Executor(key, lcd)

  // CW721 class
  const cw721 = new CW721({
    codeID: cw721CodeId,
    lcd,
    key
  })

  // instantiate CW721 (make new cw721 contract)
  await instantiate(cw721, executor)

  // mint NFTs
  await mint(cw721, executor)

  // transfer NFTs
  await transfer(cw721, executor)

  // show owner result
  console.log(
    'terra1p204wtykwke52hcyt6vdh630725rdayczyzcvz owns'
    ,await cw721.tokensQuery('terra1p204wtykwke52hcyt6vdh630725rdayczyzcvz')
  )

  console.log(
    'terra123xkp64gmwqxklgcf224a6r4pkmunggzpd420l owns'
    ,await cw721.tokensQuery('terra123xkp64gmwqxklgcf224a6r4pkmunggzpd420l')
  )

}

main()

async function instantiate(cw721: CW721, executor: Executor): Promise<void> {
  // recommand to use fixed fee

  // gas_limit: gas amount, amount: total fee amount. (calculation of amount: gas_price * gas_limit + tax)
  const fee = new Fee(500000, '75000uusd')

  const key = executor.wallet.key

  const initMsg = cw721.init({
    name: 'test nft',
    symbol: 'TNFT',
    minter: key.accAddress
  })

  const initTxInfo = await executor.execute({
    msgs: [initMsg],
    fee,
  })

  // pull contract address from the raw log
  const nftContractAddress = getContractAddressFromInstantiateResult(initTxInfo)

  // set address on cw721 class
  cw721.contractAddress = nftContractAddress

  console.log(`Generate NFT contract, contract address - ${nftContractAddress}`)
}


async function mint(cw721: CW721, executor: Executor): Promise<void> {
  const mintMsgs: MsgExecuteContract[] = []
  const sampleCount = 6

  for (let id = 1; id <= sampleCount; id++){

    // extension info
    const sampleExtension: Extension = {
      image: 'https://image' + id.toString(),
      attributes: [
        {
          trait_type: 'trait1',
          value: id.toString()
        }
      ]
    }

    const mintMsg = cw721.mint(
      'NFT_' + id.toString(),
      'https://token' + id.toString(),
      sampleExtension,
    )

    mintMsgs.push(mintMsg)
  }

  // gasSpend = baseLimit + increaseLimit * msgCount
  const mintGasLimit = 100000 + 80000 * sampleCount

  const mintGasAmount = (mintGasLimit * 0.15).toString() + 'uusd'

  const fee = new Fee(mintGasLimit, mintGasAmount)

  await executor.execute({
    msgs: mintMsgs,
    fee
  })

  console.log(`Mint new NFT`)
} 


async function transfer(cw721: CW721, executor: Executor): Promise<void> {
  const fee = new Fee(500000, '75000uusd')

  const transferMsg = cw721.transfer(
    'terra123xkp64gmwqxklgcf224a6r4pkmunggzpd420l',
    'NFT_1',
  )

  await executor.execute({
    msgs: [transferMsg],
    fee,
  })

  console.log(`Transfer NFT_1 to terra123xkp64gmwqxklgcf224a6r4pkmunggzpd420l`)
}
