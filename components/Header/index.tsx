import { HStack, Icon, Link, Select } from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NextLink from "next/link";
import useCluster from "../../hooks/useCluster";

const Header = () => {
  const { cluster, setCluster } = useCluster();

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
      falst
      <HStack gap={2}>
        <NextLink href="/payment" passHref>
          <Link _hover={{ opacity: 0.6 }}>Payment</Link>
        </NextLink>
        <NextLink href="/qr" passHref>
          <Link _hover={{ opacity: 0.6 }}>QR Code</Link>
        </NextLink>
      </HStack>
      <HStack>
        <WalletMultiButton />

        <Select onChange={(e) => setCluster(e.target.value)} value={cluster}>
          <option value="mainnet-beta">Mainnet</option>
          <option value="devnet">Devnet</option>
        </Select>
      </HStack>
    </HStack>
  );
};

export default Header;
