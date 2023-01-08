import { GetServerSideProps, NextPage } from "next";
import BaseLayout from "../../../src/layouts/BaseLayout";

import {
  Heading,
  Icon,
  VStack,
  Text,
  Button,
  useClipboard,
  Image,
  HStack,
  chakra,
  Flex,
  Tooltip,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
import { Check, ClipboardCopy, XCircle } from "lucide-react";
import { prisma } from "../../../src/lib/db";
import { TransactionWithOrganization } from "../../../src/types/model";
import { Token } from "../../../src/types/tokens";
import {
  JUPITER_PRICE_API,
  JUPITER_TOKEN_LIST,
} from "../../../src/utils/constants";
import { truncateString } from "../../../src/utils/truncate";

interface PayFailurePageProps {
  tx: TransactionWithOrganization;
  amountInUSD: number;
  token: Token;
}

const PayFailurePage: NextPage<PayFailurePageProps> = ({
  tx,
  amountInUSD,
  token,
}) => {
  const { onCopy: onReferenceCopy, hasCopied: hasCopiedReference } =
    useClipboard(tx.reference);

  return (
    <BaseLayout>
      <VStack gap={8}>
        <Icon
          as={XCircle}
          h={48}
          w={48}
          color="red.700"
          fill="red.400"
          rounded="full"
        />
        <Heading>Failed to find transaction</Heading>
        <Text textAlign="center" textColor="gray.300">
          We were unable to determine if the transaction succeeded. Please tell
          the merchant to check for pending transactions on he merchant
          dashboard or simply send a screenshot of this page to them
        </Text>

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
        </VStack>
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

export default PayFailurePage;
