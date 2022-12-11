import { HStack } from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Header = () => {
  return (
    <HStack
      as="nav"
      px={[8, 16, 24]}
      py={6}
      justifyContent="end"
      alignItems="center"
      gap={4}
    >
      <WalletMultiButton />
    </HStack>
  );
};

export default Header;
