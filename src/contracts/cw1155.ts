import { AccAddress, MsgExecuteContract, MsgInstantiateContract } from '@terra-money/terra.js'
import { Contract } from './contract'
import { Expiration, Batch } from 'types'
import { trimBatch, trimMsg } from 'utils/trimType';


interface InitMsg {
  minter: AccAddress
}

interface BalanceResponse {
  balance: string
}

interface BatchBalanceResponse {
  balance: string[]
}

interface ApprovedForAllResponse {
  operators: {
    spender: AccAddress,
    expires: Expiration
  }[]
}

interface IsApprovedForAllResponse {
  approved: true
}

interface TokenInfoResponse {
  url: string
}

interface TokensResponse {
  tokens: string[]
}

export class CW1155 extends Contract{
  public init(init_msg: InitMsg): MsgInstantiateContract {
    return this.createInstantiateMsg(init_msg, {});
  }

  // Create msg

  // Mint is a base message to mint tokens.
  public mint(
    to: AccAddress,
    token_id: string,
    value: number | string,
    msg?: JSON
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      mint: { 
        token_id,
        to,
        value: value.toString(),
        msg: trimMsg(msg)
      }
    })
  }

  // BatchMint is a base message to mint multiple types of tokens in batch.
  public batchMint(
    to: AccAddress,
    batch: Batch,
    msg?: JSON
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      batch_mint: { 
        to,
        batch: trimBatch(batch),
        msg: trimMsg(msg)
      }
    })
  }

  // BatchSendFrom is a base message to move multiple types of tokens in batch,
  // if `sender` is the owner or has sufficient pre-approval.
  public sendFrom(
    from: AccAddress,
    to: AccAddress,
    token_id: string,
    value: string | number,
    msg?: JSON
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      send_from: {
        from,
        to,
        token_id,
        value: value.toString(),
        msg: trimMsg(msg)
      }
    })
  }

  // BatchSendFrom is a base message to move multiple types of tokens in batch,
  // if `env.sender` is the owner or has sufficient pre-approval.
  public batchSendFrom(
    from: AccAddress,
    to: AccAddress,
    batch: Batch,
    msg?: JSON
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      batch_send_from: {
        from,
        to,
        batch: trimBatch(batch),
        msg: trimMsg(msg)
      }
    })
  }

  // Burn is a base message to burn tokens.
  public burn(
    from: AccAddress,
    token_id: string,
    value: number | string
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      burn: { 
        from,
        token_id,
        value: value.toString()
      }
    })
  }

  // BatchBurn is a base message to burn multiple types of tokens in batch.
  public batchBurn(
    from: AccAddress,
    batch: Batch
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      batch_burn: { 
        from,
        batch: trimBatch(batch)
      }
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

  // Remove previously granted ApproveAll permission
  public revokeAll(
    operator: AccAddress,
  ): MsgExecuteContract {
    return this.createExecuteMsg({
      revoke: { operator }
    })
  }


  // QueryMsg
  public balance(
    owner: AccAddress,
    token_id: string
  ): Promise<BalanceResponse> {
    return this.query({
      balance: {
        owner,
        token_id
      }
    })
  }

  public batchBalanceQuery(
    owner: AccAddress,
    token_ids: string[]
  ): Promise<BatchBalanceResponse> {
    return this.query({
      batch_balance: {
        owner,
        token_ids
      }
    })
  }

  public approvedForAllQuery(
    owner: AccAddress,
    include_expired?: boolean,
    start_after?: string,
    limit?: number
  ): Promise<ApprovedForAllResponse> {
    return this.query({
      approved_for_all: {
        owner,
        include_expired,
        start_after,
        limit
      }
    })
  }

  public isApprovedForAllQuery(
    owner: AccAddress,
    operator: AccAddress
  ): Promise<IsApprovedForAllResponse> {
    return this.query({
      is_approved_for_all: {
        owner,
        operator
      }
    })
  }

  public tokenInfoQuery(
    token_id: string
  ): Promise<TokenInfoResponse> {
    return this.query({
      token_info: {
        token_id
      }
    })
  }

  public tokensQuery(
    owner: AccAddress,
    start_after?: string,
    limit?: string
  ): Promise<TokensResponse> {
    return this.query({
      tokens: {
        owner,
        start_after,
        limit
      }
    })
  }

  public allTokensQuery(
    start_after?: string,
    limit?: string
  ): Promise<TokensResponse> {
    return this.query({
      all_tokens: {
        start_after,
        limit
      }
    })
  }
}