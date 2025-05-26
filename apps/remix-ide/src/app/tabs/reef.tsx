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
  const [sources, setSources] = useState<any>({});

  const notify=(message:string)=>{
    plugin.call('terminal', 'log', {
      type: 'info',
      value: message
    });
  }

  useEffect(() => {
    const initPlugin = async (_: any, source: any, languageVersion: string, data: any) => {
      try {
        const [evmVersion, version, optimization, runs] = languageVersion.split(";");
        // const [, compilerVersion] = version.split("-");
  
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
        !loading && !error && signers &&  <Constructor signers={signers} selectedSigner={selectedReefSigner} compiledContracts={contracts} contracts={contracts} reefState={reefState} sources={sources} notify={notify}/>
      }
      {error && !loading && <div className="text text-danger m-3">{error.message}</div>}
    
    </div> 
  );
}
