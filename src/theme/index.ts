import { extendTheme } from "@chakra-ui/react";
import { StepsTheme } from "chakra-ui-steps";
import { accentColors, accentTokens, mainColors, stateColors } from "./colors";
import { components } from "./components";

const theme = extendTheme({
  components: { ...components, Steps: StepsTheme },
  colors: { ...accentColors },
  semanticTokens: {
    colors: { ...mainColors, ...stateColors, ...accentTokens },
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
