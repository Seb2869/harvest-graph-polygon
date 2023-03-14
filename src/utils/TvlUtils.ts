import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { fetchContractDecimal, fetchContractTotalSupply } from "./ERC20Utils";
import { fetchPricePerFullShare } from "./VaultUtils";
import { BD_ZERO } from "./Constant";

export function calculateTvlUsd(vaultAddress: Address, price: BigDecimal): BigDecimal {
  if (price.le(BigDecimal.zero())) {
    return BD_ZERO
  }
  const totalSupply = fetchContractTotalSupply(vaultAddress).toBigDecimal()
  const decimal = fetchContractDecimal(vaultAddress)
  const tempDecimal = BigDecimal.fromString((10 ** decimal.toI64()).toString())
  const sharePriceDivDecimal = fetchPricePerFullShare(vaultAddress).toBigDecimal().div(tempDecimal)

  return totalSupply.div(tempDecimal).times(price).times(sharePriceDivDecimal)
}