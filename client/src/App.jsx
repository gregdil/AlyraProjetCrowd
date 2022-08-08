import React, { Component } from "react";
import getWeb3 from "./getWeb3";

import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'

import "./App.css";

// The ABI (Application Binary Interface) is the interface of the smart contract
import contractABIJSON from './contracts/Staking.json';
import chainlinkABIJSON from './contracts/Chainlink.json';

import StakingOverviewWithNavigate from './components/StakingOverview';
import ContractPropertiesWithNavigate from './components/ContractProperties';

class App extends Component {

  state = { web3: null, contract: null, isAdmin: false, accounts: null, contractOwnerAddresse: null, chainlinkinstance: null, currentStep: 0};

  componentDidMount = async () => {
      try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = contractABIJSON.networks[networkId];
      const instance = new web3.eth.Contract(
        contractABIJSON.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const chainlinkDeployedNetwork = chainlinkABIJSON.networks[networkId];
      const chainlinkinstance = new web3.eth.Contract(
        chainlinkABIJSON.abi,
        chainlinkDeployedNetwork && chainlinkDeployedNetwork.address,
      );

      let options = {
        fromBlock: 'latest',
        toBlock: 'latest'
      };

      // Subscribe à l'event WorkflowStatusChange pour adapter l'affichage
      instance.events.PoolStatusChange(options)
        .on('data', event => {
          console.log('PoolStatusChange');
          let currentStepFromEvent = event.returnValues.newStatus;

          console.log('PoolStatusChange ' + currentStepFromEvent);
          this.setState({currentStep:currentStepFromEvent});
        }
      );

      // Recherche du WorkflowStatus
      let currentStep = await instance.methods.poolStatus().call();

      // Récupération de l'adresse du propriétaire du contrat
      let contractOwnerAddresse = await instance.methods.owner().call();

      // Vérification si l'on est admin
      let isAdmin = false;
      if ( contractOwnerAddresse.toLowerCase() === accounts[0].toLowerCase() ) {
        isAdmin = true;
        console.log('isAdmin');
      }
           console.log('contractOwnerAddresse ' + contractOwnerAddresse.toLowerCase());
           console.log('accounts[0] ' + accounts[0].toLowerCase());
      // Update des informations du state
      this.setState({ web3, contract: instance, isAdmin, accounts, contractOwnerAddresse, chainlinkinstance, currentStep});

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    
    return (
      <Router>
        <Routes>
          <Route path='/AlyraProjetCrowd' element = { <StakingOverviewWithNavigate state={this.state} />}/>
          <Route path='/contract' element = { <ContractPropertiesWithNavigate state={this.state} />} />
        </Routes>
      </Router>
    )

  }
}

export default App;
