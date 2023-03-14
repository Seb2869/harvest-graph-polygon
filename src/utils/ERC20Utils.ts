import { ERC20 } from "../../generated/Controller/ERC20";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { UNKNOWN } from "./Constant";


export function fetchContractName(address: Address): string {
  const contract = ERC20.bind(address);
  let nameValue = UNKNOWN
  let nameResult = contract.try_name()
  if (!nameResult.reverted) {
    nameValue = nameResult.value
  }
  return nameValue
}

export function fetchContractDecimal(address: Address): BigInt {
  const contract = ERC20.bind(address);
  let decimalValue = 18
  let tryDecimals = contract.try_decimals()
  if (!tryDecimals.reverted) {
    decimalValue = tryDecimals.value
  }
  return BigInt.fromI32(decimalValue)
}

export function fetchContractSymbol(address: Address): string {
  const contract = ERC20.bind(address);
  let symbol = UNKNOWN
  let trySymbol = contract.try_symbol()
  if (!trySymbol.reverted) {
    symbol = trySymbol.value
  }
  return symbol
}

export function fetchContractTotalSupply(address: Address): BigInt {
  const contract = ERC20.bind(address);
  let totalSupply = BigInt.fromI32(0)
  let tryTotalSupply = contract.try_totalSupply()
  if (!tryTotalSupply.reverted) {
    totalSupply = tryTotalSupply.value
  }
  return totalSupply
}