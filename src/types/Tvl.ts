import { Address, BigDecimal, ethereum } from "@graphprotocol/graph-ts";
import { Tvl, Vault } from "../../generated/schema";
import { fetchContractTotalSupply } from "../utils/ERC20Utils";
import { BD_TEN, BD_ZERO } from "../utils/Constant";
import { pow } from "../utils/MathUtils";
import { fetchPricePerFullShare } from "../utils/VaultUtils";
import { getPriceByVault } from "../utils/PriceUtils";

export function createTvl(address: Address, transaction: ethereum.Transaction, block: ethereum.Block): void {
  const vaultAddress = address;
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const id = `${transaction.hash.toHex()}-${vaultAddress.toHex()}`
    let tvl = Tvl.load(id)
    if (tvl == null) {
      tvl = new Tvl(id);

      tvl.vault = vault.id
      tvl.timestamp = block.timestamp
      tvl.createAtBlock = block.number
      tvl.totalSupply = fetchContractTotalSupply(vaultAddress)

      const decimal = pow(BD_TEN, vault.decimal.toI32())
      tvl.sharePrice = fetchPricePerFullShare(vaultAddress)
      tvl.sharePriceDivDecimal = BigDecimal.fromString(tvl.sharePrice.toString()).div(decimal)
      tvl.decimal = decimal

      const price = getPriceByVault(vault, block.number.toI32())
      tvl.priceUnderlying = price

      if (price.gt(BigDecimal.zero())) {
        tvl.value = tvl.totalSupply.toBigDecimal()
          .div(decimal)
          .times(price)
          .times(tvl.sharePriceDivDecimal)
      } else {
        tvl.value = BD_ZERO;
      }
      tvl.save()
    }
  }
}