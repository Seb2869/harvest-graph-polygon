import { ethereum } from "@graphprotocol/graph-ts";
import { Strategy } from "../../generated/schema";

export function loadOrCreateStrategy(address: string, block: ethereum.Block): Strategy {
  let strategy = Strategy.load(address);
  if (strategy == null) {
    strategy = new Strategy(address);
    strategy.timestamp = block.timestamp;
    strategy.createAtBlock = block.number;
    strategy.save();
  }
  return strategy
}