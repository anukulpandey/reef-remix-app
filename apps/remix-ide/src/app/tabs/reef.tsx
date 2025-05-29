import { ViewPlugin } from '@remixproject/engine-web';
import * as packageJson from '../../../../../package.json';
import React, { useEffect, useState } from 'react';
import { hooks } from "@reef-chain/react-lib";
import { network as nw } from "@reef-chain/util-lib";
import { Constructor } from "./reef/components/Constructor";
import Loading from './reef/components/common/loading/Loading';
import {NetworkSelect} from "./NetworkSelect";
import "./reef.css";
import { createClient } from '@remixproject/plugin-webview';

const profile = {
  name: 'reef',
  displayName: 'Reef Deploy & Run',
  methods: [],
  events: [],
  icon: 'assets/img/deployAndRun.webp',
  description: 'Deploy and Run Contracts on Reef Chain',
  kind: 'view',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/search_in_fe.html',
  version: packageJson.version,
  maintainedBy: 'ReefChain',
  dependencies: ['compiler']
};

export class ReefPlugin extends ViewPlugin {
  constructor() {
    super(profile);
  }

  render() {
    return <ReefTab plugin={this} />;
  }
}

function ReefTab({ plugin}: { plugin: ReefPlugin }) {
  const reefInit = hooks.useInitReefState("Reef Remix Plugin", {
    network: nw.AVAILABLE_NETWORKS.mainnet
  });

  const {signers,selectedReefSigner,loading,error,reefState,network} = reefInit;

  const [contracts, setContracts] = useState<any>({});
  const [compilerState, setCompilerState] = useState<any>({});
  const [deployedContracts,setDeployedContracts] = useState<any>([]);
  const [sources, setSources] = useState<any>({});

  type NotificationType = 'info' | 'warn'  | 'success' | 'logHtml';

  const notify = (message: string, type: NotificationType = 'logHtml') => {
    plugin.call('terminal', type, {
      value: message
    });
  }
  

  useEffect(() => {
    const initPlugin = async (file, source, languageVersion, data, input, version) => {
      try {
        const compilerState = await plugin.call("solidity","getCompilerState");

        console.log("compilerState===",compilerState);
        setCompilerState(compilerState);
        const parsedContracts = data?.contracts || {};
        setSources(source)
        setContracts(parsedContracts);
  
      } catch (err) {
        console.error("[REEF PLUGIN] Failed to process compiled contract:", err);
      }
    };
  
    plugin.on("solidity", "compilationFinished", initPlugin);
  
    return () => {
      plugin.off("solidity", "compilationFinished");
    };
  }, [plugin]);
  

  console.log({
    loading,
    error,
    signers,
    value:loading && !error && signers})
  return (
    <div id="reefTab" style={{ padding: '1rem' }}>
      {network && <NetworkSelect reefState={reefState} network={network}/>}
      {loading && <Loading/>}
      {
        !loading && !error && signers &&  <Constructor signers={signers} selectedSigner={selectedReefSigner} deployedContracts={deployedContracts} contracts={contracts} reefState={reefState} sources={sources} notify={notify} network={network} setDeployedContracts={setDeployedContracts} compilerState={compilerState}/>
      }
      {error && !loading && <div className="text text-danger m-3">{error.message}</div>}
    
    </div> 
  );
}
