import { useCallback, useEffect, useMemo, useState } from "react";
import { provider } from 'web3-core'
import { useWallet } from "use-wallet";
import { getContract } from "../utils/pool";

export function usePoolApy(poolAddress: string) {
    const { account, ethereum } = useWallet()
    const [ rewardRate, updateRewardRate ] = useState("0")
    const [ totalStake, updateTotalStaked ] = useState("0")


    const contract = useMemo(() => {
        return getContract(ethereum as provider, poolAddress)
    }, [ethereum, poolAddress])

    const update = useCallback(async () => {
        const rewardRate = await contract.methods.rewardRate().call();
        const totalStaked = await contract.methods.totalSupply().call();
        updateRewardRate(rewardRate)
        updateTotalStaked(totalStaked)
      }, [contract])

      const apy = Number(rewardRate) / Number(totalStake) * 365 * 24 * 3600 
      useEffect(() => {
        if (account && contract) {
            update()
        }
      }, [contract, account, update])

      return { update, apy, totalStake, rewardRate }
}
