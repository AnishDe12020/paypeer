import { useAtom } from "jotai";
import { web3authAtom } from "../state/web3auth";
import useProvider from "./useProvider";
import RPC from "../lib/solanaRPC";
import { useCallback, useEffect, useMemo, useState } from "react";

const useWeb3Auth = () => {
  const [web3auth, setWeb3auth] = useAtom(web3authAtom);

  const { provider, setProvider } = useProvider();

  const [address, setAddress] = useState<string | null>(null);

  const login = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    return user;
  };

  const logout = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getAccounts = useCallback(async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return [];
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    return address;
  }, [provider]);

  const getBalance = async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    return balance;
  };

  const sendTransaction = async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    console.log(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    return signedMessage;
  };

  useEffect(() => {
    const getAddress = async () => {
      const address = await getAccounts();
      setAddress(address[0]);
    };
    getAddress();
  }, [getAccounts]);

  return {
    web3auth,
    setWeb3auth,
    login,
    getUserInfo,
    logout,
    getAccounts,
    getBalance,
    sendTransaction,
    signMessage,
    address,
  };
};

export default useWeb3Auth;
