import { ChakraStylesConfig } from "chakra-react-select";

const reactSelectStyles: ChakraStylesConfig = {
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
};

export default reactSelectStyles;
