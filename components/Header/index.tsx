import { HStack, Icon, Link } from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NextLink from "next/link";

const Header = () => {
  return (
    <HStack
      as="nav"
      px={[8, 16, 24]}
      py={6}
      justifyContent="space-between"
      alignItems="center"
      gap={[2, 4]}
      fontSize={["sm", "md"]}
    >
      <NextLink href="/" passHref>
        <Link _hover={{ opacity: 0.6 }}>Home</Link>
        {/* TODO: Replace with logo */}
      </NextLink>
      <HStack gap={2}>
        <NextLink href="/payment" passHref>
          <Link _hover={{ opacity: 0.6 }}>Payment</Link>
        </NextLink>
        <NextLink href="/qr" passHref>
          <Link _hover={{ opacity: 0.6 }}>QR Code</Link>
        </NextLink>
      </HStack>

      <WalletMultiButton />
    </HStack>
  );
};

export default Header;
