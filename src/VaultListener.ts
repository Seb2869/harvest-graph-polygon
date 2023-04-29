import { PotPoolListener } from "../generated/templates";
import { createUserBalance } from "./types/UserBalance";
import { isPool } from "./utils/PotPoolUtils";
import { loadOrCreatePotPool } from "./types/PotPool";
import { createTvl } from "./types/Tvl";
import { Invest, Approval, Transfer } from "../generated/Controller/VaultContract";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to
  if (isPool(to)) {
    loadOrCreatePotPool(to, event.block)
    PotPoolListener.create(to)
  }
  createTvl(event.address, event.block)
  createUserBalance(event.address, event.params.value, event.params.from, event.transaction, event.block, false)
  createUserBalance(event.address, event.params.value, event.params.to, event.transaction, event.block, true)
}

export function handleInvest(event: Invest): void {
  createTvl(event.address, event.block)
}

export function handleApproval(event: Approval): void {
  createTvl(event.address, event.block)
}