import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { OracleContract } from "../../generated/templates/VaultListener/OracleContract";
import {
  BALANCER_CONTRACT_NAME,
  BD_18,
  BD_ONE,
  BD_TEN, BD_ZERO,
  BI_18, BRZ,
  CURVE_CONTRACT_NAME,
  DEFAULT_DECIMAL,
  DEFAULT_PRICE,
  F_UNI_V3_CONTRACT_NAME, getFarmToken,
  getOracleAddress, isBrl, isPsAddress, isStableCoin,
  LP_UNI_PAIR_CONTRACT_NAME, MESH_SWAP_CONTRACT,
  NULL_ADDRESS, ORACLE_PRICE_TETU,
} from "./Constant";
import { Token, Vault } from "../../generated/schema";
import { UniswapV2PairContract } from "../../generated/ExclusiveRewardPoolListener/UniswapV2PairContract";
import { WeightedPool2TokensContract } from "../../generated/templates/VaultListener/WeightedPool2TokensContract";
import { BalancerVaultContract } from "../../generated/templates/VaultListener/BalancerVaultContract";
import { ERC20 } from "../../generated/Controller/ERC20";
import { CurveVaultContract } from "../../generated/templates/VaultListener/CurveVaultContract";
import { CurveMinterContract } from "../../generated/templates/VaultListener/CurveMinterContract";
import { fetchContractDecimal, fetchContractName } from "./ERC20Utils";
import { pow } from "./MathUtils";
import { MeshSwapContract } from "../../generated/Controller1/MeshSwapContract";
import {
  checkBalancer,
  isAmUsd,
  isBalancer,
  isCurve,
  isLpUniPair,
  isMeshSwap,
  isQuickSwapUniV3,
  isTetu
} from "./PlatformUtils";
import { fetchUnderlyingAddress } from "./VaultUtils";
import { QuickSwapVaultContract } from "../../generated/Controller1/QuickSwapVaultContract";
import { QuickSwapPoolContract } from "../../generated/Controller1/QuickSwapPoolContract";
import { TetuPriceCalculatorContract } from "../../generated/Controller1/TetuPriceCalculatorContract";


export function getPriceForCoin(reqAddress: Address, block: number): BigInt {
  if (isStableCoin(reqAddress.toHexString())) {
    return BI_18
  }
  let address = reqAddress
  if (isBrl(reqAddress.toHexString())) {
    address = BRZ;
  }
  const oracleAddress = getOracleAddress(block)
  if (oracleAddress != NULL_ADDRESS) {
    const oracle = OracleContract.bind(oracleAddress)
    let tryGetPrice = oracle.try_getPrice(address)
    if (tryGetPrice.reverted) {
      log.log(log.Level.WARNING, `Can not get price on block ${block} for address ${address.toHexString()}`)
      return DEFAULT_PRICE
    }
    return tryGetPrice.value;
  }
  return DEFAULT_PRICE
}

export function getPriceByVault(vault: Vault, block: number): BigDecimal {

  if (isPsAddress(vault.id)) {
    return getPriceForCoin(getFarmToken(), block).divDecimal(BD_18)
  }
  if (isAmUsd(Address.fromString(vault.id))) {
    return BD_ONE;
  }
  const underlyingAddress = vault.underlying

  let price = getPriceForCoin(Address.fromString(underlyingAddress), block)
  if (!price.isZero()) {
    return price.divDecimal(BD_18)
  }

  const underlying = Token.load(underlyingAddress)
  if (underlying != null) {
    if (isLpUniPair(underlying.name)) {
      const tempPrice = getPriceForCoin(Address.fromString(underlyingAddress), block)
      if (tempPrice.gt(DEFAULT_PRICE)) {
        return tempPrice.divDecimal(BD_18)
      }
      return getPriceLpUniPair(underlying.id, block)
    }

    if (isTetu(underlying.name)) {
      return getPriceForTetu(Address.fromString(underlying.id))
    }

    if (isBalancer(underlying.name)) {
      return getPriceForBalancer(underlying.id, block)
    }

    if (isCurve(underlying.name)) {
      const tempPrice = getPriceForCoin(Address.fromString(underlying.id), block)
      if (!tempPrice.isZero()) {
        return tempPrice.divDecimal(BD_18)
      }

      return getPriceForCurve(underlyingAddress, block)
    }

    if (isMeshSwap(underlying.name)) {
      return getPriceFotMeshSwap(underlyingAddress, block)
    }

    if (isQuickSwapUniV3(underlying.name, Address.fromString(underlying.id))) {
      return getPriceForQuickSwapUniV3(Address.fromString(underlying.id), block)
    }
  }

  return BigDecimal.zero()

}

