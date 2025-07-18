import React, { useEffect, useState } from "react";
import {
  ABIParameter,
  FunctionDescription,
} from "@remixproject/plugin-api";
import {
  contractAttributeDefaultState,
  ContractAttributeState,
  ContractHolder,
} from "../../store/localState";
import Function from "../Function/Function";
import { signersBalance } from "../../store/actions/signers";
// @ts-ignore
import { prepareParameters } from "../../utils";

interface ContractBodyProps extends ContractHolder {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  contracts:any[];
  notify:any;
  contract:any;
}

const isLoadingError = (
  field: ContractAttributeState
): ContractAttributeState => ({
  ...field,
  text: "One function is already running. Please wait a bit!",
  error: true,
});

const extractResult = async (
  result: any,
  outputs?: ABIParameter[]
): Promise<string> => {
  if (!outputs || outputs.length === 0) {
    return Promise.resolve("");
  }
  return await result.toString();
};

const createNotification = (name: string, params: string, result: string) =>
  `${name} call ` +
  (params ? `with parameters: ${params} ` : "") +
  "complete!" +
  (result
    ? `
    <br>Result: ${result}`
    : "");

const ContractBody = ({
  name,
  contract,
  isLoading,
  setIsLoading,
  contracts,
  notify
}: ContractBodyProps) => {
  const [state,setState] = useState([]);
  const modifiedContracts = contracts.reduce((acc, { name, contract }) => ({ ...acc, [name]: contract }), {});


  useEffect(() => {
    console.log("contracts[name]===",modifiedContracts);
    const abi = modifiedContracts[name]!.payload.abi.filter(
      (statement) => statement.type === "function"
    )
      .map((statement) => statement as FunctionDescription)
      .map((desc) => contractAttributeDefaultState(desc));
    setState(abi);
  }, []);

  const updateState = (field: ContractAttributeState, index: number) =>
    setState([...state.slice(0, index), field, ...state.slice(index + 1)]);

  const submitCollapse = (index: number) => async (values: string[]) => {
    console.log("here i am anukul");
    const field = state[index];
    if (isLoading) {
      updateState(isLoadingError(field), index);
      return;
    }

    try {
      setIsLoading(true);
      const result = await contract.contract[field.abi.name!](...values);
      const text = await extractResult(result, state[index].abi.outputs);
      notify(createNotification(field.abi.name!, values.join(", "), text));
      updateState({ ...field, text, error: false }, index);
    } catch (e: any) {
      const message = typeof e === "string" ? e : e.message;
      notify(
        `There was an error in ${field.abi.name} call. Error: ${message}`,
        "error"
      );
      updateState({ ...field, text: message, error: true }, index);
    } finally {
      setIsLoading(false);
    }
  };
  const submitInline = (index: number) => async (value: string) => {
    const field = state[index];
    if (isLoading) {
      updateState(isLoadingError(field), index);
      return;
    }

    try {
      const parameters = prepareParameters(value);
      setIsLoading(true);
      const result = await contract.contract[field.abi.name!](...parameters);
      const text = await extractResult(result, state[index].abi.outputs);
      notify(createNotification(field.abi.name!, value, text));
      updateState({ ...field, text, error: false }, index);
    } catch (e: any) {
      const message = typeof e === "string" ? e : e.message;
      notify(
        `There was an error in ${field.abi.name} call. Error: ${message}`,
        "logHtml"
      );
      updateState({ ...field, text: message, error: true }, index);
    } finally {
      setIsLoading(false);
      // const balance = await provider!.getBalance(
      //   signers.signers[signers.index].evmAddress
      // );
      // dispatch(signersBalance(balance as any));
    }
  };

  const attributesView = state.map(({ text, error, abi }, index) => {
    const parameters = abi.inputs ? (abi.inputs as ABIParameter[]) : [];
    const name = (abi.name ? abi.name : "").slice(0, 12);
    return (
      <div className="mt-1" key={index}>
        <Function
          text={text}
          error={error}
          parameters={parameters}
          isReturn={abi.outputs!.length !== 0}
          name={name}
          submitInline={submitInline(index)}
          submitCollapse={submitCollapse(index)}
        />
      </div>
    );
  });

  return <>{attributesView}</>;
};

export default ContractBody;

