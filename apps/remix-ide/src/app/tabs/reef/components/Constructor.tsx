import React, { useEffect, useState } from "react";
import { Contract, formatEther } from "ethers";
import { StateType } from "../store/reducers";
import Deploy from "./Deploy";
import DeployedContracts from "./DeployedContracts";
import Copy from "./common/Copy";
import { signersSelect } from "../store/actions/signers";
import { ContractHolder, RemixSigner } from "../store/localState";
import { CompiledContractReducer } from "../store/reducers/compiledContracts";
import {
  contractAddMultiple,
  contractRemoveAll,
} from "../store/actions/contracts";
// @ts-ignore
import { findSigner } from "../utils";

const bigNumberToString = (num: BigNumber): string => {
  // const value = formatEther(num);
  // const point = value.indexOf(".");
  // return value.slice(0, point + 3);
  return "";
};

const updateContracts = (
  signer: RemixSigner,
  oldContracts: ContractHolder[],
  compiledContracts: CompiledContractReducer
): ContractHolder[] =>
  oldContracts.map(({ name, contract }) => ({
    name,
    contract: new Contract(
      contract.address as any,
      compiledContracts.contracts[name].payload.abi,
      signer.signer as any
    ),
  }));

export const Constructor = ({signers,contracts,compiledContracts,selectedSigner,reefState}:{signers:any[],contracts:any,compiledContracts:any,selectedSigner:any,reefState:any}) => {
  const [selectedContract, setSelectedContract] = useState("");

  const account =selectedSigner? selectedSigner.address:"";
  const evmAddress = selectedSigner? selectedSigner.evmAddress:"";
  const isClaimed = selectedSigner ?  selectedSigner.isEvmClaimed:"";

  const setAccount = (value: string) => {
    // const signerIndex = findSigner(signers, value);
    reefState.setSelectedAddress(value);
    // dispatch(signersSelect(signerIndex));
    // const newContracts = updateContracts(
    //   signers[signerIndex],
    //   oldContracts as any,
    //   compiledContracts
    // );
    // dispatch(contractRemoveAll());
    // dispatch(contractAddMultiple(newContracts));
  };

  useEffect(() => {
    const names = Object.keys(contracts);
    if (names.length > 0) {
      setSelectedContract(names[0]);
    }
  }, [contracts]);

  const signerOptions = signers.map(({ name, address, balance }, index) => (
    <option value={address} key={index}>
      {name} - ({bigNumberToString(balance as any)} REEF)
    </option>
  ));

  const contractOptions = Object.keys(contracts).map((contract, index) => (
    <option value={contract} key={index}>
      {contract}
    </option>
  ));

  return (
    <div className="m-3">
      <div>
        <label>Accounts:</label>

        <div className="d-flex flex-row align-items-center">
          <select
            id="accountSelector"
            className="form-control select_3rUxUe custom-select flex-fill mr-1"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
          >
            {signerOptions}
          </select>
          <Copy value={evmAddress} />
        </div>
        {!isClaimed && (
          <a
            href="https://reefswap.com/bind"
            className="text text-decoration-none"
            target="_blank"
          >
            Bind EVM account
          </a>
        )}
      </div>
      <div>
        <label>Compiled contracts:</label>

        <select
          className="form-control select_3rUxUe custom-select"
          value={selectedContract}
          onChange={(event) => setSelectedContract(event.target.value)}
        >
          {contractOptions}
        </select>
      </div>

      {selectedSigner? (
        <>
          <Deploy contractName={selectedContract} contracts={contracts} deploying={false} />
          {/* <DeployedContracts /> */}
        </>
      ) : (
        <div className="text-danger pt-3 text">
          Sign in with one of your wallets under the settings!
        </div>
      )}
    </div>
  );
};
