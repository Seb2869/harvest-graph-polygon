import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { UserBalance, UserBalanceHistory, UserTransaction, Vault } from "../../generated/schema";
import { VaultContract } from "../../generated/templates/VaultListener/VaultContract";
import { ERC20 } from "../../generated/Controller/ERC20";
import { pow } from "../utils/MathUtils";
import { BD_TEN } from "../utils/Constant";

export function createUserBalance(vaultAddress: Address, amount: BigInt, beneficary: Address, tx: ethereum.Transaction, block: ethereum.Block, isDeposit: boolean): void {
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const vaultContract = VaultContract.bind(vaultAddress)
    const sharePrice = vaultContract.getPricePerFullShare().divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    let poolBalance = BigDecimal.zero()
    if (vault.pool != null) {
      const poolContract = ERC20.bind(Address.fromString(vault.pool!))
      poolBalance = poolContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32())).times(sharePrice)
    }
    const vaultBalance = vaultContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32())).times(sharePrice)
    const value = vaultBalance.plus(poolBalance)

    const userBalanceId = `${vault.id}-${beneficary.toHex()}`
    let userBalance = UserBalance.load(userBalanceId)
    if (userBalance == null) {
      userBalance = new UserBalance(userBalanceId)
      userBalance.createAtBlock = block.number
      userBalance.timestamp = block.timestamp
      userBalance.vault = vault.id
      userBalance.value = BigDecimal.zero()
      userBalance.userAddress = beneficary.toHex()
    }

    userBalance.value = value

    userBalance.save()
    const userBalanceHistory = new UserBalanceHistory(`${tx.hash.toHex()}-${beneficary.toHex()}`)
    userBalanceHistory.createAtBlock = block.number
    userBalanceHistory.timestamp = block.timestamp
    userBalanceHistory.userAddress = beneficary.toHex()
    userBalanceHistory.vault = vault.id
    userBalanceHistory.transactionType = isDeposit
      ? 'Deposit'
      : 'Withdraw'
    userBalanceHistory.value = userBalance.value

    userBalanceHistory.sharePrice = vaultContract.getPricePerFullShare()
    userBalanceHistory.save()

    const userTransaction = new UserTransaction(tx.hash.toHex())
    userTransaction.createAtBlock = block.number
    userTransaction.timestamp = block.timestamp
    userTransaction.userAddress = beneficary.toHex()
    userTransaction.vault = vault.id
    userTransaction.transactionType = isDeposit
      ? 'Deposit'
      : 'Withdraw'
    userTransaction.sharePrice = vaultContract.getPricePerFullShare()
    userTransaction.value = amount
    userTransaction.save()
  }
}