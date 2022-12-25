import { useAtom } from "jotai";
import { providerAtom } from "../state/web3auth";

const useProvider = () => {
  const [provider, setProvider] = useAtom(providerAtom);

  return {
    provider,
    setProvider,
  };
};

export default useProvider;
