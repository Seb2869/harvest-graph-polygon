import {
  AM_USD_BALANCER,
  BALANCER_CONTRACT_NAME, BB_AM_USD_BALANCER,
  CURVE_CONTRACT_NAME,
  F_UNI_V3_CONTRACT_NAME,
  LP_UNI_PAIR_CONTRACT_NAME, MESH_SWAP_CONTRACT, QUICK_SWAP_CONTRACT, TETU_CONTRACT, WETH_LIST,
} from './Constant';
import { Address } from "@graphprotocol/graph-ts";
import { WeightedPool2TokensContract } from "../../generated/Controller/WeightedPool2TokensContract";
import { QuickSwapVaultContract } from "../../generated/Controller1/QuickSwapVaultContract";

export function isLpUniPair(name: string): boolean {
  for (let i=0;i<LP_UNI_PAIR_CONTRACT_NAME.length;i++) {
    if (name.toLowerCase().startsWith(LP_UNI_PAIR_CONTRACT_NAME[i])) {
      return true
    }
  }
  return false
}

export function isBalancer(name: string): boolean {
  for (let i=0;i<BALANCER_CONTRACT_NAME.length;i++) {
    if (name.toLowerCase().startsWith(BALANCER_CONTRACT_NAME[i])) {
      return true
    }
  }
  return false
}

export function isCurve(name: string): boolean {
  if (name.toLowerCase().startsWith(CURVE_CONTRACT_NAME)) {
    return true
  }

  return false
}

export function isUniswapV3(name: string): boolean {
  if (name.toLowerCase().startsWith(F_UNI_V3_CONTRACT_NAME)) {
    return true
  }
  return false
}

export function isMeshSwap(name: string): boolean {
  if (name.toLowerCase().startsWith(MESH_SWAP_CONTRACT)) {
    return true
  }
  return false
}

export function isTetu(name: string): boolean {
  if (name.toLowerCase().startsWith(TETU_CONTRACT)) {
    return true;
  }
  return false;
}

export function isQuickSwapUniV3(name: string, address: Address): boolean {
  if (!name.toLowerCase().startsWith(QUICK_SWAP_CONTRACT)) {
    return false;
  }
  const contract = QuickSwapVaultContract.bind(address)
  return !contract.try_pool().reverted
}

export function checkBalancer(address: Address): boolean {
  const contract = WeightedPool2TokensContract.bind(address);
  return !contract.try_getPoolId().reverted
}

export function isAmUsd(address: Address): boolean {
  return address == AM_USD_BALANCER || address == BB_AM_USD_BALANCER;
}

export function isWeth(address: Address): boolean {
  for (let i=0;i<WETH_LIST.length;i++) {
    if (address.equals(WETH_LIST[i])) {
      return true
    }
  }
  return false
}