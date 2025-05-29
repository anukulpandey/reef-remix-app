import React, { useState } from "react"
import ContractBody from "./ContractBody";
import ContractHeader from "./ContractHeader";
import { ContractHolder } from "../../store/localState";

interface ContractViewProps extends ContractHolder { 
  index: number;
  notify:any;
  contracts:any;
  setDeployedContracts:any;
}

const ContractView = (params : ContractViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);


  const onRemove = () => {
    let updatedDeployedContracts = [];
    params.contracts.forEach((deployedContract:any)=>{
      if((params.contract as any).contract.target!=deployedContract.contract.target){
        updatedDeployedContracts.push(deployedContract)
      }
    })
    params.setDeployedContracts(updatedDeployedContracts);
  }


  return (
    <div className="mt-1">
      <ContractHeader
        open={open}
        isLoading={isLoading}
        address={(params.contract as any).contract.target as any}
        onRemove={onRemove}
        onClick={() => setOpen(!open)}
      />
      { open && <ContractBody {...params} isLoading={isLoading} setIsLoading={setIsLoading}  
      contracts={params.contracts} 
      notify={params.notify}
       contract={params.contract} 
       name={params.name} />  }
    </div>
  );
}

export default ContractView;
