import { Pool, Reward } from "../../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export function saveReward(
  poolAddress: Address,
  rewardToken: Address,
  rewardRate: BigInt,
  periodFinish: BigInt,
  rewardAmount: BigInt,
  tx: ethereum.Transaction,
  block: ethereum.Block
  ): void {
  let pool = Pool.load(poolAddress.toHex())
  if (pool != null) {
    // create reward
    let reward = new Reward(`${tx.hash.toHex()}-${pool.id}-${rewardToken.toHex()}`)
    reward.timestamp = block.timestamp
    reward.pool = poolAddress.toHex()
    reward.token = rewardToken.toHex()
    reward.rewardRate = rewardRate
    reward.periodFinish = periodFinish
    reward.reward = rewardAmount
    reward.save()

  }
}