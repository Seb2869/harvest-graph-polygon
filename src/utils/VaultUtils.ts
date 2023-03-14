import { Address, BigInt } from "@graphprotocol/graph-ts";
import { VaultContract } from "../../generated/templates/VaultListener/VaultContract";
import { NULL_ADDRESS } from "./Constant";

export function fetchUnderlyingAddress(address: Address): Address {
  const vault = VaultContract.bind(address)
  const tryUnderlying = vault.try_underlying();
  if (tryUnderlying.reverted) {
    return NULL_ADDRESS
  }

  return tryUnderlying.value
}

export function fetchPricePerFullShare(address: Address): BigInt {
  const vault = VaultContract.bind(address)
  const tryGetPricePerFullShare = vault.try_getPricePerFullShare()
  if (tryGetPricePerFullShare.reverted) {
    return BigInt.fromI32(10 ** vault.decimals())
  }
  const sharePrice: BigInt = tryGetPricePerFullShare.value
  // in some cases ppfs == 0
  if (sharePrice.le(BigInt.zero())) {
    return BigInt.fromI32(10 ** vault.decimals())
  }
  return sharePrice
}
