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
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { TorusWalletName } from "@solana/wallet-adapter-wallets";
import { MouseEventHandler, useCallback } from "react";
import Blockies from "react-blockies";

const ConnectWallet = forwardRef<ButtonProps, "button">((props, ref) => {
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const modalState = useWalletModal();
  const { wallet, connect, select, publicKey, disconnect } = useWallet();

  const connectWithWallet: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.defaultPrevented) return;

      onModalClose();

      if (!wallet) {
        modalState.setVisible(true);
      } else {
        connect().catch(() => {});
      }
    },
    [wallet, connect, modalState, onModalClose]
  );

  const connectWithTorus: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.defaultPrevented) return;

      onModalClose();

      select(TorusWalletName);
    },
    [select, onModalClose]
  );

  const logout: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.defaultPrevented) return;

      disconnect();
    },
    [disconnect]
  );

  return publicKey ? (
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
      <Button w="40" onClick={onModalOpen}>
        Get Started
      </Button>

      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={2}>
            <VStack>
              <Button
                onClick={connectWithWallet}
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
                    <Avatar name="Phantom" src="/assets/phantom.png" />
                    <Avatar
                      name="Solflare"
                      src="/assets/solflare.svg"
                      backgroundColor="brand.secondary"
                    />
                    <Avatar name="Glow" src="/assets/glow.png" />
                    <Avatar name="Backpack" src="/assets/backpack.png" />
                  </AvatarGroup>

                  <Text>Solana Wallet</Text>
                </VStack>
              </Button>
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
                  <Text wordBreak="break-all">Login with email or Google</Text>
                </VStack>
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

export default ConnectWallet;
