import { extendTheme } from "@chakra-ui/react";
import { mainColors } from "./colors";

const theme = extendTheme({
  semanticTokens: {
    colors: { ...mainColors },
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: true,
  },
  styles: {
    global: {
      "html, body": {
        background: "brand.primary",
      },
    },
  },
});

export default theme;
