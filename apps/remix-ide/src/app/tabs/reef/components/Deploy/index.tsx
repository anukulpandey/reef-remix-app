import React from "react";
import Loading from "../common/loading/Loading";
import ContractDeploy from "./ContractDeploy";
import ContractRetrieve from "./ContractRetrieve";

interface DeployInputProps {
  contractName: string;
  deploying:any;
  contracts:any[];
}

const DeployInput = ({contractName,deploying,contracts} : DeployInputProps) => {  
  const contractExist = contractName in contracts;

  if (deploying) {
    return <Loading />;
  }

  return (
    <div className="mt-3">
      { contractExist &&
        <>
          {/* <ContractDeploy 
            contractName={contractName}
            />
          <div className="lead text-color text-center mb-2">
            OR
          </div>
          <ContractRetrieve
            contractName={contractName}
          /> */}
        </>
      }
    </div>
  );
}

export default DeployInput;