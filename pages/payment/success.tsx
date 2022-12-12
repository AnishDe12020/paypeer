import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import {
  Container,
  Heading,
  Link,
  Text,
  VStack,
  chakra,
  useClipboard,
  Button,
  HStack,
  Flex,
  Icon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import SolanaIcon from "../../components/Icons/Solana";

// TODO: truncate signature
// TODO: truncate reference
// TODO: mobile responsive UI
// TODO: add Solscan

const PaymentConfirmedPage: NextPage = () => {
  const router = useRouter();

  const {
    onCopy: onReferenceCopy,
    hasCopied: hasCopiedReference,
    setValue: setReference,
  } = useClipboard("");

  const {
    onCopy: onSignatureCopy,
    hasCopied: hasCopiedSignature,
    setValue: setSignature,
  } = useClipboard("");

  useEffect(() => {
    setReference(router.query.reference as string);
  }, [router.query.reference, setReference]);

  useEffect(() => {
    setSignature(router.query.signature as string);
  }, [router.query.signature, setSignature]);

  return (
    <Container>
      <VStack gap={8}>
        <Heading fontSize="4xl" fontWeight="bold">
          Payment Confirmed!
        </Heading>
        <VStack gap={4}>
          <Button
            bg="brand.secondary"
            justifyContent="center"
            alignItems="center"
            rounded="lg"
            cursor="copy"
            onClick={onReferenceCopy}
            pl={6}
            pr={4}
            h={10}
            as={HStack}
            spacing={6}
            textAlign="center"
            role="group"
          >
            <Text color="gray.300" fontFamily="mono">
              Reference: {router.query.reference}
            </Text>
            <chakra.span
              bg={hasCopiedReference ? "green.600" : "brand.tertiary"}
              rounded="full"
              w={8}
              h={8}
              as={Flex}
              alignItems="center"
              justifyContent="center"
              _groupHover={{
                bg: hasCopiedReference ? "green.500" : "brand.quaternary",
              }}
            >
              <Icon
                as={hasCopiedReference ? CheckIcon : CopyIcon}
                aria-label={"Copy Command"}
                w={4}
                h={4}
                textAlign="center"
              />
            </chakra.span>
          </Button>

          <HStack
            bg="brand.secondary"
            justifyContent="center"
            alignItems="center"
            rounded="lg"
            pl={6}
            pr={4}
            h={10}
            spacing={6}
            textAlign="center"
            border="1px solid"
            borderColor="brand.tertiary"
          >
            <Text>{router.query.signature}</Text>

            <HStack spacing={4}>
              <Tooltip label="Copy Signature">
                <IconButton
                  aria-label="Copy Signature"
                  bg={hasCopiedReference ? "green.600" : "brand.tertiary"}
                  rounded="full"
                  w={8}
                  h={8}
                  as={Flex}
                  alignItems="center"
                  justifyContent="center"
                  cursor="copy"
                  _hover={{
                    bg: hasCopiedReference ? "green.500" : "brand.quaternary",
                  }}
                  icon={
                    <Icon
                      as={hasCopiedReference ? CheckIcon : CopyIcon}
                      aria-label={"Copy Command"}
                      w={4}
                      h={4}
                      textAlign="center"
                    />
                  }
                />
              </Tooltip>
              <Tooltip label="View on Solana Explorer">
                <Link
                  isExternal
                  href={`https://explorer.solana.com/tx/${router.query.signature}?cluster=devnet`}
                  bg="brand.tertiary"
                  rounded="full"
                  _hover={{ bg: "brand.quaternary" }}
                  w={8}
                  h={8}
                  as={Flex}
                  alignItems="center"
                  justifyContent="center"
                >
                  <SolanaIcon />
                </Link>
              </Tooltip>
            </HStack>
          </HStack>
        </VStack>
      </VStack>
    </Container>
  );
};

export default PaymentConfirmedPage;