export function getPriceForTetu(address: Address): BigDecimal {
  const price = TetuPriceCalculatorContract.bind(ORACLE_PRICE_TETU)
  let tryGetPrice = price.try_getPriceWithDefaultOutput(address)
  if (tryGetPrice.reverted) {
    log.log(log.Level.WARNING, `Can not get tetu price for address ${address.toHexString()}`)
    return BigDecimal.zero()
  }
  return tryGetPrice.value.divDecimal(BD_18)
}

export function getPriceForCurve(underlyingAddress: string, block: number): BigDecimal {
  const curveContract = CurveVaultContract.bind(Address.fromString(underlyingAddress))
  const tryMinter = curveContract.try_minter()

  let minter = CurveMinterContract.bind(Address.fromString(underlyingAddress))
  if (!tryMinter.reverted) {
    minter = CurveMinterContract.bind(tryMinter.value)
  }

  let index = 0
  let tryCoins = minter.try_coins(BigInt.fromI32(index))
  while (!tryCoins.reverted) {
    const coin = tryCoins.value
    if (coin.equals(Address.zero())) {
      index = index - 1
      break
    }
    index = index + 1
    tryCoins = minter.try_coins(BigInt.fromI32(index))
  }
  const tryDecimals = curveContract.try_decimals()
  let decimal = DEFAULT_DECIMAL
  if (!tryDecimals.reverted) {
    decimal = tryDecimals.value.toI32()
  } else {
    log.log(log.Level.WARNING, `Can not get decimals for ${underlyingAddress}`)
  }
  const size = index + 1
  if (size < 1) {
    return BigDecimal.zero()
  }

  let value = BigDecimal.zero()

  for (let i=0;i<size;i++) {
    const index = BigInt.fromI32(i)
    const tryCoins1 = minter.try_coins(index)
    if (tryCoins1.reverted) {
      break
    }
    const token = tryCoins1.value
    const tokenPrice = getPriceForCoin(token, block).divDecimal(BD_18)
    const balance = minter.balances(index)
    const tryDecimalsTemp = ERC20.bind(token).try_decimals()
    let decimalsTemp = DEFAULT_DECIMAL
    if (!tryDecimalsTemp.reverted) {
      decimalsTemp = tryDecimalsTemp.value
    } else {
      log.log(log.Level.WARNING, `Can not get decimals for ${token}`)
    }
    const tempBalance = balance.toBigDecimal().div(pow(BD_TEN, decimalsTemp))

    value = value.plus(tokenPrice.times(tempBalance))
  }
  return value.times(BD_18).div(curveContract.totalSupply().toBigDecimal())
}
// amount / (10 ^ 18 / 10 ^ decimal)
function normalizePrecision(amount: BigInt, decimal: BigInt): BigInt {
  return amount.div(BI_18.div(BigInt.fromI64(10 ** decimal.toI64())))
}

