import { Organization } from "@prisma/client";
import axios from "axios";

export const getAllOrgs = async (): Promise<Organization[]> => {
  const {
    data: { organizations },
  } = await axios.get("/api/organizations");

  return organizations;
};
