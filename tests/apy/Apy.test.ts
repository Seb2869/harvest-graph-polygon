import {
  assert,
  describe,
  test
} from "matchstick-as/assembly/index"
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { calculateApr, calculateAprAutoCompound, calculateApy } from "../../src/utils/ApyUtils";
import { BD_18 } from "../../src/utils/Constant";


describe("Apy tests", () => {
  test("Calculate apr and apy for FARM_DAI", () => {
    const tvlUsd = BigDecimal.fromString('3300000')
    const period = BigDecimal.fromString('257579')
    const rewardUsdForPeriod = BigDecimal.fromString('13.241361268')

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('0.04916003790905653305305450860795048')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('0.0491720903141718389099913495953')))
  })

  test("Calculate apr and apy for FARM_USDC with new data", () => {
    const tvlUsd = BigDecimal.fromString('5650000')
    // 1667934107 - 1667676528
    const period = BigDecimal.fromString('257579')
    // FARM token price in usd
    const rewardTokenPrice = BigDecimal.fromString('40')
    const rewardRate = BigDecimal.fromString('249362268518')
    const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)

    assert.assertTrue(apr.equals(BigDecimal.fromString('0.005571167946891070300884955752212391')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('0.0055713227141340043795132327171')))
  })

  test("Calculate apy with apr", () => {
    const apr = BigDecimal.fromString('74.3')
    const apy = calculateApy(apr)
      log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apy.equals(BigDecimal.fromString('110.0645741036129302244669591304885')))
  })

  test('Calculate autocompound apr', ()=> {
    const diffSharePrice = BigDecimal.fromString('1014987267072829321')
      .minus(BigDecimal.fromString('1014291243088230033'))
      .div(BD_18)

    const diffTimestamp = BigDecimal.fromString('1667147027').minus(BigDecimal.fromString('1665742271'))
    const apr = calculateAprAutoCompound(diffSharePrice, diffTimestamp)
    log.log(log.Level.INFO, `apr = ${apr}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('1.56360581456071310525101868224802')))
  })

  test('Calculate autocompound apr for weth', ()=> {
    const diffSharePrice = BigDecimal.fromString('0.00069602398')

    const diffTimestamp = BigDecimal.fromString('1404756')
    const apr = calculateAprAutoCompound(diffSharePrice, diffTimestamp)
    log.log(log.Level.INFO, `apr = ${apr}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('1.563605804228492350272929960790344')))
  })

  test('Calculate apy reward GNOME for vault GENE-ETH', ()=> {
    const tvlUsd = BigDecimal.fromString('160000')
    const period = BigDecimal.fromString('592512')
    const rewardRate = BigDecimal.fromString('12685407605284269')
    const rewardTokenPrice = BigDecimal.fromString('0.25')
    const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)
    // const rewardUsdForPeriod = BigDecimal.fromString('92')

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('62.550159225706069905375')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('86.81828899053470278203617920621')))
  })

  test('Calculate apy reward WMATIC for vault GENE-ETH', ()=> {
    const tvlUsd = BigDecimal.fromString('160000')
    const period = BigDecimal.fromString('432707')
    const rewardRate = BigDecimal.fromString('49233807931795')
    const rewardTokenPrice = BigDecimal.fromString('1.25')
    const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)
    // const rewardUsdForPeriod = BigDecimal.fromString('92')

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('1.213828763428448353125')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('1.2212051333044398579198860661639')))
  })

  test('Calculate apy reward miFARM for vault GENE-ETH', ()=> {
    const tvlUsd = BigDecimal.fromString('160000')
    const period = BigDecimal.fromString('432707')
    const rewardRate = BigDecimal.fromString('132827197920')
    const rewardTokenPrice = BigDecimal.fromString('51')
    const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)
    // const rewardUsdForPeriod = BigDecimal.fromString('92')

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('0.13361067914693112')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('0.1336997331095886456384913242857')))
  })

  test('Calculate apy reward miFARM for vault GNOME-ETH', ()=> {
    const tvlUsd = BigDecimal.fromString('111000')
    const period = BigDecimal.fromString('299250')
    const rewardRate = BigDecimal.fromString('2928161827841990705')
    const rewardTokenPrice = BigDecimal.fromString('0.005')
    const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)
    // const rewardUsdForPeriod = BigDecimal.fromString('92')

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('416.2421608031820084329189189189191')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('6173.16816144901170954833370558117')))
  })
})