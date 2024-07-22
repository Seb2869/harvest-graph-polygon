import { PotPoolContract } from "../generated/templates/PotPoolListener/PotPoolContract";
import { saveReward } from "./types/Reward";
import { log } from "@graphprotocol/graph-ts";
import { saveApyReward } from "./types/Apy";
import { RewardAdded } from '../generated/templates/VaultListener/PotPoolContract';

export function handleRewardAdded(event: RewardAdded): void {
  const poolAddress = event.address
  const rewardAmount = event.params.reward

  const poolContract = PotPoolContract.bind(poolAddress)
  const tryRewardToken = poolContract.try_rewardToken()
  const tryRewardRate = poolContract.try_rewardRate()
  const tryPeriodFinish = poolContract.try_periodFinish()

  if (tryPeriodFinish.reverted) {
    log.log(log.Level.WARNING, `Can not get periodFinish, handleRewardAdded on ${poolAddress}`)
  }

  if (tryRewardToken.reverted) {
    log.log(log.Level.WARNING, `Can not get rewardToken, handleRewardAdded on ${poolAddress}`)
  }

  if (tryRewardRate.reverted) {
    log.log(log.Level.WARNING, `Can not get rewardRate, handleRewardAdded on ${poolAddress}`)
  }

  saveReward(poolAddress, tryRewardToken.value, tryRewardRate.value, tryPeriodFinish.value, rewardAmount, event.transaction, event.block)
  saveApyReward(poolAddress, event.transaction, event.block)
}
