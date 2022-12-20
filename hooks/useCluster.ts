import { useAtom } from "jotai";
import { useMemo } from "react";
import clusterAtom from "../state/cluster";
import { Cluster } from "../types/cluster";
import { getRpc, getUSDCMint } from "../utils/cluster";

const useCluster = () => {
  const [cluster, setCluster] = useAtom<Cluster>(clusterAtom);

  const rpc = useMemo(() => getRpc(cluster), [cluster]);
  const usdcMint = useMemo(() => getUSDCMint(cluster), [cluster]);

  return {
    cluster,
    setCluster,
    rpc,
    usdcMint,
  };
};

export default useCluster;
