import { TotalTvlCount, TotalTvlHistoryV2, TotalTvlUtil } from '../../generated/schema';
import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { BI_EVERY_7_DAYS, canCalculateTotalTvl, CONST_ID } from '../utils/Constant';
import { loadOrCreateVault } from './Vault';

export function pushVault(address: string, block: ethereum.Block): void {
  const vaultUtils = getTvlUtils(block);
  if (!canCalculateTotalTvl(address)) {
    return;
  }

  let array = vaultUtils.vaults
  array.push(address)
  vaultUtils.vaults = array
  vaultUtils.save()
}

export function checkAndCreateTotalTvlHistory(block: ethereum.Block): void {
  const tvlUtil = getTvlUtils(block);

  if (tvlUtil.lastTimestampUpdate.plus(BI_EVERY_7_DAYS) > block.timestamp || tvlUtil.lastTimestampUpdate.isZero()) {
    createTotalTvl(block);
  }
}

export function getTvlUtils(block: ethereum.Block): TotalTvlUtil {
  let vaultUtils = TotalTvlUtil.load(CONST_ID);
  if (vaultUtils == null) {
    vaultUtils = new TotalTvlUtil(CONST_ID)
    vaultUtils.vaults = [];
    vaultUtils.lastTimestampUpdate = block.timestamp
    vaultUtils.timestamp = block.timestamp
    vaultUtils.createAtBlock = block.number
    vaultUtils.lastBlockUpdate = block.number;
    vaultUtils.save()
  }

  return vaultUtils;
}

export function createTotalTvl(block: ethereum.Block): void {
  const tvlUtils = getTvlUtils(block)
  let totalTvl = BigDecimal.zero()
  const array = tvlUtils.vaults
  for (let i = 0; i < array.length; i++) {
    const vault = Address.fromString(array[i]);
    if (canCalculateTotalTvl(vault.toHexString())) {
      const tvl = loadOrCreateVault(vault, block).tvl
      totalTvl = totalTvl.plus(tvl)
    }
  }
  createTvlV2(totalTvl, block);
  tvlUtils.lastTimestampUpdate = block.timestamp
  tvlUtils.lastBlockUpdate = block.number
  tvlUtils.save()
}

export function totalTvlUp(): BigInt {
  let totalCount = TotalTvlCount.load('1')
  if (!totalCount) {
    totalCount = new TotalTvlCount('1');
    totalCount.length = BigInt.zero();
  }

  totalCount.length = totalCount.length.plus(BigInt.fromString('1'));
  totalCount.save();
  return totalCount.length;
}

export function createTvlV2(totalTvl: BigDecimal, block: ethereum.Block): void {
  let totalTvlHistory = TotalTvlHistoryV2.load(block.number.toString())
  if (totalTvlHistory == null) {
    totalTvlHistory = new TotalTvlHistoryV2(block.number.toString())

    totalTvlHistory.sequenceId = totalTvlUp();
    totalTvlHistory.value = totalTvl
    totalTvlHistory.timestamp = block.timestamp
    totalTvlHistory.createAtBlock = block.number
    totalTvlHistory.save()
  }
}