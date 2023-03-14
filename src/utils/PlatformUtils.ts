import {
  BALANCER_CONTRACT_NAME,
  CURVE_CONTRACT_NAME,
  F_UNI_V3_CONTRACT_NAME,
  LP_UNI_PAIR_CONTRACT_NAME, MESH_SWAP_CONTRACT
} from "./Constant";

export function isLpUniPair(name: string): boolean {
  for (let i=0;i<LP_UNI_PAIR_CONTRACT_NAME.length;i++) {
    if (name.toLowerCase().startsWith(LP_UNI_PAIR_CONTRACT_NAME[i])) {
      return true
    }
  }
  return false
}

export function isBalancer(name: string): boolean {
  if (name.toLowerCase().startsWith(BALANCER_CONTRACT_NAME)) {
    return true
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