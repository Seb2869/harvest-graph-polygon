import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { fetchContractDecimal, fetchContractName, fetchContractSymbol } from "../utils/ERC20Utils";
import { loadOrCreateERC20Token } from "./Token";
import { VaultListener } from "../../generated/templates";
import { loadOrCreateStrategy } from "./Strategy";
import { fetchUnderlyingAddress } from "../utils/VaultUtils";
import { Vault } from "../../generated/schema";

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
    vault.lastSharePrice = BigInt.zero()
    vault.skipFirstApyReward = true
    vault.tvl = BigDecimal.zero()
    vault.save();
    VaultListener.create(vaultAddress)
  }

  return vault;
}