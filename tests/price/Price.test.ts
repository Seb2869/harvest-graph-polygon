import { describe, test, assert, createMockedFunction } from "matchstick-as/assembly/index";
import {
  getPriceForBalancer,
  getPriceForCurve, getPriceFotMeshSwap,
  getPriceLpUniPair,
} from "../../src/utils/PriceUtils";
import { Vault } from "../../generated/schema";
import { Address, BigDecimal, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import {
  BI_18,
  isPsAddress,
  ORACLE_ADDRESS_MAINNET_FIRST,
  ORACLE_ADDRESS_MAINNET_SECOND,
  ORACLE_ADDRESS_MATIC
} from "../../src/utils/Constant";
import { isLpUniPair, isMeshSwap, isUniswapV3 } from "../../src/utils/PlatformUtils";

describe('Get price for uniswapV3', () => {

  test('It is uniswapV3', () => {
    const result = isUniswapV3('fUniV3_USDC_WETH')
    assert.assertTrue(result)
  })

  test('It is PS address', () => {
    const result = isPsAddress('0x59258F4e15A5fC74A7284055A8094F58108dbD4f'.toLowerCase())
    assert.assertTrue(result)
  })

  test('It is lp', () => {
    const result = isLpUniPair('Uniswap V2')
    assert.assertTrue(result)
  })

  test('It is meshswap', () => {
    const result = isMeshSwap('Meshswap LP USDT-oUSDT')
    assert.assertTrue(result)
  })

  test('Get price for balancer polybase', () => {
    const undelyingAddress = '0x0297e37f1873D2DAb4487Aa67cD56B58E2F27875'
    const balancer = Address.fromString(undelyingAddress)

    const vaultAddress = '0x0297e37f1873D2DAb4487Aa67cD56B58E2F27876'
    const vault = Address.fromString(vaultAddress)

    const tokenAddress1 = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    const token1 = Address.fromString(tokenAddress1)

    const tokenAddress2 = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    const token2 = Address.fromString(tokenAddress2)

    const tokenAddress3 = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
    const token3 = Address.fromString(tokenAddress3)

    const tokenAddress4 = '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3'
    const token4 = Address.fromString(tokenAddress4)

    createMockedFunction(balancer, 'getPoolId', 'getPoolId():(bytes32)')
      .returns([ethereum.Value.fromFixedBytes(Bytes.fromHexString('0x0297e37f1873d2dab4487aa67cd56b58e2f27875000100000000000000000002'))])
    createMockedFunction(balancer, 'totalSupply', 'totalSupply():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('270238182103759292022844'))])
    createMockedFunction(balancer, 'getVault', 'getVault():(address)')
      .returns([ethereum.Value.fromAddress(vault)])

    createMockedFunction(vault, 'getPoolTokens', 'getPoolTokens(bytes32):(address[],uint256[],uint256)')
      .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString('0x0297e37f1873d2dab4487aa67cd56b58e2f27875000100000000000000000002'))])
      .returns([
        ethereum.Value.fromAddressArray(
          [token1, token2, token3, token4]
        ),
        ethereum.Value.fromUnsignedBigIntArray(
          [
            BigInt.fromString('818581286063562164127798'),
            BigInt.fromString('657575647370'),
            BigInt.fromString('586470343872098925109'),
            BigInt.fromString('125351513962837477294798'),

          ]
        ),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('35879943'))
      ])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token1)])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('797122480266327609'))])
    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token2)])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('1000000000000000000'))])
    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token3)])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('1115991959259826800576'))])
    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token4)])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('5189429213577041816'))])

    createMockedFunction(token1, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])
    createMockedFunction(token2, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('6'))])
    createMockedFunction(token3, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])
    createMockedFunction(token4, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])



    const result = getPriceForBalancer(undelyingAddress, 16841618)

    assert.assertTrue(result.equals(BigDecimal.fromString('7.243641614364690646397906383662353')))
  })

  test('Get price for ApeSwapFinance LPs (APE-LP)', () => {
    const apeSwapAddress = '0xe82635a105c520fd58e597181cbf754961d51e3e'
    const apeSwap = Address.fromString(apeSwapAddress)
    const token0 = Address.fromString('0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270')
    const token1 = Address.fromString('0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6')

    createMockedFunction(apeSwap, 'getReserves', 'getReserves():(uint112,uint112,uint32)')
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('330920374414761455109317')),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1658108638')),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1669105948'))
      ])
    createMockedFunction(apeSwap, 'totalSupply', 'totalSupply():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1907201390820661854363918'))])

    createMockedFunction(apeSwap, 'token0', 'token0():(address)')
      .returns([ethereum.Value.fromAddress(token0)])
    createMockedFunction(apeSwap, 'token1', 'token1():(address)')
      .returns([ethereum.Value.fromAddress(token1)])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token0)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('784614620812384196'))])
    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token1)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('15738278011805128514841'))])

    createMockedFunction(token0, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])
    createMockedFunction(token1, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('8'))])

    const result = getPriceLpUniPair(apeSwapAddress, 35918113)
    log.log(log.Level.INFO, `result = ${result}`)

    assert.assertTrue(result.equals(BigDecimal.fromString('0.2729668265671263470300672335522442')))
  })

  test('Get price for Curve contract, minter is underlying contract', () => {
    // Jarvis: 2EUR (EURT)
    const address = '0x2c3cc8e698890271c8141be9f6fd6243d56b39f1'
    const contractAddress = Address.fromString(address)

    createMockedFunction(contractAddress, 'minter', 'minter():(address)')
      .returns([ethereum.Value.fromAddress(contractAddress)])

    createMockedFunction(contractAddress, 'totalSupply', 'totalSupply():(uint256)')
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('735530875382881631516527'))])
    createMockedFunction(contractAddress, 'decimals', 'decimals():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18))])


    createMockedFunction(contractAddress, 'coins', 'coins(uint256):(address)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
      .returns([ethereum.Value.fromAddress(Address.fromString('0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f'))])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(Address.fromString('0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f'))])
      .returns([ethereum.Value.fromUnsignedBigInt(BI_18)])

    createMockedFunction(Address.fromString('0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f'), 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(6))])

    createMockedFunction(contractAddress, 'balances', 'balances(uint256):(uint256)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromI64(506499770404))])



    createMockedFunction(contractAddress, 'coins', 'coins(uint256):(address)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
      .returns([ethereum.Value.fromAddress(Address.fromString('0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c'))])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(Address.fromString('0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c'))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1025577454412447848'))])

    createMockedFunction(Address.fromString('0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c'), 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18))])

    createMockedFunction(contractAddress, 'balances', 'balances(uint256):(uint256)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('225046876931530431805451'))])



    createMockedFunction(contractAddress, 'coins', 'coins(uint256):(address)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))])
      .returns([ethereum.Value.fromAddress(Address.zero())])



    const block = 15996940
    const price = getPriceForCurve(address, block)
    log.log(log.Level.INFO, `price = ${price}`)
    assert.assertTrue(price.equals(BigDecimal.fromString('1.002409005858668294589345200712214')))
  })


  test('Get price for Meshswap LP USDT-oUSDT', () => {
    const block = 999999999
    const contract = Address.fromString('0x58a7aac84560f994d191e78aeb690855eb2d5b88')
    const token0 = Address.fromString('0xc2132d05d31c914a87c6611c10748aeb04b58e8f')
    const token1 = Address.fromString('0x957da9ebbcdc97dc4a8c274dd762ec2ab665e15f')

    createMockedFunction(contract, 'reserve0', 'reserve0():(uint112)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('351479844593'))])
    createMockedFunction(contract, 'reserve1', 'reserve1():(uint112)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('351468174108'))])

    createMockedFunction(contract, 'totalSupply', 'totalSupply():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('351474001299'))])
    createMockedFunction(contract, 'token0', 'token0():(address)')
      .returns([ethereum.Value.fromAddress(token0)])
    createMockedFunction(contract, 'token1', 'token1():(address)')
      .returns([ethereum.Value.fromAddress(token1)])

    createMockedFunction(contract, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('6'))])
    createMockedFunction(token0, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('6'))])
    createMockedFunction(token1, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('6'))])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token0)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('998184793388988896'))])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token1)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('17630538391283093'))])


    const price = getPriceFotMeshSwap(contract.toHex(), block)
    log.log(log.Level.INFO, `price = ${price}`)

    assert.assertTrue(price.equals(BigDecimal.fromString('1.998184809026601011847043949022374')))
  })

  test('Get price for balancer tetuBAL 80BAL-20WETH ', () => {
    const undelyingAddress = '0x0297e37f1873D2DAb4487Aa67cD56B58E2F27875'
    const balancer = Address.fromString(undelyingAddress)

    const vaultAddress = '0x0297e37f1873D2DAb4487Aa67cD56B58E2F27876'
    const vault = Address.fromString(vaultAddress)

    const tokenAddress1 = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    const token1 = Address.fromString(tokenAddress1)

    const tokenAddress2 = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    const token2 = Address.fromString(tokenAddress2)

    const tokenAddress3 = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
    const token3 = Address.fromString(tokenAddress3)

    const tokenAddress4 = '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3'
    const token4 = Address.fromString(tokenAddress4)

    createMockedFunction(balancer, 'getPoolId', 'getPoolId():(bytes32)')
      .returns([ethereum.Value.fromFixedBytes(Bytes.fromHexString('0x0297e37f1873d2dab4487aa67cd56b58e2f27875000100000000000000000002'))])
    createMockedFunction(balancer, 'totalSupply', 'totalSupply():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('270238182103759292022844'))])
    createMockedFunction(balancer, 'getVault', 'getVault():(address)')
      .returns([ethereum.Value.fromAddress(vault)])

    createMockedFunction(vault, 'getPoolTokens', 'getPoolTokens(bytes32):(address[],uint256[],uint256)')
      .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString('0x0297e37f1873d2dab4487aa67cd56b58e2f27875000100000000000000000002'))])
      .returns([
        ethereum.Value.fromAddressArray(
          [token1, token2, token3, token4]
        ),
        ethereum.Value.fromUnsignedBigIntArray(
          [
            BigInt.fromString('818581286063562164127798'),
            BigInt.fromString('657575647370'),
            BigInt.fromString('586470343872098925109'),
            BigInt.fromString('125351513962837477294798'),

          ]
        ),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('35879943'))
      ])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token1)])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('797122480266327609'))])
    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token2)])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('1000000000000000000'))])
    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token3)])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('1115991959259826800576'))])
    createMockedFunction(ORACLE_ADDRESS_MAINNET_FIRST, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(token4)])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('5189429213577041816'))])

    createMockedFunction(token1, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])
    createMockedFunction(token2, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('6'))])
    createMockedFunction(token3, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])
    createMockedFunction(token4, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])



    const result = getPriceForBalancer(undelyingAddress, 16841618)

    assert.assertTrue(result.equals(BigDecimal.fromString('7.243641614364690646397906383662353')))
  })
})