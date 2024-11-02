import { Address, BigDecimal, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Tvl, Vault } from '../../generated/schema';
import { fetchContractTotalSupply } from "../utils/ERC20Utils";
import { BD_TEN, BD_ZERO, MAX_TVL_VALUE, ST_ETH_ETH_VAULT } from '../utils/Constant';
import { pow } from "../utils/MathUtils";
import { fetchPricePerFullShare } from "../utils/VaultUtils";
import { getPriceByVault } from "../utils/PriceUtils";
import { checkAndCreateTotalTvlHistory, createTotalTvl, totalTvlUp } from './TotalTvlUtils';
import { loadOrCreateVault } from './Vault';

export function createTvl(address: Address, block: ethereum.Block): Tvl | null {
  const vaultAddress = address;
  const vault = loadOrCreateVault(vaultAddress, block)
  const id = Bytes.fromUTF8(`${block.number.toString()}-${vaultAddress.toHex()}`);
  let tvl = Tvl.load(id)
  if (tvl == null) {
    checkAndCreateTotalTvlHistory(block);
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
    vault.tvl = tvl.value
    vault.tvlSequenceId = vault.tvlSequenceId + 1;
    vault.priceUnderlying = price
    vault.save()
  }
  return tvl;
}