import { useAtom } from "jotai";
import { useMemo } from "react";
import { useAsyncMemo } from "use-async-memo";
import clusterAtom from "../state/cluster";
import { Token } from "../types/tokens";
import {
  getRpc,
  getTokenList,
  getTokenListUrl,
  getUSDCAddress,
  getWeb3authChainId,
} from "../utils/cluster";

const useCluster = () => {
  const [cluster, setCluster] = useAtom(clusterAtom);

  const rpc = useMemo(() => getRpc(cluster), [cluster]);
  const usdcAddress = useMemo(() => getUSDCAddress(cluster), [cluster]);
  const web3authChainId = useMemo(() => getWeb3authChainId(cluster), [cluster]);
  const tokenListUrl = useMemo(() => getTokenListUrl(cluster), [cluster]);
  const tokenList = useAsyncMemo<Token[]>(
    async () => await getTokenList(cluster),
    [cluster]
  );

  return {
    cluster,
    setCluster,
    rpc,
    usdcAddress,
    web3authChainId,
    tokenListUrl,
    tokenList,
  };
};

export default useCluster;