export function getPriceLpUniPair(underlyingAddress: string, block: number): BigDecimal {
  const uniswapV2Pair = UniswapV2PairContract.bind(Address.fromString(underlyingAddress))
  const tryGetReserves = uniswapV2Pair.try_getReserves()
  if (tryGetReserves.reverted) {
    log.log(log.Level.WARNING, `Can not get reserves for underlyingAddress = ${underlyingAddress}, try get price for coin`)

    return getPriceForCoin(Address.fromString(underlyingAddress), block).divDecimal(BD_18)
  }
  const reserves = tryGetReserves.value
  const totalSupply = uniswapV2Pair.totalSupply()
  const positionFraction = BD_ONE.div(totalSupply.toBigDecimal().div(BD_18))

  const token0 = uniswapV2Pair.token0()
  const token1 = uniswapV2Pair.token1()

  const firstCoin = reserves.get_reserve0().toBigDecimal().times(positionFraction)
    .div(pow(BD_TEN, fetchContractDecimal(token0).toI32()))
  const secondCoin = reserves.get_reserve1().toBigDecimal().times(positionFraction)
    .div(pow(BD_TEN, fetchContractDecimal(token1).toI32()))


  const token0Price = getPriceForCoin(token0, block)
  const token1Price = getPriceForCoin(token1, block)

  if (token0Price.isZero() || token1Price.isZero()) {
    return BigDecimal.zero()
  }

  return token0Price
    .divDecimal(BD_18)
    .times(firstCoin)
    .plus(
      token1Price
        .divDecimal(BD_18)
        .times(secondCoin)
    )
}

export function getPriceForBalancer(underlying: string, block: number, isTest: boolean = false): BigDecimal {
  if ('0x0000000000000000000000000000000000000000' == underlying) {
    return BigDecimal.zero();
  }
  const balancer = WeightedPool2TokensContract.bind(Address.fromString(underlying))
  const poolId = balancer.getPoolId()
  const totalSupply = balancer.totalSupply().divDecimal(BD_18)
  const vault = BalancerVaultContract.bind(balancer.getVault())
  const tokenInfo = vault.getPoolTokens(poolId)

  let price = BigDecimal.zero()
  for (let i=0;i<tokenInfo.getTokens().length;i++) {
    const tokenAddress = tokenInfo.getTokens()[i]
    const name = fetchContractName(tokenAddress)
    const tryDecimals = ERC20.bind(tokenInfo.getTokens()[i]).try_decimals()
    let decimal = DEFAULT_DECIMAL
    if (!tryDecimals.reverted) {
      decimal = tryDecimals.value
    }
    // const balance = normalizePrecision(tokenInfo.getBalances()[i], BigInt.fromI32(decimal)).toBigDecimal()
    const balance = tokenInfo.getBalances()[i].divDecimal(pow(BD_TEN, decimal))

    let tokenPrice = BD_ZERO;

    if (tokenAddress == Address.fromString(underlying)) {
      tokenPrice = BD_ONE;
    } else if (!isTest && checkBalancer(tokenAddress)) {
      tokenPrice = getPriceForBalancer(tokenAddress.toHexString(), block);
    } else if (isTetu(name)) {
      tokenPrice = getPriceByAddress(tokenAddress, block);
    } else {
      tokenPrice = getPriceForCoin(tokenAddress, block).divDecimal(BD_18)
    }

    price = price.plus(balance.times(tokenPrice))
  }

  if (price.le(BigDecimal.zero())) {
    return price
  }
  return price.div(totalSupply)
}


export function getPriceFotMeshSwap(underlyingAddress: string, block: number): BigDecimal {
  const meshSwap = MeshSwapContract.bind(Address.fromString(underlyingAddress))

  const tryReserve0 = meshSwap.try_reserve0()
  const tryReserve1 = meshSwap.try_reserve1()

  if (tryReserve0.reverted || tryReserve1.reverted) {
    log.log(log.Level.WARNING, `Can not get reserves for underlyingAddress = ${underlyingAddress}, try get price for coin`)

    return BigDecimal.zero()
  }

  const reserve0 = tryReserve0.value
  const reserve1 = tryReserve1.value
  const totalSupply = meshSwap.totalSupply()
  const token0 = meshSwap.token0()
  const token1 = meshSwap.token1()
  const positionFraction = BD_ONE.div(totalSupply.toBigDecimal().div(pow(BD_TEN, meshSwap.decimals())))

  const firstCoin = reserve0.toBigDecimal().times(positionFraction)
    .div(pow(BD_TEN, fetchContractDecimal(token0).toI32()))
  const secondCoin = reserve1.toBigDecimal().times(positionFraction)
    .div(pow(BD_TEN, fetchContractDecimal(token1).toI32()))


  const token0Price = getPriceForCoin(token0, block)
  const token1Price = getPriceForCoin(token1, block)

  if (token0Price.isZero() || token1Price.isZero()) {
    return BigDecimal.zero()
  }

  return token0Price
    .divDecimal(BD_18)
    .times(firstCoin)
    .plus(
      token1Price
        .divDecimal(BD_18)
        .times(secondCoin)
    )
}

