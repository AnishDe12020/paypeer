import { useAtom } from "jotai";
import { useMemo } from "react";
import clusterAtom from "../state/cluster";
import { getRpc, getUSDCAddress, getWeb3authChainId } from "../utils/cluster";

const useCluster = () => {
  const [cluster, setCluster] = useAtom(clusterAtom);

  const rpc = useMemo(() => getRpc(cluster), [cluster]);
  const usdcAddress = useMemo(() => getUSDCAddress(cluster), [cluster]);
  const web3authChainId = useMemo(() => getWeb3authChainId(cluster), [cluster]);

  return {
    cluster,
    setCluster,
    rpc,
    usdcAddress,
    web3authChainId,
  };
};

export default useCluster;
