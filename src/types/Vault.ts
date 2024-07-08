import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { fetchContractDecimal, fetchContractName, fetchContractSymbol } from "../utils/ERC20Utils";
import { loadOrCreateERC20Token } from "./Token";
import { VaultListener } from "../../generated/templates";
import { loadOrCreateStrategy } from "./Strategy";
import { fetchUnderlyingAddress } from "../utils/VaultUtils";
import { Vault, VaultUtil } from '../../generated/schema';
import { pushVault } from './TotalTvlUtils';
import { BI_18 } from '../utils/Constant';

export function loadOrCreateVault(vaultAddress: Address, block: ethereum.Block, strategyAddress: string = 'unknown'): Vault {
  let vault = Vault.load(vaultAddress.toHex())
  if (vault == null) {
    vault = new Vault(vaultAddress.toHex());
    vault.name = fetchContractName(vaultAddress)
    vault.decimal = fetchContractDecimal(vaultAddress)
    vault.symbol = fetchContractSymbol(vaultAddress)
    const underlying = fetchUnderlyingAddress(vaultAddress)
    vault.createAtBlock = block.number;
    if (strategyAddress != 'unknown' && strategyAddress != null) {
      loadOrCreateStrategy(strategyAddress, block)
    }
    vault.strategy = strategyAddress
    vault.active = true;
    vault.timestamp = block.timestamp;
    vault.underlying = loadOrCreateERC20Token(underlying).id
    vault.lastShareTimestamp = BigInt.zero()
    vault.lastSharePrice = BI_18
    vault.skipFirstApyReward = true
    vault.tvl = BigDecimal.zero()
    vault.tvlSequenceId = 1;
    vault.priceFeedSequenceId = 1;
    vault.priceUnderlying = BigDecimal.zero()
    vault.apyReward = BigDecimal.zero();
    vault.apy = BigDecimal.zero();
    vault.apyAutoCompound = BigDecimal.zero();
    vault.users = [];
    vault.lastUsersShareTimestamp = BigInt.zero();
    vault.save();
    VaultListener.create(vaultAddress)
    pushVault(vault.id, block)
    const vaultUtils= getVaultUtils();
    const vaults = vaultUtils.vaults
    vaults.push(vault.id)
    vaultUtils.vaults = vaults;
    vaultUtils.vaultLength = vaults.length
    vaultUtils.save();
  }

  return vault;
}

export function getVaultUtils(): VaultUtil {
  const id = '1';
  let vaultUtils = VaultUtil.load(id)
  if (!vaultUtils) {
    vaultUtils = new VaultUtil(id);
    vaultUtils.vaults = [];
    vaultUtils.vaultLength = 0;
    vaultUtils.lastBlockPrice = BigInt.zero();
    vaultUtils.save()
  }
  return vaultUtils;
}