import { Organization, Transaction } from "@prisma/client";

export type TransactionWithOrganization = Transaction & {
  organization: Organization;
};

export type TransactionWithOrganizationAllRequired =
  TransactionWithOrganization & {
    customerPubkey: string;
    signature: string;
  };
