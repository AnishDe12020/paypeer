import {
  decodeInstruction,
  getAssociatedTokenAddress,
  isTransferCheckedInstruction,
  isTransferInstruction,
} from "@solana/spl-token";
import type {
  Connection,
  Finality,
  PublicKey,
  TransactionResponse,
  TransactionSignature,
} from "@solana/web3.js";
import {
  LAMPORTS_PER_SOL,
  SystemInstruction,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";

/**
 * Thrown when a transaction doesn't contain a valid Solana Pay transfer.
 */
export class ValidateTransferError extends Error {
  name = "ValidateTransferError";
}

/**
 * Fields of a Solana Pay transfer request to validate.
 */
export interface ValidateTransferFields {
  /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient). */
  recipient: PublicKey;
  /** `amount` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#amount). */
  amount: BigNumber;
  /** `spl-token` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token). */
  splToken?: PublicKey;
}

/**
 * Check that a given transaction contains a valid Solana Pay transfer.
 *
 * @param connection - A connection to the cluster.
 * @param signature - The signature of the transaction to validate.
 * @param fields - Fields of a Solana Pay transfer request to validate.
 * @param options - Options for `getTransaction`.
 *
 * @throws {ValidateTransferError}
 */
export async function validateTransfer(
  connection: Connection,
  signature: TransactionSignature,
  { recipient, amount, splToken }: ValidateTransferFields,
  options?: { commitment?: Finality }
): Promise<TransactionResponse> {
  const response = await connection.getTransaction(signature, options);
  if (!response) throw new ValidateTransferError("not found");

  const { message, signatures } = response.transaction;
  const meta = response.meta;
  if (!meta) throw new ValidateTransferError("missing meta");
  if (meta.err) throw meta.err;

  // Deserialize the transaction and make a copy of the instructions we're going to mutate it.
  const transaction = Transaction.populate(message, signatures);
  const instructions = transaction.instructions.slice();

  let transferred: boolean = false;

  console.log("before for loop");

  for (const instruction of instructions) {
    if (splToken) {
      const recipientATA = await getAssociatedTokenAddress(splToken, recipient);
      const accountIndex = message.accountKeys.findIndex((pubkey) =>
        pubkey.equals(recipientATA)
      );

      console.log("accountIndex: " + accountIndex);

      const decodedInstruction = decodeInstruction(instruction);
      if (
        isTransferCheckedInstruction(decodedInstruction) ||
        isTransferInstruction(decodedInstruction)
      ) {
        if (accountIndex === -1)
          throw new ValidateTransferError("recipient not found");

        const preBalance = new BigNumber(
          meta.preTokenBalances?.find((x) => x.accountIndex === accountIndex)
            ?.uiTokenAmount.uiAmountString || 0
        );
        const postBalance = new BigNumber(
          meta.postTokenBalances?.find((x) => x.accountIndex === accountIndex)
            ?.uiTokenAmount.uiAmountString || 0
        );

        if (postBalance.minus(preBalance).lt(amount))
          throw new ValidateTransferError("amount not transferred");

        transferred = true;
      }
    } else {
      const accountIndex = message.accountKeys.findIndex((pubkey) =>
        pubkey.equals(recipient)
      );
      if (accountIndex === -1)
        throw new ValidateTransferError("recipient not found");

      // Check that the instruction is a system transfer instruction.
      try {
        SystemInstruction.decodeTransfer(instruction);
      } catch {
        continue;
      }

      const preBalance = new BigNumber(meta.preBalances[accountIndex] || 0).div(
        LAMPORTS_PER_SOL
      );
      const postBalance = new BigNumber(
        meta.postBalances[accountIndex] || 0
      ).div(LAMPORTS_PER_SOL);

      if (postBalance.minus(preBalance).lt(amount))
        throw new ValidateTransferError("amount not transferred");

      transferred = true;
    }
  }

  if (!transferred) {
    throw new ValidateTransferError("transfer not found");
  }

  return response;
}
