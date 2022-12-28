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
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  BackpackWalletName,
  TorusWalletName,
} from "@solana/wallet-adapter-wallets";
import axios from "axios";
import { MouseEventHandler, useCallback } from "react";
import Blockies from "react-blockies";
import { signIn, signOut, useSession } from "next-auth/react";
import base58 from "bs58";

interface ConnectWalletProps extends ButtonProps {
  callbackUrl?: string;
}

const ConnectWallet = forwardRef<ConnectWalletProps, "button">(
  ({ children, callbackUrl, ...otherProps }, ref) => {
    const {
      isOpen: isModalOpen,
      onOpen: onModalOpen,
      onClose: onModalClose,
    } = useDisclosure();

    const modalState = useWalletModal();
    const {
      wallet,
      connect,
      select,
      publicKey,
      disconnect,
      signMessage,
      wallets,
    } = useWallet();

    const { data: session } = useSession();

    const connectWithWallet: MouseEventHandler<HTMLButtonElement> = useCallback(
      async (e) => {
        if (e.defaultPrevented) return;

        if (!wallet) {
          modalState.setVisible(true);
        } else {
          connect().catch(() => {});
        }
      },
      [wallet, connect, modalState]
    );

    const connectWithBackpack: MouseEventHandler<HTMLButtonElement> =
      useCallback(
        async (e) => {
          if (e.defaultPrevented) return;

          select(BackpackWalletName);
        },
        [select]
      );

    const connectWithTorus: MouseEventHandler<HTMLButtonElement> = useCallback(
      async (e) => {
        if (e.defaultPrevented) return;

        select(TorusWalletName);
      },
      [select]
    );

    const logout: MouseEventHandler<HTMLButtonElement> = useCallback(
      (e) => {
        if (e.defaultPrevented) return;

        disconnect();

        signOut();
      },
      [disconnect]
    );

    const login = useCallback(async () => {
      const res = await axios.get("/api/nonce");

      if (res.status != 200) {
        console.error("failed to fetch nonce");
        return;
      }

      const { nonce } = res.data;

      const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);

      if (!signMessage) {
        console.error("signMessage is not defined");
        return;
      }

      const signedMessage = await signMessage(encodedMessage);

      signIn("credentials", {
        publicKey: publicKey?.toBase58(),
        signature: base58.encode(signedMessage),
        callbackUrl: callbackUrl ?? `${window.location.origin}/`,
      });
    }, [signMessage, publicKey, callbackUrl]);

    return publicKey && session ? (
      <Menu>
        <MenuButton>
          <Avatar as={Blockies} seed={publicKey.toBase58()} size="sm" />
        </MenuButton>
        <MenuList background="brand.primary">
          <MenuItem
            background="brand.primary"
            _hover={{
              background: "brand.secondary",
            }}
          >
            Account
          </MenuItem>
          <MenuDivider />
          <MenuItem
            background="brand.primary"
            _hover={{
              background: "brand.secondary",
            }}
            textColor="red.500"
            onClick={logout}
          >
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    ) : (
      <>
        <Button w="40" onClick={onModalOpen} {...otherProps}>
          {children || "Get Started"}
        </Button>

        <Modal isOpen={isModalOpen} onClose={onModalClose} size="xs">
          <ModalOverlay />
          <ModalContent>
            <ModalBody p={2}>
              <VStack>
                {publicKey ? (
                  <Button onClick={login}>Sign Message</Button>
                ) : (
                  <>
                    <VStack my={4} gap={4}>
                      {wallets
                        .filter((wallet) => wallet.readyState === "Installed")
                        .map((wallet) => (
                          <Button
                            key={wallet.adapter.name}
                            onClick={() => select(wallet.adapter.name)}
                            leftIcon={
                              <Image
                                src={wallet.adapter.icon}
                                alt={wallet.adapter.name}
                                h={6}
                                w={6}
                              />
                            }
                          >
                            <Text>{wallet.adapter.name}</Text>
                          </Button>
                        ))}
                    </VStack>
                    <Divider />
                    <Button
                      onClick={connectWithTorus}
                      variant="unstyled"
                      w="full"
                      _hover={{
                        background: "brand.secondary",
                      }}
                      h="fit-content"
                      py={4}
                    >
                      <VStack gap={4}>
                        <AvatarGroup>
                          <Avatar
                            name="Google"
                            src="/assets/google.png"
                            backgroundColor="brand.secondary"
                          />
                          <Avatar name="Torus" src="/assets/torus.svg" />
                        </AvatarGroup>
                        <Text wordBreak="break-all">
                          Login with email or Google
                        </Text>
                      </VStack>
                    </Button>
                  </>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }
);

export default ConnectWallet;
