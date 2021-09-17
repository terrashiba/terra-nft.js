import { TxInfo } from "@terra-money/terra.js"

export function getContractAddressFromInstantiateResult(txInfo: TxInfo): string | void  {
  let contractAddress

  txInfo.logs.map(log => {
    log.events.map(event => {
      event.type === 'instantiate_contract' && event.attributes.map(attr => {
        if (attr.key === 'contract_address') {
          contractAddress = attr.value
        }
      })
    })
  })

  return contractAddress
}