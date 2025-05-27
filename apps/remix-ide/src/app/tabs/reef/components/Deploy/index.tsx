import React from "react";
import Loading from "../common/loading/Loading";
import ContractDeploy from "./ContractDeploy";
import ContractRetrieve from "./ContractRetrieve";

interface DeployInputProps {
  contractName: string;
  deploying:boolean;
  setDeploying:any;
  contracts:any[];
  selectedReefSigner:any;
  sources:any;
  notify:any
}

const DeployInput = ({contractName,deploying,setDeploying,contracts,selectedReefSigner,sources,notify} : DeployInputProps) => {  
  const contractExist = contractName.split("|")[contractName.split("|").length-1] in contracts;

  if (deploying) {
    return <Loading />;
  }

  return (
    <div className="mt-3">
      { contractExist &&
        <>
          <ContractDeploy 
            contractName={contractName}
            contracts={contracts}
            reefscanUrl="https://reefscan.com"
            verificationApiUrl="https://reefscan.com"
            selectedReefSigner={selectedReefSigner}
            sources={sources}
            notify={notify}
            setDeploying={setDeploying}
            />
          <div className="lead text-color text-center mb-2">
            OR
          </div>
          {/* <ContractRetrieve
            contractName={contractName}
          /> */}
        </>
      }
    </div>
  );
}

export default DeployInput;