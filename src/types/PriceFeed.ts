import { PriceFeed, Vault } from '../../generated/schema';
import { BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { pow } from '../utils/MathUtils';
import { BD_TEN } from '../utils/Constant';

export function createPriceFeed(vault: Vault, price: BigDecimal, block: ethereum.Block): PriceFeed {
  const id = Bytes.fromUTF8(`${vault.id}-${block.number.toString()}`);
  let priceFeed = PriceFeed.load(id);
  if (!priceFeed) {
    priceFeed = new PriceFeed(id);
    priceFeed.vault = vault.id
    priceFeed.price = price;
    priceFeed.sharePrice = BigDecimal.fromString('1');
    priceFeed.value = BigDecimal.zero();
    priceFeed.createAtBlock = block.number
    priceFeed.timestamp = block.timestamp

    if (vault.lastSharePrice.gt(BigInt.zero())) {
      const sharePrice = vault.lastSharePrice.divDecimal(pow(BD_TEN, vault.decimal.toI32()))
      priceFeed.sharePrice = sharePrice;
      priceFeed.value = price.times(sharePrice);
    }
    priceFeed.priceFeedSequenceId = vault.priceFeedSequenceId;
    vault.priceFeedSequenceId = vault.priceFeedSequenceId + 1;
    vault.save();
    priceFeed.save();
  }

  return priceFeed;
}