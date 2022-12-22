import { HStack, Link, Select } from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NextLink from "next/link";
import useCluster from "../../hooks/useCluster";
import { Cluster } from "../../types/cluster";

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
      <HStack gap={2}>
        <Link as={NextLink} href="/" _hover={{ opacity: 0.6 }}>
          Home
        </Link>
        <Link as={NextLink} href="/payment" _hover={{ opacity: 0.6 }}>
          Payment
        </Link>
        <Link as={NextLink} href="/qr" _hover={{ opacity: 0.6 }}>
          QR Code
        </Link>
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
