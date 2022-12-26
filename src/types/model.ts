import { User, Store } from "@prisma/client";

export type StoreWithOwner = Store & {
  owner: User;
};

export type StoresQuery = {
  data: StoreWithOwner[];
};
