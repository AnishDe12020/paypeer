import {
  Box,
  Center,
  Container,
  Heading,
  Image,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import { NextPage } from "next";
import Logo from "../src/components/Icons/Logo";
import MainLayout from "../src/layouts/MainLayout";

const HomePage: NextPage = () => {
  return (
    <MainLayout>
      <Container gap={8} textAlign="center" maxW="3xl">
        <VStack spacing={8}>
          <Heading
            fontWeight="extrabold"
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Accept payments in{" "}
            <chakra.span color="accent.secondary">crypto</chakra.span> at your
            physical stores via{" "}
            <chakra.span color="accent.secondary"> QR Codes</chakra.span>
          </Heading>
          <Text color="gray.300">
            Monetize your content by charging your most loyal readers and reward
            them loyalty points. Give back to your loyal readers by granting
            them access to your pre-releases and sneak-peaks.
          </Text>

          <Image
            src="/assets/marketing-pay-and-glow-spay-alt2-transparent.png"
            alt="marketing-pay-and-glow-spay-alt2-transparent.png"
          />
        </VStack>
      </Container>
    </MainLayout>
  );
};

export default HomePage;
