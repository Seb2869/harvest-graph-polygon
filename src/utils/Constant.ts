import { Address, BigDecimal, BigInt, dataSource } from "@graphprotocol/graph-ts";
import { pow } from "./MathUtils";

export const UNKNOWN = 'unknown';

export const UNISWAP_V3_VALUE = pow(pow(BigDecimal.fromString('2'), 96), 2)
export const SECONDS_OF_YEAR = BigDecimal.fromString('31557600');
export const DEFAULT_DECIMAL = 18;
export const DEFAULT_PRICE = BigInt.fromI32(0);
export const YEAR_PERIOD = BigDecimal.fromString('365')
export const BI_TEN = BigInt.fromI64(10)
export const BI_18 = BigInt.fromI64(10 ** 18)
export const BD_18 = BigDecimal.fromString('1000000000000000000')
export const BD_ZERO = BigDecimal.fromString('0')
export const BD_ONE = BigDecimal.fromString('1')
export const BD_TEN = BigDecimal.fromString('10')
export const BD_ONE_HUNDRED = BigDecimal.fromString('100')
export const EVERY_24_HOURS = 86400;
export const BI_EVERY_24_HOURS = BigInt.fromString('86400');
export const EVERY_7_DAYS = 604800;
export const BI_EVERY_7_DAYS = BigInt.fromString('604800');
export const MODULE_RESULT = 75600;
export const MODULE_RESULT_V2 = 518400;
export const CONST_ID = '1';

export const STABLE_COIN_ARRAY_MAINNET = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLowerCase(),
  '0xe9e7cea3dedca5984780bafc599bd69add087d56'.toLowerCase(),
  '0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(),
  '0x0000000000085d4780B73119b644AE5ecd22b376'.toLowerCase(),
  '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase(),

  // Orbit Bridge Polygon Tether USD (oUSDT)
  '0x957da9ebbcdc97dc4a8c274dd762ec2ab665e15f'.toLowerCase()
]

export const STABLE_COIN_ARRAY_MATIC = [
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'.toLowerCase(),
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'.toLowerCase(),
  '0xE840B73E5287865EEc17d250bFb1536704B43B21'.toLowerCase(),
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'.toLowerCase(),
  // Euro Tether (PoS) (EURT)
  '0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f'.toLowerCase(),
  // Jarvis Synthetic Canadian Dollar (jCAD)
  '0x8ca194A3b22077359b5732DE53373D4afC11DeE3'.toLowerCase(),
  // Jarvis Synthetic Singapore Dollar (jSGD)
  '0xa926db7a4CC0cb1736D5ac60495ca8Eb7214B503'.toLowerCase(),
  // Monerium EUR emoney (EURe)
  '0x18ec0A6E18E5bc3784fDd3a3634b31245ab704F6'.toLowerCase(),
  // Orbit Bridge Polygon Tether USD (oUSDT)
  '0x957da9ebbcdc97dc4a8c274dd762ec2ab665e15f'.toLowerCase(),
  // Orbit Bridge Polygon USD Coin (oUSDC)
  '0x5bef2617ecca9a39924c09017c5f1e25efbb3ba8'.toLowerCase(),
  // Orbit Bridge Polygon ZEMIT (oZEMIT)
  '0xa34e0eacb7fbb0b0d45da89b083e0f87fcdf6157'.toLowerCase(),
  // Orbit Bridge Polygon MOOI (oMOOI)
  '0x746351ab4b9d4f802b7b770f33184d0a6b17363d'.toLowerCase()
]

export const PS_ADDRESSES_MAINNET = [
  '0xd3093e3efbe00f010e8f5efe3f1cb5d9b7fe0eb1'.toLowerCase(),
  '0x8f5adC58b32D4e5Ca02EAC0E293D35855999436C'.toLowerCase(),
  '0xa0246c9032bc3a600820415ae600c6388619a14d'.toLowerCase(),
  '0x25550Cccbd68533Fa04bFD3e3AC4D09f9e00Fc50'.toLowerCase(),
  '0x59258F4e15A5fC74A7284055A8094F58108dbD4f'.toLowerCase(),
]

export const PS_ADDRESSES_MATIC = [
  '0xab0b2ddb9c7e440fac8e140a89c0dbcbf2d7bbff'.toLowerCase(),
]

