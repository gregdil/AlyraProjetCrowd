import React, {Component}  from 'react'
import {useNavigate} from 'react-router-dom'
import Address from './Address/Address'
import FooterWithNavigate from './Footer/Footer'
import PoolInformations from './Pool/PoolInformations'
import Transactions from './Transactions/Transactions'

import {connectWallet, getContractProperties, getUserProperties, getUserTransactions } from './utils'

/**
 * Component to get an overview of the staking contract state
 */
class StakingOverview extends Component{
    
    /**
     * Sets the initial state
     * @param {*} props Should contain the contract ABI, address and web provider 
     */
    constructor(props){
        super(props)
        this.state = {
            connectedWallet: null,
            connectedNetwork: null,
            contract: null,
            contractAddress: null,
            latestPrice: 0,
            contractProperties: {
                balance: 0,
                _contractOwner: 0,
                baseInterest: 0,
                cooldown: 0,
                totalStake: 0,
                minimumReward: 0,
                annualRewardRate: 0,
                stakersInPool: 0
            },
            userProperties: {
                stakingBalance: 0,
                stakingBalanceUsd: 0,
                startDate: 0,
                newStake: 0,
                rewardsToClaim: 0,
                totalRewards: 0,
                firstTimeDeposit: 0,
                allTimeHarvest: 0
            },
            transactionsListing: []
        }
    }
    
    async componentDidMount() {
    
        const { contract, accounts, chainlinkinstance } = this.props.state;

        // Update ETH/USD
        let latestPrice = await chainlinkinstance.methods.getLatestPrice().call();
        latestPrice = latestPrice / 100000000;
      
        let state = this.state
        state.contract = contract;
        state.latestPrice = latestPrice;
        state.connectedWallet = accounts[0];
        state = await connectWallet(state);
        state = await getContractProperties(state);
        state = await getUserTransactions(state);
        state = await getUserProperties(state);
        this.setState(state);
    }

    // Staking d'Eth
    stake = async () => {
    
        const { contract, accounts, chainlinkinstance  } = this.props.state;

        let valeur = document.getElementById("newStake").value;
        valeur = 1000000000000000000 * valeur;
        await contract.methods.stake().send({from: accounts[0], value: valeur});

        // On vide le champs de saisie
        document.getElementById("newStake").value = ''; 
        
        // Update ETH/USD
        let latestPrice = await chainlinkinstance.methods.getLatestPrice().call();
        latestPrice = latestPrice / 100000000;

        let state = this.state
        state.latestPrice = latestPrice;
        state = await getUserTransactions(state);
        state = await getUserProperties(state);
        state = await getContractProperties(state);
        this.setState(state);
    }

    // Unstaking d'Eth
    unstake = async () => {

        const { contract, accounts, chainlinkinstance } = this.props.state;

        await contract.methods.unstake().send({from: accounts[0]});

        // Update ETH/USD
        let latestPrice = await chainlinkinstance.methods.getLatestPrice().call();
        latestPrice = latestPrice / 100000000;

        let state = this.state
        state.latestPrice = latestPrice;
        state = await getUserTransactions(state);
        state = await getUserProperties(state);
        state = await getContractProperties(state);
        this.setState(state);
    }

    // Unstaking d'Eth
    harvestReward = async () => {
    
        const { contract, accounts, chainlinkinstance } = this.props.state;

        await contract.methods.harvestReward().send({from: accounts[0]});

        // Update ETH/USD
        let latestPrice = await chainlinkinstance.methods.getLatestPrice().call();
        latestPrice = latestPrice / 100000000;

        let state = this.state
        state.latestPrice = latestPrice;
        state = await getUserTransactions(state);
        state = await getUserProperties(state);
        state = await getContractProperties(state);
        this.setState(state);
    }  

    render() {
        let state = this.state
        return (
            <div>
                <Address addrr={state.connectedWallet} /> 
                <div className='container'>

                    <div className='row'>

                        <div className='col-12 mt-5 mb-4'>
                            <p className="text-center">
                                <input type="text" id="newStake" className="col-6" placeholder="Amount to stake" /><button id="stakeButton" className='btn btn-secondary' onClick={this.stake}>Stake</button>
                            </p>
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-12'>
                            <h2 className="top-card-title">Your staking</h2>
                            <div className="card">
                                <div className="card-body">
                                    <div className='row'>
                                        <div className='col-3'>
                                            <h3>Total amount stacked</h3>
                                            <p className="amount"><span className="amount">{state.userProperties.stakingBalance}</span><span className="currency"> Eth</span></p>
                                            <p>{state.userProperties.stakingBalanceUsd } USD</p>
                                        </div>

                                        <div className='col'>
                                            <h3>Rewards to be claimed</h3>
                                            <p className="amount"><span className="amount">{state.userProperties.rewardsToClaim}</span><span className="currency"> Dev</span></p>
                                        </div>
                                        <div className='col'>
                                            <h3>All time harvest</h3>
                                            <p className="amount"><span className="amount">{state.userProperties.allTimeHarvest}</span><span className="currency"> Dev</span></p>
                                        </div>
                                    </div>

                                    <div className='row mt-4'>
                                        <div className='col-6'>
                                            <p>Date of first deposit: {state.userProperties.firstTimeDeposit } </p>
                                        </div>
                                        <div className='col-6 text-end'>
                                            {state.contractProperties.minimumReward}
                                            <button id="harvestRewardButton" className='btn btn-secondary btn-action m-2' onClick={this.harvestReward}>harvest Reward</button>
                                            <button id="unstakeButton" className='btn btn-secondary btn-action m-2' onClick={this.unstake}>Unstake</button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        
                    </div>

                    <PoolInformations informations={state.contractProperties} />
                    <Transactions transactions={this.state.transactionsListing} />
                </div>

                <FooterWithNavigate state={state} /> 
            </div>
        )
    }
    

}

function StakingOverviewWithNavigate(props) {
    let navigate = useNavigate();
    return <StakingOverview {...props} navigate={navigate} />
}

export default StakingOverviewWithNavigate
