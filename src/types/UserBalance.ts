import { Address, BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  UserBalance,
  UserBalanceHistory, UserProfit,
  UserProfitHistory,
  UserTotalProfit,
  UserTransaction,
  Vault,
} from '../../generated/schema';
import { VaultContract } from "../../generated/templates/VaultListener/VaultContract";
import { pow } from '../utils/MathUtils';
import { BD_TEN } from '../utils/Constant';
import { ERC20 } from '../../generated/Controller1/ERC20';

export function createUserBalance(vaultAddress: Address, amount: BigInt, beneficary: Address, tx: ethereum.Transaction, block: ethereum.Block, isDeposit: boolean): void {
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const vaultContract = VaultContract.bind(vaultAddress)
    let poolBalance = BigDecimal.zero()
    if (vault.pool != null) {
      const poolContract = ERC20.bind(Address.fromString(vault.pool!))
      poolBalance = poolContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    }
    const vaultBalance = vaultContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    const value = vaultBalance.plus(poolBalance)

    const userBalanceId = Bytes.fromUTF8(`${vault.id}-${beneficary.toHex()}`);
    let userBalance = UserBalance.load(userBalanceId)
    if (userBalance == null) {
      userBalance = new UserBalance(userBalanceId)
      userBalance.createAtBlock = block.number
      userBalance.timestamp = block.timestamp
      userBalance.vault = vault.id
      userBalance.value = BigDecimal.zero()
      userBalance.userAddress = beneficary.toHex()
      userBalance.underlyingBalance = BigDecimal.zero()
    }

    const delimiter = pow(BD_TEN, vault.decimal.toI32());
    const sharePriceFormatted = vault.lastSharePrice.divDecimal(delimiter);
    if (isDeposit) {
      userBalance.underlyingBalance = userBalance.underlyingBalance.plus(amount.divDecimal(delimiter).times(sharePriceFormatted))
    } else {
      userBalance.underlyingBalance = userBalance.underlyingBalance.minus(amount.divDecimal(delimiter).times(sharePriceFormatted))
    }

    let profit = BigDecimal.zero();
    if (userBalance.underlyingBalance.lt(BigDecimal.zero())) {
      profit = userBalance.underlyingBalance.neg().times(vault.priceUnderlying)
      userBalance.underlyingBalance = BigDecimal.zero()
    }

    userBalance.poolBalance = poolBalance
    userBalance.vaultBalance = vaultBalance
    userBalance.value = value
    userBalance.underlyingBalance = BigDecimal.zero()

    userBalance.save()
    const historyId = Bytes.fromUTF8(`${tx.hash.toHex()}-${beneficary.toHex()}-${vault.id}-${isDeposit.toString()}`);
    const userBalanceHistory = new UserBalanceHistory(historyId)
    userBalanceHistory.createAtBlock = block.number
    userBalanceHistory.timestamp = block.timestamp
    userBalanceHistory.userAddress = beneficary.toHex()
    userBalanceHistory.vault = vault.id
    userBalanceHistory.transactionType = isDeposit
      ? 'Deposit'
      : 'Withdraw'
    userBalanceHistory.value = userBalance.value
    userBalanceHistory.poolBalance = poolBalance
    userBalanceHistory.vaultBalance = vaultBalance
    userBalanceHistory.priceUnderlying = vault.priceUnderlying
    userBalanceHistory.sharePrice = vaultContract.getPricePerFullShare()
    userBalanceHistory.underlyingBalance = userBalance.underlyingBalance
    userBalanceHistory.save()

    updateVaultUsers(vault, value, beneficary.toHex());

    const userTransaction = new UserTransaction(Bytes.fromUTF8(`${tx.hash.toHex()}-${vault.id}-${isDeposit.toString()}`));
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
    if (profit.gt(BigDecimal.zero())) {

      // calculate user profit
      let userProfit = UserProfit.load(userBalanceId);
      if (userProfit == null) {
        userProfit = new UserProfit(userBalanceId);
        userProfit.userAddress = beneficary.toHex();
        userProfit.vault = vault.id;
        userProfit.value = BigDecimal.zero();
      }
      userProfit.value = userProfit.value.plus(profit)
      userProfit.save();

      // calculate user profit history
      const userProfitHistory = new UserProfitHistory(historyId);
      userProfitHistory.userAddress = beneficary.toHex();
      userProfitHistory.transactionType = userBalanceHistory.transactionType
      userProfitHistory.vault = vault.id;
      userProfitHistory.value = userProfit.value;
      userProfitHistory.sharePrice = vault.lastSharePrice;
      userProfitHistory.transactionAmount = amount;
      userProfitHistory.createAtBlock = block.number
      userProfitHistory.timestamp = block.timestamp
      userProfitHistory.save();

      // total profit
      let userTotalProfit = UserTotalProfit.load(beneficary.toHex());
      if (userTotalProfit == null) {
        userTotalProfit = new UserTotalProfit(beneficary.toHex());
        userTotalProfit.value = BigDecimal.zero();
      }
      userTotalProfit.value = userTotalProfit.value.plus(profit)
      userTotalProfit.save();
    }

  }
}

function updateVaultUsers(vault: Vault, value: BigDecimal, userAddress: string): void {
  let users = vault.users;
  if (value.equals(BigDecimal.zero())) {
    let newUsers: string[] = [];
    for (let i = 0; i < users.length; i++) {
      if (users[i].toLowerCase() != userAddress.toLowerCase()) {
        newUsers.push(users[i])
      }
    }
    users = newUsers;
  } else {
    let hasUser = false;
    for (let i = 0; i < users.length; i++) {
      if (userAddress.toLowerCase() == users[i].toLowerCase()) {
        hasUser = true;
        break;
      }
    }

    if (!hasUser) {
      users.push(userAddress)
    }
  }
  vault.users = users;
  vault.save()
}