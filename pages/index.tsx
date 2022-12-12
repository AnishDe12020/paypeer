import { Container, Heading, Text } from "@chakra-ui/react";
import { NextPage } from "next";

const HomePage: NextPage = () => {
  return (
    <Container>
      <Heading>Solana Pay POS</Heading>
      <Text>
        A No-Code POS that helps merchants accept payments via Solana Pay
      </Text>
    </Container>
  );
};

export default HomePage;
