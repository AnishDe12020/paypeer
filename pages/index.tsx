import {
  Box,
  Center,
  Container,
  Heading,
  Image,
  Text,
  VStack,
  chakra,
  Icon,
  Button,
  HStack,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import Arrow from "../src/components/Icons/Arrow";
import MainLayout from "../src/layouts/MainLayout";

const HomePage: NextPage = () => {
  const router = useRouter();

  return (
    <MainLayout>
      <Container gap={8} textAlign="center" maxW="3xl" bg="transparent">
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

          <Button
            h="16"
            fontSize="xl"
            rounded="3xl"
            w="64"
            variant="solid"
            onClick={() => router.push("/dashboard")}
          >
            Set up your store now
          </Button>

          <VStack spacing={3} pos="relative">
            <Image
              h="600"
              src="/assets/pay-card-transparent.png"
              alt="pay-card-transparent.png"
            />

            <Box display={{ base: "none", md: "flex" }}>
              <Icon as={Arrow} w={71} pos="absolute" right="10px" top="350px" />
              <Text
                fontSize={"lg"}
                position={"absolute"}
                right={"-100px"}
                top={"320px"}
                transform={"rotate(10deg)"}
              >
                Scan this to try now!
              </Text>
            </Box>
          </VStack>

          {/* <Image
            src="/assets/marketing-pay-and-glow-spay-alt2-transparent.png"
            alt="marketing-pay-and-glow-spay-alt2-transparent.png"
          /> */}
        </VStack>
      </Container>

      <Container maxW="5xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <VStack
            spacing={8}
            align={{ base: "center", md: "flex-start" }}
            textAlign={{ base: "center", md: "left" }}
            justifyContent="center"
          >
            <Heading as="h3">Simple pay pages</Heading>
            <Text color="gray.300">
              Scanning the QR Code opens up a simple pay page, similar to Google
              Pay where the customer enters the amount and an optional message
              and pays with Solana Pay
            </Text>
          </VStack>
          <Flex>
            <Image
              src="/assets/marketing-pay-page.png"
              alt="marketing-pay-page"
            />
          </Flex>
        </SimpleGrid>
      </Container>

      <Container maxW="5xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Flex>
            <Image
              src="/assets/marketing-dashboard.png"
              alt="marketing-dashboard"
            />
          </Flex>
          <VStack
            spacing={8}
            align={{ base: "center", md: "flex-start" }}
            textAlign={{ base: "center", md: "left" }}
            justifyContent="center"
          >
            <Heading as="h3">Comprehensive Dashboard for your store</Heading>
            <Text color="gray.300">
              View detailed graphs and logs for transactions taken place in your
              store. These details include the amount, token, date and time of
              payment, the customer&apos;s wallet address, a message from them
              if they have specified any and the token used for payment
            </Text>
          </VStack>
        </SimpleGrid>
      </Container>

      <Container maxW="5xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <VStack
            spacing={8}
            align={{ base: "center", md: "flex-start" }}
            textAlign={{ base: "center", md: "left" }}
            justifyContent="center"
          >
            <Heading as="h3">Multi-Token Support</Heading>
            <Text color="gray.300">
              You as a merchant can specify which token(s) you want to accept as
              payment from your customer. Customers can then either choose
              between the accepted tokens if you have allowed multiple or all
              tokens or if you have allowed just one token, customers will have
              to pay with that.
            </Text>
          </VStack>
          <Flex>
            <Image
              src="/assets/marketing-multi-token-support.png"
              alt="marketing-multi-token-support"
            />
          </Flex>
        </SimpleGrid>
      </Container>
    </MainLayout>
  );
};

export default HomePage;
