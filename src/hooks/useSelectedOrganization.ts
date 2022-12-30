import { useAtom } from "jotai";
import { selectedOrganizationAtom } from "../state/dashboard";

const useSelectedOrganization = () => {
  const [selectedOrg, setSelectedOrg] = useAtom(selectedOrganizationAtom);

  return {
    selectedOrg,
    setSelectedOrg,
  };
};

export default useSelectedOrganization;
