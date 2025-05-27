import React, { useState } from "react";
import { ReefContract, submitDeploy } from "../../api";
import { compiledContractError } from "../../store/actions/compiledContracts";
import { signersBalance } from "../../store/actions/signers";
import { StateType } from "../../store/reducers";
import { getConstructor, getParameters, prepareParameters } from "../../utils";

import Function from "../Function/Function";

interface ContractDeployProps {
  contractName: string;
  selectedReefSigner:any;
  sources:any;
  contracts:any;
  reefscanUrl:string;
  verificationApiUrl:string;
  notify:any;
  setDeploying:any;
}

interface Contracts {
  [name: string]: ReefContract;
}

const combineSources = (filePath: string, source: any): string => {
  const sources: Record<string, { content: string }> = {};

  if (source?.sources && filePath in source.sources) {
    sources[filePath] = {
      content: source.sources[filePath].content
    };
  }

  return JSON.stringify(sources);
};

const getPayload=(contract:any,contractName:string)=>{
  return {
    ...contract[contractName]
  };
}


const ContractDeploy = ({ contractName,selectedReefSigner,contracts,reefscanUrl,verificationApiUrl ,sources,notify,setDeploying}: ContractDeployProps) => {
  const [error,setError] = useState<string>("");
  const signer = selectedReefSigner;
  const contractPath = contractName.split("|")[1];
  const contract = contracts[contractPath];
  const contractNameFromFile = contractName.split("|")[0];
  
  const constructorAbi = getConstructor(contract[contractNameFromFile].abi);
  const parameters = getParameters(constructorAbi);

  const source = combineSources(contractPath,sources);
  const payload = getPayload(contract,contractNameFromFile);

  const partialDeployContent = {
    reefscanUrl,
    verificationApiUrl,
    contractName:contractPath,
    signer: signer.signer,
    contract: { ...contract, source,payload },
    notify,
    setDeploying
  };

  const submitCollapse = async (values: string[]) => {
    try {
      const params = prepareParameters(values.join(", "));
      await submitDeploy({ ...partialDeployContent, params });
      // dispatch(signersBalance(await provider!.getBalance(signer.evmAddress) as any));
    } catch (e: any) {
      // dispatch(compiledContractError(e.message ? e.message : e));
      setError(e.message ? e.message : e);
    }
  };
  const submitInline = async (value: string) => {
    try {

      const params = prepareParameters(value);
      await submitDeploy({ ...partialDeployContent, params });
      // dispatch(signersBalance(await provider!.getBalance(signer.evmAddress) as any));
    } catch (e: any) {
      setError(e.message ? e.message : e);// dispatch(compiledContractError(e.message ? e.message : e));
    }
  };

  return (
    <Function
      name="Deploy"
      error={error.length>0}
      isReturn={true}
      text={error}
      parameters={constructorAbi ? parameters : []}
      submitInline={submitInline}
      submitCollapse={submitCollapse}
    />
  );
};

export default ContractDeploy;

