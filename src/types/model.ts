import { Organization, Transaction } from "@prisma/client";

export type TransactionWithOrganization = Transaction & {
  organization: Organization;
};
