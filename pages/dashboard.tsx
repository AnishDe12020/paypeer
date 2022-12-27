import { NextPage } from "next";
import DashboardLayout from "../src/layouts/DashboardLayout";
import { Text } from "@chakra-ui/react";

const DashboardPage: NextPage = () => {
  return (
    <DashboardLayout>
      <Text>test</Text>
    </DashboardLayout>
  );
};

export default DashboardPage;
