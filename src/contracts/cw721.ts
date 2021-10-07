import { AccAddress, MsgExecuteContract, MsgInstantiateContract } from '@terra-money/terra.js'
import { Contract } from './contract'
import { Expiration, Extension } from 'types'
import { trimMsg } from 'utils/trimType';


interface InitMsg {
  name: string,
  symbol: string,
  minter: AccAddress
}

interface OwnerOfResponse {
  owner: string
  approvals: {
    spender: string
    expires: Expiration
  }[]
}

interface ApproveAllResponse {
  operators: {
    spender: string
    expires: Expiration
  }[]
}

interface NumTokensResponse {
  count: number
}

interface ContractInfoResponse {
  name: string
  symbol: string
}

interface NftInfoResponse {
  token_uri: string
  extension: Extension
}

interface AllNftInfoResponse {
  access:{
    owner: string
    approvals: {
      spender: string
      expires: Expiration
    }[]
  }
  info: NftInfoResponse
}

interface TokensResponse {
  tokens: string[]
}

interface MinterResponse {
  minter: string
}

export class CW721 extends Contract{
  public init(init_msg: InitMsg): MsgInstantiateContract {
    return this.createInstantiateMsg(init_msg, {});
  }

  // Create msg

  // Mint a new NFT, can only be called by the contract minter
  public mint(
    token_id: string,
    token_uri?: string,
    extension?: Extension,
    owner: AccAddress = this.key.accAddress
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      mint: { 
        token_id,
        token_uri,
        extension,
        owner 
      }
    })
  }

  // Transfer is a base message to move a token to another account without triggering actions
  public transfer(
    recipient: string,
    token_id: string
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      transfer_nft: { recipient, token_id }
    })
  }

  // Send is a base message to transfer a token to a contract and trigger an action on reciving contract
  public send(
    contract: AccAddress,
    token_id: string,
    msg: JSON
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      send_nft: { 
        contract,
        token_id,
        msg: trimMsg(msg)
      }
    })
  }

  // Allows operator to transfer / send the token from the owner's account.
  public approve(
    spender: AccAddress,
    token_id: string,
    expires?: Expiration
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      approve: { spender, token_id, expires: expires? expires : { never: {}} }
    })
  }

  // Allows operator to transfer / send any token from the owner's account.
  public approveAll(
    operator: AccAddress,
    expires?: Expiration
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      approve_all: { operator, expires: expires? expires : { never: {}} }
    })
  }

  // Remove previously granted Approval
  public revoke(
    spender: AccAddress,
    token_id: string
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      revoke: { spender, token_id }
    })
  }

  // Remove previously granted ApproveAll permission
  public revokeAll(
    spender: AccAddress,
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      revoke: { spender }
    })
  }


  // QueryMsg
  public ownerOfQuery(
    token_id: string,
    include_expired?: boolean
  ): Promise<OwnerOfResponse> {
    return this.query({
      owner_of: {
        token_id,
        include_expired
      }
    })
  }

  public approvedForAllQuery(
    owner: string,
    include_expired?: boolean,
    start_after?: string,
    limit?: number
  ): Promise<ApproveAllResponse> {
    return this.query({
      approved_for_all: {
        owner,
        include_expired,
        start_after,
        limit
      }
    })
  }

  public numTokensQuery(): Promise<NumTokensResponse> {
    return this.query({
      num_tokens:{}
    })
  }

  public contractInfoQuery(): Promise<ContractInfoResponse> {
    return this.query({
      contract_info:{}
    })
  }

  public nftInfoQuery(
    token_id: string
  ): Promise<NftInfoResponse> {
    return this.query({
      nft_info:{
        token_id
      }
    })
  }

  public allNftInfoQuery(
    token_id: string,
    include_expired?: Expiration
  ): Promise<AllNftInfoResponse> {
    return this.query({
      all_nft_info:{
        token_id,
        include_expired,
      }
    })
  }

  public tokensQuery (
    owner: string,
    start_after?: string,
    limit?: number
  ): Promise<TokensResponse> {
    return this.query({
      tokens:{
        owner,
        start_after,
        limit
      }
    })
  }

  public allTokensQuery (
    start_after?: string,
    limit?: number
  ): Promise<TokensResponse> {
    return this.query({
      all_tokens:{
        start_after,
        limit
      }
    })
  }

  public minterQuery (): Promise<MinterResponse> {
    return this.query({
      minter: {}
    })
  }
}
