import { Pool, Reward } from "../../generated/schema";
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { loadOrCreatePotPool } from './PotPool';

export function saveReward(
  poolAddress: Address,
  rewardToken: Address,
  rewardRate: BigInt,
  periodFinish: BigInt,
  rewardAmount: BigInt,
  tx: ethereum.Transaction,
  block: ethereum.Block
  ): void {
  const pool = loadOrCreatePotPool(poolAddress, block)
  let reward = new Reward(Bytes.fromUTF8(`${tx.hash.toHex()}-${pool.id}-${rewardToken.toHex()}`))
  reward.timestamp = block.timestamp
  reward.pool = poolAddress.toHex()
  reward.token = rewardToken.toHex()
  reward.rewardRate = rewardRate
  reward.periodFinish = periodFinish
  reward.reward = rewardAmount
  reward.tx = tx.hash.toHex();
  reward.save()
}