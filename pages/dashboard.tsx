import { Heading, Spinner } from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import axios from "axios";
import { NextPage } from "next";
import { useQuery } from "react-query";
import { Select } from "chakra-react-select";
import useWeb3Auth from "../src/hooks/useWeb3Auth";
import MainLayout from "../src/layouts/MainLayout";
import Cookies from "js-cookie";

const DashboardPage: NextPage = () => {
  const { address } = useWeb3Auth();

  const { data: orgs } = useQuery<Organization[]>(
    "orgs",
    async () => {
      const res = await axios.get(`/api/organizations?pubkey=${address}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("idToken")}`,
        },
      });

      return res.data.organizations;
    },
    {
      enabled: !!address,
    }
  );

  return (
    <MainLayout>
      <Heading mb={16}>Dashboard</Heading>
      {orgs ? (
        orgs.length > 0 && (
          <Select
            options={orgs.map((org) => ({ label: org.name, value: org.id }))}
          />
        )
      ) : (
        <Spinner />
      )}
    </MainLayout>
  );
};

export default DashboardPage;