export function getPriceByAddress(address: Address, block: number): BigDecimal {

  if (isPsAddress(address.toHexString())) {
    return getPriceForCoin(getFarmToken(), block).divDecimal(BD_18)
  }
  const underlyingAddress = fetchUnderlyingAddress(address).toHexString()

  let price = getPriceForCoin(Address.fromString(underlyingAddress), block)
  if (!price.isZero()) {
    return price.divDecimal(BD_18)
  }

  const underlying = Token.load(underlyingAddress)
  if (underlying != null) {
    if (isLpUniPair(underlying.name)) {
      const tempPrice = getPriceForCoin(Address.fromString(underlyingAddress), block)
      if (tempPrice.gt(DEFAULT_PRICE)) {
        return tempPrice.divDecimal(BD_18)
      }
      return getPriceLpUniPair(underlying.id, block)
    }

    if (isBalancer(underlying.name)) {
      return getPriceForBalancer(underlying.id, block)
    }

    if (isCurve(underlying.name)) {
      const tempPrice = getPriceForCoin(Address.fromString(underlying.id), block)
      if (!tempPrice.isZero()) {
        return tempPrice.divDecimal(BD_18)
      }

      return getPriceForCurve(underlyingAddress, block)
    }

    if (isMeshSwap(underlying.name)) {
      return getPriceFotMeshSwap(underlyingAddress, block)
    }
  }

  return BigDecimal.zero()
}

export function getPriceForQuickSwapUniV3(address: Address, block: number): BigDecimal {

  const vault = QuickSwapVaultContract.bind(address)
  const tryPool = vault.try_pool()
  if (tryPool == null) {
    return BigDecimal.zero()
  }
  const poolAddress = tryPool.value
  const pool = QuickSwapPoolContract.bind(poolAddress)

  const liquidity = pool.liquidity()
  const token0 = ERC20.bind(pool.token0())
  const token1 = ERC20.bind(pool.token1())
  const balanceToken0 = token0.balanceOf(poolAddress)
  const balanceToken1 = token1.balanceOf(poolAddress)
  const priceToken0 = getPriceForCoin(token0._address, block)
  const priceToken1 = getPriceForCoin(token1._address, block)
  if (priceToken0.isZero()
    || liquidity.isZero()
    || token0.decimals() == 0
    || token1.decimals() == 0
    || priceToken1.isZero()
    || balanceToken1.isZero()
    || balanceToken0.isZero()) {
    return BigDecimal.zero()
  }


  const balance = priceToken0.divDecimal(BD_18)
    .times(balanceToken0.divDecimal(pow(BD_TEN, token0.decimals())))
    .plus(
      priceToken1.divDecimal(BD_18)
        .times(balanceToken1.divDecimal(pow(BD_TEN, token1.decimals()))))


  const decimal0 = token0.decimals()
  const decimal1 = token1.decimals()

  let decimal = BD_18

  if (decimal0 > decimal1) {
    decimal = pow(BD_TEN, decimal0 - decimal1)
  } else if (decimal0 < decimal1) {
    decimal = pow(BD_TEN, decimal1 - decimal0)
  }

  const poolPrice = balance.div(liquidity.divDecimal(
    decimal
  ))

  const tryTS = vault.try_totalSupply()
  if (tryTS.reverted) {
    return BigDecimal.zero()
  }

  return tryTS.value.divDecimal(BD_18).times(poolPrice)
}

export function getPriceForTetuVault(address: Address): BigDecimal {
  const contract = TetuPriceCalculatorContract.bind(ORACLE_PRICE_TETU)
  const tryPrice = contract.try_getPriceWithDefaultOutput(address)
  return tryPrice.reverted ? BigDecimal.zero() : tryPrice.value.divDecimal(BD_18)
}