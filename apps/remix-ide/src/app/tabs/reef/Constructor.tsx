import { ReefSigner } from "@reef-chain/react-lib";
import { CompiledContract } from "@remixproject/plugin-api";
import React, { useEffect, useState } from "react"

interface CompiledContractReducer {
    deploying: boolean;
    contracts: Contracts;
    errorMessage: string;
  }

  interface Contracts {
    [name: string]: Contract;
  }

  interface Contract {
    filename: string;
    contractName: string;
    payload: CompiledContract;
  }
  
  interface ContractsReducer {
    contracts: ContractHolder[];
  }

  interface ContractHolder {
    name: string;
    contract: Contract;
  }  
  
  interface SignersReducer {
    signers: RemixSigner[];
  }

  interface RemixSigner {
    address: string;
    signer: ReefSigner;
  }

interface StateType {
    compiledContracts: CompiledContractReducer,
    contracts: ContractsReducer,
    signers: SignersReducer,
  }
  

interface ConstructorProps { 
    contracts: any,
    signers:any
}

export const Constructor = ({contracts,signers} : ConstructorProps) => {
  const [account, setAccount] = useState(signers.length > 0 ? signers[0].address : "");

  const [selectedContract, setSelectedContract] = useState("");


  useEffect(() => {
    const names = Object.keys(contracts);
    if (names.length > 0) {
      setSelectedContract(names[0]);
    }
  }, [contracts]);

  const signerOptions = signers
    .map(({address}, index) => (
      <option value={address} key={index}>{address}</option>
    ));

  const contractOptions = Object
    .keys(contracts)
    .map((contract, index) => (
      <option value={contract} key={index}>
        {contract}
      </option>
    ));

  return (
    <div className="m-3">
      <div>
        <label>
          Accounts:
        </label>

        <select
          id="accountSelector"
          className="form-select"
          value={account}
          onChange={(event) => setAccount(event.target.value)}
        >
          { signerOptions }
        </select>
      </div>
      <div>
        <label>
          Compiled contracts:
        </label>

        <select
          className="form-select"
          value={selectedContract}
          onChange={(event) => setSelectedContract(event.target.value)}
        >
          { contractOptions }
        </select>
      </div>

      {/* <Deploy 
        contractName={selectedContract}
        signerAddress={account}
      /> */}
      
    </div>
  );
}

export default Constructor;