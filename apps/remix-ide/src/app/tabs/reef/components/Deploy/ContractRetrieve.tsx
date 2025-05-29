import React, { useState } from "react"
import { Contract, Signer } from "ethers";
import { ABIParameter } from "@remixproject/plugin-api";
import Function from "../Function/Function";

interface ContractRetrieveProps {
  contractName: string;
  selectedReefSigner:any;
  contracts:any;
  setDeployedContracts:any;
  deployedContracts:any;
}

const contractRetrievialParameters = (): ABIParameter[] => [{
  name: "",
  type: "Load contract from Address"
}];

const ContractRetrieve = ({contractName,selectedReefSigner,contracts,setDeployedContracts,deployedContracts} : ContractRetrieveProps) => {
  const [errorMessage, setErrorMessage] = useState("");

  const signer = selectedReefSigner;
  const contractAbi = contracts[contractName.split("|")[1]][contractName.split("|")[0]].abi;
  
  const findContract = async (address: string) => {
    setErrorMessage("");
    try {
      const contract = new Contract(address, contractAbi, signer.signer as any);
      setDeployedContracts([...deployedContracts,{
        contract
      }]);// dispatch(contractAdd(contractName, contract));
    } catch (e) {
      setErrorMessage((e as any).message);
    }
  };

  return (
    <Function
      name="At address"
      parameters={contractRetrievialParameters()}
      text={errorMessage}
      error={true}
      isReturn={false}
      submitInline={findContract}
      submitCollapse={(addresses: string[]) => findContract(addresses[0])}
    />
  );
}

export default ContractRetrieve;