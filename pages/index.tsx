import { Heading, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import MainLayout from "../src/layouts/MainLayout";

const HomePage: NextPage = () => {
  return (
    <MainLayout>
      <Heading>Solana Pay POS</Heading>
      <Text>
        A No-Code POS that helps merchants accept payments via Solana Pay
      </Text>
    </MainLayout>
  );
};

export default HomePage;
