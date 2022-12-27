import { useAtom } from "jotai";
import { web3authAtom } from "../state/web3auth";
import useProvider from "./useProvider";
import RPC from "../lib/solanaRPC";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookie from "js-cookie";
import Cookies from "js-cookie";

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
    if (!web3authProvider) {
      console.error("web3authProvider not initialized yet");
      return;
    }
    const rpc = new RPC(web3authProvider);
    const addresses = await rpc.getAccounts();
    const address = addresses[0];

    const { idToken } = await web3auth.authenticateUser();
    Cookie.set("idToken", idToken, { expires: 1 });

    const { data } = await axios.get(`/api/profiles?pubkey=${address}`);
    if (!data.profile) {
      await axios.put(`/api/profiles`, { pubkey: address });
      await axios.put(
        `/api/organizations`,
        {
          pubkey: address,
          name: "My Organization",
          fundsPubkey: address,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("idToken")}`,
          },
        }
      );
    }

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
    Cookie.remove("idToken");
    setProvider(null);
  };

  const getAccounts = useCallback(async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return [];
    }
    const rpc = new RPC(provider);
    const addresses = await rpc.getAccounts();
    return addresses;
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
    const setUserIfProvider = async () => {
      if (provider) {
        const rpc = new RPC(provider);
        const addresses = await rpc.getAccounts();
        const address = addresses[0];
        setAddress(address);
      } else {
        setAddress(null);
      }
    };

    setUserIfProvider();
  }, [provider]);

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
