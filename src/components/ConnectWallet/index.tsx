import {
  ButtonProps,
  chakra,
  useColorModeValue,
  forwardRef,
} from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const ConnectWallet = forwardRef<ButtonProps, "button">((props, ref) => {
  const ChakraConnectWallet = chakra(WalletMultiButton, {
    baseStyle: {
      height: "40px",
      _hover: {
        bg: useColorModeValue("gray.100", "gray.700"),
      },
    },
  });
  return <ChakraConnectWallet ref={ref} {...props} />;
});

export default ConnectWallet;
