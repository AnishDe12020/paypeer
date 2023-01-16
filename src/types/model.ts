import { Organization, Transaction } from "@prisma/client";

export type TransactionWithOrganization = Transaction & {
  organization: Organization;
};

export type TransactionWithOrganizationAllRequired =
  TransactionWithOrganization & {
    customerPubkey: string;
    signature: string;
  };

export type SuccessFullTransaction = Transaction & {
  customerPubkey: string;
  signature: string;
};

export interface TokenOption {
  label: string;
  value: string;
  logoUrl: string;
}
