import {
  Heading,
  Icon,
  VStack,
  Text,
  Collapse,
  useDisclosure,
  Button,
  useClipboard,
  Image,
  HStack,
  chakra,
  Flex,
  Tooltip,
  IconButton,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
import { Check, CheckCircle2, ClipboardCopy } from "lucide-react";
import { GetServerSideProps, NextPage } from "next";
import SolanaIcon from "../../../src/components/Icons/Solana";
import BaseLayout from "../../../src/layouts/BaseLayout";
import { prisma } from "../../../src/lib/db";
import { TransactionWithOrganizationAllRequired } from "../../../src/types/model";
import { Token } from "../../../src/types/tokens";
import {
  JUPITER_PRICE_API,
  JUPITER_TOKEN_LIST,
} from "../../../src/utils/constants";
import { truncateString } from "../../../src/utils/truncate";

interface PaySuccessPageProps {
  tx: TransactionWithOrganizationAllRequired;
  amountInUSD: number;
  token: Token;
}

const PaySuccessPage: NextPage<PaySuccessPageProps> = ({
  tx,
  amountInUSD,
  token,
}) => {
  const { isOpen, onToggle } = useDisclosure();

  const { onCopy: onReferenceCopy, hasCopied: hasCopiedReference } =
    useClipboard(tx.reference);

  const { onCopy: onSignatureCopy, hasCopied: hasCopiedSignature } =
    useClipboard(tx.signature);

  return (
    <BaseLayout>
      <VStack gap={8}>
        <Icon
          as={CheckCircle2}
          h={48}
          w={48}
          color="green.700"
          fill="green.400"
          rounded="full"
        />
        <Heading>Transaction Successful</Heading>

        <VStack gap={4}>
          {tx.organization.logoUrl && (
            <Image
              h={16}
              w={16}
              rounded="full"
              src={tx.organization.logoUrl}
              alt={tx.organization.name}
            />
          )}
          <VStack>
            <Text fontWeight="bold">{tx.organization.name}</Text>
            <Text fontSize="xs">{tx.organization.fundsPubkey}</Text>
          </VStack>

          <VStack>
            <HStack>
              <Text>
                {Number(tx.amount).toFixed(2).toString()} {token.symbol}
              </Text>

              <Tooltip label={token?.symbol}>
                <Link
                  href={`https://solscan.io/address/${tx.tokenPubkey}`}
                  isExternal
                >
                  <Image
                    src={token?.logoURI}
                    alt={token?.symbol}
                    boxSize="20px"
                    rounded="full"
                  />
                </Link>
              </Tooltip>
            </HStack>
            <Text color="gray.300">(${amountInUSD})</Text>
          </VStack>
        </VStack>

        <Button onClick={onToggle}>{isOpen ? "Hide" : "Show"} details</Button>

        <Collapse in={isOpen} unmountOnExit>
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
              fontWeight="normal"
              fontSize={["xs", "sm", "md"]}
            >
              <Text color="gray.300" fontFamily="mono" fontSize="xs">
                Reference: {truncateString(tx.reference)}
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
                  as={hasCopiedReference ? Check : ClipboardCopy}
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
              fontSize={["xs", "sm", "md"]}
            >
              <Text color="gray.300" fontFamily="mono" fontSize="xs">
                Tx Sig: {truncateString(tx.signature)}
              </Text>

              <HStack spacing={4}>
                <Tooltip label="Copy Signature">
                  <IconButton
                    aria-label="Copy Signature"
                    bg={hasCopiedSignature ? "green.600" : "brand.tertiary"}
                    rounded="full"
                    w={8}
                    h={8}
                    as={Flex}
                    onClick={onSignatureCopy}
                    _hover={{
                      bg: hasCopiedSignature ? "green.500" : "brand.quaternary",
                    }}
                    icon={
                      <Icon
                        as={hasCopiedSignature ? Check : ClipboardCopy}
                        aria-label={"Copy Command"}
                        w={4}
                        h={4}
                        textAlign="center"
                      />
                    }
                  />
                </Tooltip>
                <Tooltip label="View on Solana Explorer">
                  <IconButton
                    aria-label="View on Solana Explorer"
                    bg="brand.tertiary"
                    rounded="full"
                    _hover={{ bg: "brand.quaternary" }}
                    w={8}
                    h={8}
                    cursor="pointer"
                    icon={<SolanaIcon />}
                    onClick={() => {
                      window.open(
                        `https://explorer.solana.com/tx/${tx.signature}`
                      );
                    }}
                  />
                </Tooltip>
                <Tooltip label="View on Solscan">
                  <IconButton
                    aria-label="View on Solscan"
                    bg="brand.tertiary"
                    rounded="full"
                    _hover={{ bg: "brand.quaternary" }}
                    w={8}
                    h={8}
                    cursor="pointer"
                    icon={
                      <Image
                        src="/assets/solscan.png"
                        aria-label="Solscan Logo"
                        h={6}
                        w={6}
                      />
                    }
                    onClick={() => {
                      window.open(`https://solscan.io/tx/${tx.signature}`);
                    }}
                  />
                </Tooltip>
              </HStack>
            </HStack>
          </VStack>
        </Collapse>
      </VStack>
    </BaseLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const tx = await prisma.transaction.findUnique({
    where: {
      id: context.query.txId as string,
    },
    include: {
      organization: true,
    },
  });

  if (!tx) {
    return {
      notFound: true,
    };
  }

  const {
    data: { data: prices },
  } = await axios.get(`${JUPITER_PRICE_API}?ids=${tx.tokenPubkey}`);

  const { data } = await axios.get<Token[]>(JUPITER_TOKEN_LIST);

  return {
    props: {
      tx: JSON.parse(JSON.stringify(tx)),
      amountInUSD: (prices[tx.tokenPubkey].price * Number(tx.amount)).toFixed(
        2
      ),
      token: data.find((t) => t.address === tx.tokenPubkey),
    },
  };
};

export default PaySuccessPage;
