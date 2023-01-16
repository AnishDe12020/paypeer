import { Box, Center, Heading, Image, Text, VStack } from "@chakra-ui/react";
import { NextPage } from "next";
import Logo from "../src/components/Icons/Logo";
import MainLayout from "../src/layouts/MainLayout";

const HomePage: NextPage = () => {
  return (
    <MainLayout>
      <Center as={VStack} gap={8} textAlign="center">
        <Logo h={16} w={16} rounded="full" />
        <Heading fontSize="5xl">
          Accept crypto payments at your irl store
        </Heading>
        <Text fontSize="xl" textColor="gray.300">
          Customers scan a QR Code, enter the amount and pay directly to you!
        </Text>
      </Center>
    </MainLayout>
  );
};

export default HomePage;
