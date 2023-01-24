import {
  ButtonProps,
  forwardRef,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  AvatarGroup,
  Divider,
  Text,
  useDisclosure,
  Image,
  chakra,
  HStack,
  Collapse,
  Link,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverBody,
  useClipboard,
  Flex,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  BackpackWalletName,
  TorusWalletName,
} from "@solana/wallet-adapter-wallets";
import axios from "axios";
import { MouseEventHandler, useCallback, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import base58 from "bs58";
import { truncatePubkey, truncateString } from "../../utils/truncate";
import {
  Check,
  ClipboardCopy,
  ExternalLink,
  LogOut,
  Wallet,
} from "lucide-react";
import Avvvatars from "avvvatars-react";
import { Router, useRouter } from "next/router";

interface ConnectWalletProps extends ButtonProps {
  callbackUrl?: string;
}

const ConnectWallet = forwardRef<ConnectWalletProps, "button">(
  ({ children, callbackUrl, ...otherProps }, ref) => {
    const { publicKey, disconnect } = useWallet();

    const { data: session } = useSession();

    const router = useRouter();

    const {
      onCopy: onPubkeyCopy,
      hasCopied: hasCopiedPubkey,
      setValue: setPubkey,
    } = useClipboard("");

    const logout: MouseEventHandler<HTMLButtonElement> = useCallback(
      async (e) => {
        if (e.defaultPrevented) return;

        await disconnect();

        await signOut();
      },
      [disconnect]
    );

    return publicKey && session ? (
      <Popover>
        <PopoverTrigger>
          <Button
            color="white"
            variant="ghost"
            h="fit-content"
            minW="36"
            py={2}
          >
            <HStack>
              <Icon as={Wallet} />
              <Text fontSize="xs">{truncatePubkey(publicKey.toBase58())}</Text>
            </HStack>
          </Button>
        </PopoverTrigger>
        <PopoverContent w="72" mx={4}>
          <PopoverBody as={VStack} gap={4} py={4}>
            <Button
              color="white"
              bg="brand.secondary"
              justifyContent="center"
              alignItems="center"
              rounded="lg"
              cursor="copy"
              onClick={onPubkeyCopy}
              h={10}
              as={HStack}
              spacing={6}
              textAlign="center"
              role="group"
              fontWeight="normal"
              fontSize={["xs", "sm", "md"]}
            >
              <Text color="gray.300" fontFamily="mono" fontSize="xs">
                Address: {truncatePubkey(publicKey.toBase58())}
              </Text>
              <chakra.span
                bg={hasCopiedPubkey ? "green.600" : "brand.tertiary"}
                rounded="full"
                w={8}
                h={8}
                as={Flex}
                alignItems="center"
                justifyContent="center"
                _groupHover={{
                  bg: hasCopiedPubkey ? "green.500" : "brand.quaternary",
                }}
              >
                <Icon
                  as={hasCopiedPubkey ? Check : ClipboardCopy}
                  aria-label={"Copy Command"}
                  w={4}
                  h={4}
                  textAlign="center"
                />
              </chakra.span>
            </Button>

            <Button
              color="white"
              colorScheme="red"
              leftIcon={<Icon as={LogOut} />}
              onClick={logout}
            >
              Logout
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    ) : (
      <>
        <Button
          w="40"
          onClick={() =>
            router.push(`/auth?callbackUrl=${callbackUrl ?? "/dashboard"}`)
          }
          {...otherProps}
        >
          {children || "Get Started"}
        </Button>
      </>
    );
  }
);

export default ConnectWallet;
