import { SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { atom } from "jotai";

export const web3authAtom = atom<Web3Auth | null>(null);
export const providerAtom = atom<SafeEventEmitterProvider | null>(null);
