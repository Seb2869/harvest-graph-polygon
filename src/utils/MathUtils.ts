import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

export function pow(value: BigDecimal, scale: number): BigDecimal {
  let tempValue = value
  for (let i=0;i<scale-1;i++) {
    if (!canPowNext(tempValue.toString())) {
      log.log(log.Level.WARNING, `Can not pow BD ${tempValue}, length is ${tempValue.toString().length}`)
      return BigDecimal.zero()
    }
    tempValue = tempValue.times(value)
  }
  return tempValue
}

export function powBI(value: BigInt, scale: number): BigInt {
  let tempValue = value
  for (let i=0;i<scale-1;i++) {
    tempValue = tempValue.times(value)
  }
  return tempValue
}

// big decimal exponent is `-6143` to `6144` range
function canPowNext(value: string): boolean {
  return value.length < 5558
}