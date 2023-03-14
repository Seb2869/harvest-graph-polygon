# Harvest sub graph 


## Setup

- Install dependencies `yarn install` 
- Deploy on local machine `graph create --node http://localhost:8020/ harvest-graph`
- Run tests `graph test`


## Queries

For query use this urls:
- **Ethereum** - <https://api.thegraph.com/subgraphs/id/QmPRifvkxXjdVMtcFDCd72sLnGE9ZXhg2ep3gNawbSTeVC>
- **Polygon** - <https://api.thegraph.com/subgraphs/id/Qma7BgwPykQAY28pVsyH3s57gndPiVZKg9rpHA1q4FpDBG>
- **BSC** - TBD
- **Arbitrum** - TBD


### Get all vaults
    {
        vaults {
            id
            name
            pool {
                id
            }
            strategy {
                id
            }
            underlying {
                id
                name
                symbol
            }
            decimal
            createAtBlock
            timestamp
        }
    }

### Get last tvl by vault address
- Example for **FARM_USDC**: 0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe
- Please, use all addresses in **lowercase**

###
    {
        tvls(
            where: {vault: "0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe"}
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            value
            totalSupply
            sharePriceDivDecimal
            createAtBlock
        }
    }


- `value` - TVL in usd
- `sharePriceDivDecimal` - `sharePrice` / (10 ** `decimal`)

### Get last apy by vault address

    {
        apyRewards(
            first: 1,
            where: {vault: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c"}
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            apy
            createAtBlock
        }

        apyAutoCompounds(
            first: 1,
            where: {vault: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c"}
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            apy
            createAtBlock
        }
    }

### Get first 100 last apy by vault address, in timestamp from 11/09/2022 @ 1:15pm to 11/09/2022 @ 1:15pm


    {
        apyRewards(
            first: 100,
            where: {
                timestamp_gte: "1648059270",
                timestamp_lte: "1667999735",
                vault: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c"
            }
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            apy
            createAtBlock
        }

        apyAutoCompounds(
            first: 100,
            where: {
                timestamp_gte: "1648059270",
                timestamp_lte: "1667999735",
                vault: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c"
            }
            orderBy: createAtBlock
            orderDirection: desc
        ) {
            apy
            createAtBlock
        }
    }
