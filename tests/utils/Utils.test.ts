import { describe, test, assert } from "matchstick-as/assembly/index";
import { isLpUniPair } from "../../src/utils/PriceUtils";

describe('Utils tests', () => {
  test('Check ApeSwapFinance', () => {
    const result = isLpUniPair('ApeSwapFinance LPs')
    assert.assertTrue(result)
  })
})