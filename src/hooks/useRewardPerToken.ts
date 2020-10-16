import { useCallback, useEffect, useMemo, useState } from "react";
import { provider } from 'web3-core'
import { useWallet } from "use-wallet";
import { BigNumber } from "ethers/utils";
import { getContract } from "../utils/pool";

export function useRewardPerToken(poolAddress: string) {
    const { account, ethereum } = useWallet()
    const [ rewardPerToken, updateRewardPerToken ] = useState(new BigNumber(0))
    const [ lastUpdateTime, updateLastupdate ] = useState(new BigNumber(0))


    const contract = useMemo(() => {
        return getContract(ethereum as provider, poolAddress)
    }, [ethereum, poolAddress])

    const update = useCallback(async () => {
        const _rewardPerToken = await contract.methods.rewardPerToken().call();
        const _lastUpdateTime = await contract.methods.lastUpdateTime().call();
        updateRewardPerToken(_rewardPerToken)
        updateLastupdate(_lastUpdateTime)
      }, [contract])

      const diffSinceLastUpdate = new Date().getTime() - lastUpdateTime.mul(1000).toNumber()
      const oneYearInMs = 1000 * 60 * 60 * 24 * 365
      const howManyPartInYear = oneYearInMs / diffSinceLastUpdate
      const apy = (rewardPerToken.div("1000000000000000000").toNumber()) * (howManyPartInYear)

      useEffect(() => {
        if (account && contract) {
            update()
        }
      }, [contract, account, update])

      return { rewardPerToken, update, apy, lastUpdateTime }
}
