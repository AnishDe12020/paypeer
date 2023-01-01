import { Button, Heading, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import ConnectWallet from "../src/components/ConnectWallet";
import MainLayout from "../src/layouts/MainLayout";

const HomePage: NextPage = () => {
  const router = useRouter();

  return (
    <MainLayout>
      <ConnectWallet
        callbackUrl={
          router.query.callbackUrl
            ? (router.query.callbackUrl as string)
            : undefined
        }
      >
        Authenticate
      </ConnectWallet>
    </MainLayout>
  );
};

export default HomePage;
