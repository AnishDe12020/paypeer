import { Organization } from "@prisma/client";
import { atomWithStorage } from "jotai/utils";

export const selectedOrganizationAtom = atomWithStorage<Organization | null>(
  "selectedOrganization",
  null
);
