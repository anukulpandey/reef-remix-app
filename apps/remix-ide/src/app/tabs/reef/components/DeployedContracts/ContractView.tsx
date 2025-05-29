import React, { useState } from "react"
import ContractBody from "./ContractBody";
import ContractHeader from "./ContractHeader";
import { ContractHolder } from "../../store/localState";
import { useDispatch } from "react-redux";
import { contractRemove, contractRemoveAll } from "../../store/actions/contracts";


interface ContractViewProps extends ContractHolder { 
  index: number;
  notify:any;
  contracts:any;
}

const ContractView = (params : ContractViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // todo anukul remove this dispatch
  const onRemove = () => console.log("sdfsd");

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
