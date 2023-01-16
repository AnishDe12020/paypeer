import { PublicKey } from "@solana/web3.js";
import { useEffect, useRef } from "react";
import { findReference, FindReferenceError } from "@solana/pay";
import { useConnection } from "@solana/wallet-adapter-react";
import { TxStatus } from "../types/pay";
import { validateTransfer } from "../utils/validateTransfer";
import BigNumber from "bignumber.js";
import useCluster from "./useCluster";

export default function useTransactionListener(
  reference: PublicKey,
  txStatus: TxStatus | undefined,
  recipient: string,
  amount: string | undefined,
  tokenPubkey: string,

  setTxStatus: (txStatus: TxStatus) => void,
  onSuccess?: (signature: string, customerPubkey: string) => void,
  onFail?: () => void
) {
  const { connection } = useConnection();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (!txStatus) {
          return;
        }

        if (txStatus !== TxStatus.PENDING) {
          return;
        }

        console.log("reference", reference.toString());

        // Check if there is any transaction for the reference
        const signatureInfo = await findReference(connection, reference, {
          finality: "confirmed",
        });

        console.log("Found transaction", signatureInfo);

        const response = await validateTransfer(
          connection,
          signatureInfo.signature,
          {
            recipient: new PublicKey(recipient),
            amount: new BigNumber(amount ?? 0),
            splToken: new PublicKey(tokenPubkey),
          },
          { commitment: "confirmed" }
        );

        const customerPubkey =
          response.transaction.message.accountKeys[0].toString();

        setTxStatus(TxStatus.SUCCESS);
        onSuccess?.(signatureInfo.signature, customerPubkey);
      } catch (e) {
        if (e instanceof FindReferenceError) {
          // No transaction found yet, ignore this error
          return;
        }
        console.error("Unknown error", e);
        setTxStatus(TxStatus.ERROR);

        onFail?.();
      }
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, [
    connection,
    reference,
    txStatus,
    setTxStatus,
    onFail,
    onSuccess,
    amount,
    recipient,
    tokenPubkey,
  ]);
}
