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
  notify:any;
  network:any;
  deployedContracts:any;
  setDeployedContracts:any;
  compilerState:any;
}

const DeployInput = ({contractName,deploying,setDeploying,contracts,selectedReefSigner,sources,notify,network,deployedContracts,setDeployedContracts,compilerState} : DeployInputProps) => {  
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
            reefscanUrl={network.reefscanUrl}
            verificationApiUrl={network.verificationApiUrl}
            selectedReefSigner={selectedReefSigner}
            sources={sources}
            notify={notify}
            setDeploying={setDeploying}
            compilerState={compilerState}
            deployedContracts={deployedContracts}
            setDeployedContracts={setDeployedContracts}
            />
          <div className="lead text-color text-center mb-2">
            OR
          </div>
          <ContractRetrieve
            contractName={contractName}
            deployedContracts={deployedContracts}
            setDeployedContracts={setDeployedContracts}
            contracts={contracts}
            selectedReefSigner={selectedReefSigner}
          />
        </>
      }
    </div>
  );
}

export default DeployInput;