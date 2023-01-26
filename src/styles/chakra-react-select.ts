import { ChakraStylesConfig } from "chakra-react-select";

export const reactSelectStyles: ChakraStylesConfig = {
  menuList: (provided) => ({
    ...provided,
    background: "brand.primary",
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? "brand.secondary" : "brand.primary",
    color: "white",
    ":hover": {
      background: "brand.secondary",
    },
  }),
  container: (provided) => ({
    ...provided,
    minW: "40",
  }),
};
