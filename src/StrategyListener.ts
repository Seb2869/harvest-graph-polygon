import { ProfitLogInReward } from '../generated/templates/StrategyListener/StrategyContract';
import { loadOrCreateLastHarvest } from './types/LastHarvest';

export function handleProfitLogInReward(event: ProfitLogInReward): void {
  loadOrCreateLastHarvest(event.address, event.block, event.transaction);
}