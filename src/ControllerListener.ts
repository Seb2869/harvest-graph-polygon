import { SharePrice, Strategy, Vault } from "../generated/schema";
import { loadOrCreateVault } from "./utils/Vault";
import { pow, powBI } from "./utils/Math";
import { BD_TEN, BI_TEN } from "./utils/Constant";
import { calculateAndSaveApyAutoCompound } from "./utils/Apy";
import { SharePriceChangeLog } from "../generated/Controller/ControllerContract";
import { Address } from "@graphprotocol/graph-ts";
import { VaultContract } from "../generated/Controller/VaultContract";


export function handleSharePriceChangeLog(event: SharePriceChangeLog): void {
  const vaultAddress = event.params.vault.toHex();
  const strategyAddress = event.params.strategy.toHex();
  const block = event.block.number;
  const timestamp = event.block.timestamp;
  const sharePrice = new SharePrice(`${event.transaction.hash.toHex()}-${vaultAddress}`)
  let vault = Vault.load(vaultAddress)
  if (vault == null) {
    vault = loadOrCreateVault(Address.fromString(vaultAddress), event.block, strategyAddress)
  }
  sharePrice.vault = vaultAddress;
  sharePrice.strategy = strategyAddress;
  sharePrice.oldSharePrice = event.params.oldSharePrice;
  sharePrice.newSharePrice = event.params.newSharePrice;
  sharePrice.createAtBlock = block;
  sharePrice.timestamp = timestamp;
  sharePrice.save();

  if (vault != null && sharePrice.oldSharePrice != sharePrice.newSharePrice) {
    const lastShareTimestamp = vault.lastShareTimestamp
    if (!lastShareTimestamp.isZero()) {
      const diffSharePrice = sharePrice.newSharePrice.minus(sharePrice.oldSharePrice).divDecimal(pow(BD_TEN, vault.decimal.toI32()))
      const diffTimestamp = timestamp.minus(lastShareTimestamp)
      calculateAndSaveApyAutoCompound(`${event.transaction.hash.toHex()}-${vaultAddress}`, diffSharePrice, diffTimestamp, vaultAddress, event.block)
    }
    vault.lastShareTimestamp = sharePrice.timestamp
    vault.lastSharePrice = sharePrice.newSharePrice
    vault.save()

  }
}