import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Strategy } from "../../generated/schema";
import { StrategyListener } from '../../generated/templates';
import { StrategyContract } from '../../generated/templates/StrategyListener/StrategyContract';
import { loadOrCreateVault } from './Vault';

export function loadOrCreateStrategy(address: string, block: ethereum.Block): Strategy {
  let strategy = Strategy.load(address);
  if (strategy == null) {
    strategy = new Strategy(address);
    strategy.vault = loadOrCreateVault(getVaultAddress(Address.fromString(address)), block).id
    strategy.timestamp = block.timestamp;
    strategy.createAtBlock = block.number;
    strategy.save();
    StrategyListener.create(Address.fromString(address))
  }
  return strategy
}

export function getVaultAddress(address: Address): Address {
  return StrategyContract.bind(address).vault();
}
