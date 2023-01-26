import { chakra, Container } from "@chakra-ui/react";
import React, { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <chakra.main mt={16} px={[4, 8, 16, 32]} pb={8}>
      {children}
    </chakra.main>
  );
};

export default BaseLayout;
