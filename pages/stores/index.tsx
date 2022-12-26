import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { NextPage } from "next";
import Head from "next/head";
import { useQuery } from "react-query";
import useWeb3Auth from "../../src/hooks/useWeb3Auth";
import MainLayout from "../../src/layouts/MainLayout";
import { StoresQuery, StoreWithOwner } from "../../src/types/model";

const StoresPage: NextPage = () => {
  const { address } = useWeb3Auth();

  const toast = useToast();

  const { data, isLoading, error } = useQuery<StoresQuery>(
    "stores",
    async () => {
      const res = await axios.get(`/api/store?ownerPubkey=${address}`);
      return res.data;
    },
    {
      enabled: !!address,
    }
  );

  if (error) {
    toast({
      title: "Error",
      description: "Error fetching stores",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }

  return (
    <MainLayout>
      <Heading mb={16}>Stores</Heading>

      {data ? (
        data.data.length >= 1 &&
        data.data.map((store) => (
          <Card key={store.id}>
            <CardHeader>
              <Heading as="h3" fontSize="2xl">
                {store.name}
              </Heading>
            </CardHeader>
            <CardBody>
              <Text>{store.fundsPubkey}</Text>
            </CardBody>
          </Card>
        ))
      ) : (
        <Spinner />
      )}
    </MainLayout>
  );
};

export default StoresPage;
