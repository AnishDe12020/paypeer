import { useAtom } from "jotai";
import { useMemo } from "react";
import clusterAtom from "../state/cluster";
import { getRpc, getUSDCAddress } from "../utils/cluster";

const useCluster = () => {
  const [cluster, setCluster] = useAtom(clusterAtom);

  const rpc = useMemo(() => getRpc(cluster), [cluster]);
  const usdcAddress = useMemo(() => getUSDCAddress(cluster), [cluster]);

  return {
    cluster,
    setCluster,
    rpc,
    usdcAddress,
  };
};

export default useCluster;
