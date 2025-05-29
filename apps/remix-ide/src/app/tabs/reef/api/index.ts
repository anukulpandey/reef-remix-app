import { Dispatch } from "redux";
import { Signer } from "@reef-chain/evm-provider";
import { Contract, ContractFactory } from "ethers";
import { CompiledContract } from "@remixproject/plugin-api";
import { contractAdd } from "../store/actions/contracts";
import { compiledContractDeploying, compiledContractDeployed, compiledContractError } from "../store/actions/compiledContracts";
import { RemixSigner } from "../store/localState";
import { NotifyFun } from "../store/actions/utils";
import axios from "axios";
import { AxiosResponse } from "axios";
import { delay } from "../utils";

const CONTRACT_VERIFICATION_URL = "/api/verificator/submit-verification";
// const verification_test = "http://localhost:3000/api/verificator/submit-verification";

interface BaseContract {
  runs: number;
  source: string;
  target: string;
  license: string;
  optimization: string;
  compilerVersion: string;
}

export interface VerificationContractReq extends BaseContract {
  name: string;
  address: string;
  filename: string;
  arguments: string;
}


export interface ReefContract extends BaseContract {
  filename: string;
  contractName: string;
  payload: CompiledContract;
}

const contractVerificatorApi = axios.create();

const doesContractExist = async (url: string, address: string): Promise<boolean> => 
  axios.get(`${url}/contract/${address}`)
    .then((_) => true)
    .catch((_) => false);

// Complete await cycle is in pattern: 1+2+3+...+steps.
// Execution time = steps*(steps+1) / 2 s; 
// I.E. Steps = 10; Execution time = 55s
const waitUntilContractExists = async (url: string, address: string, steps=20): Promise<void> => {
  let delayLength = 1000;
  for (let i = 0; i < steps; i ++) {
    await delay(delayLength);
    const res = await doesContractExist(url, address);
    if (res) { return; }
    delayLength += 1000;
  }
  throw new Error("Contract was not detected");
}

export const verifyContract = async (deployedContract: Contract, contract: ReefContract, arg: string[], notify: NotifyFun, url?: string,contractName?:string,filename?:string,compilerState?:any): Promise<void> => {
  if (!url) { 
    console.warn("Verification API URL is not set");
    return; 
  }

  notify(`Verifying ${contractName} contract...`);

  console.log("body=== 2",compilerState.lastCompilationResult.source.sources[filename].content);
  try {
    const body: VerificationContractReq = {
      address: deployedContract.target as any,
      arguments: JSON.stringify(arg),
      name: contractName,
      filename: `${filename.split('/')[filename.split('/').length-1]}`,
      target: `${compilerState.evmVersion??'london'}`,
      source: JSON.stringify(Object.fromEntries(Object.entries(compilerState.lastCompilationResult.source.sources).map(([k, v]) => [k.split('/').pop(), (v as any).content]))),
      optimization: `${compilerState.optimize}`,
      compilerVersion: `v${compilerState.currentVersion.replace(/(\+commit\.[a-f0-9]+).*/, '$1')}`,
      license: `${compilerState.lastCompilationResult.source.sources[filename].content.match(/SPDX-License-Identifier:\s*([^\s]+)/i)?.[1] || "UNLICENSED"}`,
      runs: compilerState.runs
    };

    console.log("body===",body);

    await waitUntilContractExists(url, deployedContract.target as any);
    console.log("Contract was detected");
    await contractVerificatorApi.post<VerificationContractReq, AxiosResponse>
      (`${url}${CONTRACT_VERIFICATION_URL}`, body)
    notify(verificationNofitication(contract.contractName, true));
  } catch (err) {
    console.error(err)
    notify(verificationNofitication(contract.contractName, false));
  }
}

export const deploy = async (compiledContract: CompiledContract, params: any[], signer: Signer): Promise<Contract> => {
  return await ContractFactory
  .fromSolidity(compiledContract)
  // @ts-ignore
  .connect(signer)
  .deploy(...params);
}

interface DeployParams {
  params: string[],
  signer: Signer,
  contractName: string,
  reefscanUrl?: string;
  verificationApiUrl?: string;
  contract: ReefContract,
  notify: any,
  setDeploying: any,
  filename:any;
  compilerState:any;
  deployedContracts:any[];
  setDeployedContracts:any;
}

const deployedNotification = (name: string, address: string, url?: string): string =>
  `Contract ${name} deployed successfully at address: ${address}` + (url ? `
    <br>Check the status of the contract at <a href=${url}/contract/${address} target="_blank">Reefscan URL</a>` : '')

const verificationNofitication = (name: string, result: boolean): string => 
  `<br>Contract ${name} was${result ? "" : " not"} verified!`;

export const submitDeploy = async ({params, signer, contractName, reefscanUrl, verificationApiUrl, contract, notify,setDeploying,filename,compilerState,setDeployedContracts,deployedContracts
  // dispatch, notify
}: DeployParams) => {
  try {
    setDeploying(true);// dispatch(compiledContractDeploying());
    notify(`Deploying ${contractName} contract...`);
    const deployParams = params.map((param) => (param === "true" || param === "false" ? param === "true" : param));
    const newContract = await deploy(contract.payload, deployParams, signer);

    notify(deployedNotification(
      contractName,
      newContract.target as any,
      reefscanUrl
    ),"logHtml");

    verifyContract(newContract, contract,  params, notify, verificationApiUrl,contractName,filename,compilerState);
    (newContract as any).payload = contract.payload;
    setDeployedContracts([...deployedContracts,{
      name:contractName,
      contract:newContract
    }]);
     // dispatch(contractAdd(contractName, newContract));
    setDeploying(false) // dispatch(compiledContractDeployed());

  } catch (e: any) {
    console.log(e);
    notify(`Something went wrong... Error: ${e.message}`);
    // dispatch(compiledContractError(typeof e === "string" ? e : e.message));
    // dispatch(compiledContractDeployed());
    setDeploying(false)
  }
}

export const getSigner = (signers: RemixSigner[], address: string): RemixSigner => {
  return signers.find((wallet) => wallet.address === address)!
};