import { Contract } from "ethers";
import { Signer } from "@reef-chain/evm-provider";
import { FunctionDescription } from "@remixproject/plugin-api";

export interface ContractHolder {
  name: string;
  contract: Contract;
}

export interface ContractAttributeState {
  text: string;
  error: boolean;
  abi: FunctionDescription;
}

export const contractAttributeDefaultState = (
  abi: FunctionDescription
): ContractAttributeState => ({
  abi,
  text: "",
  error: false,
});

export interface RemixSigner {
  balance: BigNumber;
  address: string;
  evmAddress: string;
  isEvmClaimed: boolean;
  name: string;
  genesisHash?: string | null | undefined;
  signer: Signer;
}

export interface ContractAttribute {
  name: string;
  type: string;
  value: string;
}

