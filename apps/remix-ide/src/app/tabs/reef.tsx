import { ViewPlugin } from '@remixproject/engine-web';
import * as packageJson from '../../../../../package.json';
import React, { useEffect, useState } from 'react';
import { hooks } from "@reef-chain/react-lib";
import { network as nw } from "@reef-chain/util-lib";
import { Constructor } from "./reef/Constructor";

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

function ReefTab({ plugin }: { plugin: ReefPlugin }) {
  const reefInit = hooks.useInitReefState("Reef Remix Plugin", {
    network: nw.AVAILABLE_NETWORKS.mainnet
  });

  const [contracts, setContracts] = useState<any>({});

  useEffect(()=>{
    const initPlugin = async()=>{
      try {
        const result = await plugin.call('solidity', 'getCompilationResult');
        setContracts(result.data?result.data.contracts:{});
      } catch (err) {
        console.error("[REEF PLUGIN] Failed to fetch compiled contracts:", err);
      }
    }

    plugin.on("solidity","compilationFinished",initPlugin);
  },[plugin])

  return (
    <div id="reefTab" style={{ padding: '1rem' }}>
      <Constructor signers={reefInit.signers ?? []} contracts={contracts} />
    </div> 
  );
}
