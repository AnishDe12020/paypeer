import {
  Box,
  Drawer,
  DrawerContent,
  HStack,
  Link,
  List,
  ListItem,
  Select,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NextLink from "next/link";
import { useRef } from "react";
import useCluster from "../../hooks/useCluster";
import { Cluster } from "../../types/cluster";
import { Rotate } from "hamburger-react";

interface INavLink {
  content: string;
  href: string;
}

const links: INavLink[] = [
  {
    content: "Home",
    href: "/",
  },
  {
    content: "Payment",
    href: "/payment",
  },
  {
    content: "QR Code",
    href: "/qr",
  },
];

const Header = () => {
  const { cluster, setCluster } = useCluster();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <HStack
      as="nav"
      px={[2, 12, 24]}
      py={6}
      justifyContent="space-between"
      alignItems="center"
      height={20}
      borderBottom="1px solid"
      borderBottomColor="brand.secondary"
    >
      <Box display={{ base: "inline-flex", md: "none" }}>
        <Rotate
          toggle={onOpen}
          toggled={isOpen}
          direction="right"
          label="Menu"
          size={24}
          rounded
        />
      </Box>

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
        size="full"
        initialFocusRef={closeButtonRef}
      >
        <DrawerContent backgroundColor="brand.primary" mt={20}>
          <VStack as={List} mt={8} w="full" alignItems="start" px={8} gap={4}>
            {links.map((link) => (
              <ListItem
                key={link.content}
                borderBottom="1px solid"
                borderBottomColor="brand.secondary"
                _hover={{
                  opacity: 0.6,
                }}
                py={1}
                w="full"
                onClick={onClose}
              >
                <Link
                  as={NextLink}
                  href={link.href}
                  _hover={{ opacity: 0.6 }}
                  textColor="red.500"
                >
                  {link.content}
                </Link>
              </ListItem>
            ))}
          </VStack>
        </DrawerContent>
      </Drawer>
      <HStack gap={2} display={{ base: "none", md: "flex" }} as={List}>
        {links.map((link) => (
          <ListItem key={link.content}>
            <Link as={NextLink} href={link.href} _hover={{ opacity: 0.6 }}>
              {link.content}
            </Link>
          </ListItem>
        ))}
      </HStack>
      <HStack>
        <WalletMultiButton />

        <Select
          onChange={(e) => setCluster(e.target.value as Cluster)}
          value={cluster}
        >
          <option value="mainnet-beta">Mainnet</option>
          <option value="devnet">Devnet</option>
        </Select>
      </HStack>
    </HStack>
  );
};

export default Header;