export const LP_UNI_PAIR_CONTRACT_NAME = [
  '1inch'.toLowerCase(),
  'SushiSwap'.toLowerCase(),
  // only uniswap v2
  'Uniswap'.toLowerCase(),
  'Pancake'.toLowerCase(),
  'Kyber'.toLowerCase(),
  'ApeSwapFinance'.toLowerCase(),
]

export const BALANCER_CONTRACT_NAME = [
  'Balancer'.toLowerCase(),
  'frxETH-WETH'.toLowerCase(),
  '20WMATIC-80SPHERE'.toLowerCase(),
  '20WETH-80BAL'.toLowerCase(),
  '20USDC-80TNGBL'.toLowerCase(),
  '2eur (PAR)'.toLowerCase()
]
export const CURVE_CONTRACT_NAME = 'Curve.fi'.toLowerCase()
export const F_UNI_V3_CONTRACT_NAME = 'fUniV3'.toLowerCase()
export const MESH_SWAP_CONTRACT = 'Meshswap'.toLowerCase()
export const TETU_CONTRACT = 'Tetu'.toLowerCase()
export const QUICK_SWAP_CONTRACT = 'a'.toLowerCase()

export const UNISWAP_V3_FEES = [
  '3000',
  '5000',
  '8000',
  '10000'
]

export const AM_USD_BALANCER = Address.fromString('0xb9ae7a44f9060a80bf436d48c4d7ad42d15715ee')
export const BB_AM_USD_BALANCER = Address.fromString('0x787dcb101a0fd5c54a993dcead38e2c6bb98b66e')

export const FARM_TOKEN_MAINNET = Address.fromString('0xa0246c9032bc3a600820415ae600c6388619a14d')
export const FARM_TOKEN_MATIC = Address.fromString('0xab0b2ddb9c7e440fac8e140a89c0dbcbf2d7bbff')

export const ORACLE_ADDRESS_MAINNET_FIRST = Address.fromString('0x48DC32eCA58106f06b41dE514F29780FFA59c279');
export const ORACLE_ADDRESS_MAINNET_SECOND = Address.fromString('0x1358c91D5b25D3eDAc2b7B26A619163d78f1717d');
export const ORACLE_ADDRESS_MATIC = Address.fromString('0x0E74303d0D18884Ce2CEb3670e72686645c4f38B');

export const ORACLE_PRICE_TETU = Address.fromString('0x0B62ad43837A69Ad60289EEea7C6e907e759F6E8')

export const NULL_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000');
export const BIG_APY_BD = BigDecimal.fromString('2000');

export const JBRL = '0xf2f77FE7b8e66571E0fca7104c4d670BF1C8d722'.toLowerCase();
export const BRZ = Address.fromString('0x491a4eB4f1FC3BfF8E1d2FC856a6A46663aD556f');


export function isStableCoin(address: string): boolean {
  if (dataSource.network() == 'mainnet') {
    return STABLE_COIN_ARRAY_MAINNET.join(' ').includes(address) == true
  } else if (dataSource.network() == 'matic') {
    return STABLE_COIN_ARRAY_MATIC.join(' ').includes(address) == true
  }
  return false
}

export function isBrl(address: string): boolean {
  return address == JBRL;
}

export function isPsAddress(address: string): boolean {
  if (dataSource.network() == 'mainnet') {
    return PS_ADDRESSES_MAINNET.join(' ').includes(address) == true
  } else if (dataSource.network() == 'matic') {
    return PS_ADDRESSES_MATIC.join(' ').includes(address) == true
  }
  return false
}

export function getOracleAddress(block: number): Address {
  if (dataSource.network() == 'mainnet') {
    if (block >= 12820106) {
      return ORACLE_ADDRESS_MAINNET_FIRST
    } else if (block >= 12015724) {
      return ORACLE_ADDRESS_MAINNET_SECOND
    }
  } else if (dataSource.network() == 'matic') {
    if (block >= 16841617) {
      return ORACLE_ADDRESS_MATIC
    }
  }

  return NULL_ADDRESS
}

export function getFarmToken(): Address {
  if (dataSource.network() == 'mainnet') {
    return FARM_TOKEN_MAINNET
  }
  if (dataSource.network() == 'matic') {
    return FARM_TOKEN_MATIC
  }
  return NULL_ADDRESS
}