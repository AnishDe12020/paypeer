import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import {
  Container,
  Flex,
  HStack,
  useClipboard,
  VStack,
  Text,
  Box,
  Button,
  chakra,
  Icon,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { truncateURL } from "../../utils/truncate";

const QRPage: NextPage = () => {
  const { publicKey } = useWallet();
  const [size, setSize] = useState(() =>
    typeof window === "undefined"
      ? 400
      : Math.min(window.screen.availWidth - 48, 400)
  );

  const { onCopy, hasCopied, setValue, value } = useClipboard("");

  useEffect(() => {
    if (publicKey) {
      setValue(`http://localhost:3000/qr/${publicKey}`);
    }
  }, [publicKey, setValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setSize(Math.min(window.screen.availWidth - 48, 400));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Container>
      <VStack mt={16} gap={8}>
        {publicKey ? (
          <>
            <Box p={8} bg="#c9c9c9">
              <QRCode
                value={`http://localhost:3000/qr/${publicKey}`}
                size={size}
                bgColor="#c9c9c9"
                level="M"
              />
            </Box>

            <Button
              bg="brand.secondary"
              justifyContent="center"
              alignItems="center"
              rounded="lg"
              cursor="copy"
              onClick={onCopy}
              pl={6}
              pr={4}
              h={10}
              as={HStack}
              spacing={6}
              textAlign="center"
              role="group"
              fontWeight="normal"
            >
              <Text color="gray.300" fontFamily="mono">
                {truncateURL(value)}
              </Text>
              <chakra.span
                bg={hasCopied ? "green.600" : "brand.tertiary"}
                rounded="full"
                w={8}
                h={8}
                as={Flex}
                alignItems="center"
                justifyContent="center"
                _groupHover={{
                  bg: hasCopied ? "green.500" : "brand.quaternary",
                }}
              >
                <Icon
                  as={hasCopied ? CheckIcon : CopyIcon}
                  aria-label={"Copy Command"}
                  w={4}
                  h={4}
                  textAlign="center"
                />
              </chakra.span>
            </Button>
          </>
        ) : (
          <WalletMultiButton />
        )}
      </VStack>
    </Container>
  );
};

export default QRPage;
