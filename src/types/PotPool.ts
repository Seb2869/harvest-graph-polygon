import { Address, ethereum } from "@graphprotocol/graph-ts";
import { Pool, Vault } from "../../generated/schema";
import { PotPoolContract } from "../../generated/PotNotifyHelperListener/PotPoolContract";
import { PotPoolListener } from "../../generated/templates";
import { loadOrCreateVault } from "./Vault";
import { loadOrCreateERC20Token } from "./Token";

const TYPE = 'PotPool'


export function loadOrCreatePotPool(poolAddress: Address, ethBlock: ethereum.Block): void {
  let pool = Pool.load(poolAddress.toHex())
  if (pool == null) {
    let poolContract = PotPoolContract.bind(poolAddress)
    let vaultAddress = poolContract.lpToken();
    let tryRewardToken = poolContract.try_rewardToken();
    if (tryRewardToken.reverted) {
      return;
    }
    let rewardToken = loadOrCreateERC20Token(tryRewardToken.value)
    let pool = new Pool(poolAddress.toHex())
    pool.timestamp = ethBlock.timestamp
    pool.createAtBlock = ethBlock.number
    pool.vault = vaultAddress.toHex()
    pool.type = TYPE
    pool.rewardTokens = [rewardToken.id]
    pool.save()

    let vault = Vault.load(vaultAddress.toHex())
    if (vault != null) {
      vault.pool = poolAddress.toHex()
      vault.save()
    } else {
      vault = loadOrCreateVault(vaultAddress, ethBlock)
      vault.pool = poolAddress.toHex()
      vault.save()
    }
    PotPoolListener.create(poolAddress);
  }
}