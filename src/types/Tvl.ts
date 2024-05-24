import { Address, BigDecimal, ethereum } from "@graphprotocol/graph-ts";
import { TotalTvl, TotalTvlHistory, TotalTvlHistoryV2, Tvl, Vault } from '../../generated/schema';
import { fetchContractTotalSupply } from "../utils/ERC20Utils";
import { BD_TEN, BD_ZERO, MAX_TVL_VALUE, ST_ETH_ETH_VAULT } from '../utils/Constant';
import { pow } from "../utils/MathUtils";
import { fetchPricePerFullShare } from "../utils/VaultUtils";
import { getPriceByVault } from "../utils/PriceUtils";
import { canCalculateTotalTvlV2, totalTvlUp } from './TotalTvlUtils';

export function createTvl(address: Address, block: ethereum.Block): Tvl | null {
  const vaultAddress = address;
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const id = `${block.number.toString()}-${vaultAddress.toHex()}`
    let tvl = Tvl.load(id)
    if (tvl == null) {
      canCalculateTotalTvlV2(block);
      tvl = new Tvl(id);

      tvl.vault = vault.id
      tvl.timestamp = block.timestamp
      tvl.createAtBlock = block.number
      tvl.totalSupply = fetchContractTotalSupply(vaultAddress)

      const decimal = pow(BD_TEN, vault.decimal.toI32())
      tvl.sharePrice = fetchPricePerFullShare(vaultAddress)
      tvl.sharePriceDivDecimal = BigDecimal.fromString(tvl.sharePrice.toString()).div(decimal)
      tvl.decimal = decimal

      const price = getPriceByVault(vault, block)
      tvl.priceUnderlying = price

      if (vault.id == ST_ETH_ETH_VAULT && price.gt(MAX_TVL_VALUE)) {
        return null;
      }

      if (price.gt(BigDecimal.zero())) {
        tvl.value = tvl.totalSupply.toBigDecimal()
          .div(decimal)
          .times(price)
          .times(tvl.sharePriceDivDecimal)
      } else {
        tvl.value = BD_ZERO;
      }
      tvl.tvlSequenceId = vault.tvlSequenceId;
      tvl.save()
      // createTotalTvl(vault.tvl, tvl.value, id, block)
      vault.tvl = tvl.value
      vault.tvlSequenceId = vault.tvlSequenceId + 1;
      vault.priceUnderlying = price
      vault.save()
    }
    return tvl;
  }
  return null;
}

export function createTvlV2(totalTvl: BigDecimal, block: ethereum.Block): void {
  let totalTvlHistory = TotalTvlHistoryV2.load(block.number.toString())
  if (totalTvlHistory == null) {
    totalTvlHistory = new TotalTvlHistoryV2(block.number.toString())

    totalTvlHistory.sequenceId = totalTvlUp();
    totalTvlHistory.value = totalTvl
    totalTvlHistory.timestamp = block.timestamp
    totalTvlHistory.createAtBlock = block.number
    totalTvlHistory.save()
  }
}