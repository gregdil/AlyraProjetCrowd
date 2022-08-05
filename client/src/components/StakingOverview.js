import React, {Component}  from 'react'
import {useNavigate} from 'react-router-dom'
import Address from './Address/Address'

import {connectWallet, getConnectedNetwork, getContractProperties, getUserProperties} from './utils'

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
            web3: null,
            contract: null,
            web3ReadOnly: null,
            contractReadOnly: null,
            tokenReadOnly: null,
            contractProperties: {
                balance: 0,
                _contractOwner: 0,
                baseInterest: 0,
                extraInterest: 0,
                interestDecimals: 0,
                interestPeriod: 0,
                cooldown: 0,
                totalStake: 0,
                maxWeight: 0,
                minimumReward: 0,
                annualRewardRate: 0
            },
            userProperties: {
                stakingBalance: 0,
                weight: 0,
                interestDate: 0,
                startDate: 0,
                newWeigth: 0,
                newStake: 0,
                rewardsToClaim: 0,
                totalRewards: 0
            },
            formProperties: {
                stakeInstantly: false,
                increaseWeightInstantly: false,
                signature: '',
                newStake: '',
                newWeight: '',
                withdrawAmount: '',
                withdrawWhenClaiming: false
            }
        }

        this.handleChange = this.handleChange.bind(this);
        //this.submitChange = this.submitChange.bind(this);
    }
    
    async componentDidMount() {
    
        const { contract, accounts } = this.props.state;
        let stakedAmount = await contract.methods.getStakedAmount(accounts[0]).call();
        stakedAmount = stakedAmount / 1000000000000000000;
        console.log('stakedAmount ' + stakedAmount);

        let lastClaim = await contract.methods.getlastDepositOrClaim(accounts[0]).call();
        console.log('lastClaim ' + lastClaim);
        
        var date = new Date(lastClaim * 1000);
        var formattedDate = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
        console.log(formattedDate);

        let rewardsToClaim = await contract.methods.getNextRewards(accounts[0]).call();
        rewardsToClaim = rewardsToClaim / 1000000000000000000;
        //rewardsToClaim = rewardsToClaim.toFixed(12);
        console.log('rewardsToClaim ' + rewardsToClaim);

        let totalRewards = await contract.methods.getTotalRewards(accounts[0]).call();
        totalRewards = totalRewards / 1000000000000000000;
        totalRewards = totalRewards.toFixed(7);
        console.log('totalRewards ' + totalRewards);

       
        let state = this.state
        state.contract = contract;

        state = await connectWallet(state);
        state = await getContractProperties(state);

        state.connectedWallet = accounts[0];
        state.userProperties.stakingBalance = stakedAmount;
        state.userProperties.lastClaim = formattedDate;
        state.userProperties.rewardsToClaim = rewardsToClaim;
        state.userProperties.totalRewards = totalRewards;
        
        //state.contractProperties.annualRewardRate = annualRewardRate;
        //state.contractProperties.cooldown = cooldown;
        //state.contractProperties.annualRewminimumRewardardRate = minimumReward;

        //state.contractProperties.totalStake = poolBalance;

        state.connectedWallet = accounts[0];

        this.setState(state);
    }

    handleChange(event) {
        let state = this.state
        let name = event.target.name
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        console.log(name, value)
        state.formProperties[name] = value
        this.setState(state);
    }

      // Staking d'Eth
      stake = async () => {
        console.log('stake');
        const { contract, accounts } = this.props.state;

        console.log('stake  accounts ' + accounts);
        let valeur = document.getElementById("newStake").value;
        valeur = 1000000000000000000 * valeur;
        console.log('stake  valeur ' + valeur);
        await contract.methods.stake().send({from: accounts[0], value: valeur});

        // On vide le champs de saisie
        document.getElementById("newStake").value = ''; 

        let stakedAmount = await contract.methods.getStakedAmount(accounts[0]).call();
        stakedAmount = stakedAmount / 1000000000000000000;
        console.log('stakedAmount ' + stakedAmount);

        let lastClaim = await contract.methods.getlastDepositOrClaim(accounts[0]).call();
        console.log('lastClaim ' + lastClaim);

        let rewardsToClaim = await contract.methods.getRewards(accounts[0]).call();
        rewardsToClaim = rewardsToClaim / 1000000000000000000;
        console.log('rewardsToClaim ' + rewardsToClaim);
        
//        let poolBalance = await contract.methods.poolBalance().call();
  //      poolBalance = poolBalance / 1000000000000000000;
    //    console.log('poolBalance ' + poolBalance);
        
        let state = this.state
        
        state.userProperties.stakingBalance = stakedAmount;
        state.userProperties.lastClaim = lastClaim;
        state.userProperties.rewardsToClaim = rewardsToClaim;
        state.connectedWallet = accounts[0];
        //state.contractProperties.totalStake = poolBalance;

        state = await getContractProperties(state);


        this.setState(state);
      }

       // Unstaking d'Eth
       unstake = async () => {
        console.log('unstake');
        const { contract, accounts } = this.props.state;

        console.log('stake  accounts ' + accounts);
        await contract.methods.unstake().send({from: accounts[0]});
        let stakedAmount = await contract.methods.getStakedAmount(accounts[0]).call();
        stakedAmount = stakedAmount / 1000000000000000000;
        console.log('stakedAmount ' + stakedAmount);

        let lastClaim = await contract.methods.getlastDepositOrClaim(accounts[0]).call();
        console.log('lastClaim ' + lastClaim);

        let rewardsToClaim = await contract.methods.getRewards(accounts[0]).call();
        rewardsToClaim = rewardsToClaim / 1000000000000000000;
        console.log('rewardsToClaim ' + rewardsToClaim);

        let state = this.state
        
        state.userProperties.stakingBalance = stakedAmount;
        state.userProperties.lastClaim = lastClaim;
        state.userProperties.rewardsToClaim = rewardsToClaim;
        state.connectedWallet = accounts[0];

        this.setState(state);
       }


       // Unstaking d'Eth
       harvestReward = async () => {
        console.log('harvestReward');
        const { contract, accounts } = this.props.state;

        console.log('stake  accounts ' + accounts);
        await contract.methods.harvestReward().send({from: accounts[0]});

        let stakedAmount = await contract.methods.getStakedAmount(accounts[0]).call();
        stakedAmount = stakedAmount / 1000000000000000000;
        console.log('stakedAmount ' + stakedAmount);

        let lastClaim = await contract.methods.getlastDepositOrClaim(accounts[0]).call();
        console.log('lastClaim ' + lastClaim);

        let rewardsToClaim = await contract.methods.getRewards(accounts[0]).call();
        rewardsToClaim = rewardsToClaim / 1000000000000000000;
        console.log('rewardsToClaim ' + rewardsToClaim);

        let state = this.state
        
        state.userProperties.stakingBalance = stakedAmount;
        state.userProperties.lastClaim = lastClaim;
        state.userProperties.rewardsToClaim = rewardsToClaim;
        state.connectedWallet = accounts[0];

        this.setState(state);
       }

       

    render() {
        let state = this.state
        return (
                       
            <div className='container'>

<Address addrr={state.connectedWallet} /> 
                <div className='row'>

                    <div className='col-12'>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Stake funds</h5>
                                <p className="card-text">Add funds to your staking.</p>
                                <input type="text" id="newStake" /><button id="stakeButton" className='btn btn-secondary mb-3' onClick={this.stake}>Stake</button>


                            </div>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-4'>
                        <div className="card mt-5">
                            <div className="card-body">
                                <h5 className="card-title">Your staking</h5>
                                <p><span className="amount">{state.userProperties.stakingBalance}</span><span className="currency"> Eth</span></p>
                                <p><button id="stakeButton" className='btn btn-secondary mb-3' onClick={this.unstake}>Retrait</button></p>
                            </div>
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className="card mt-5">
                            <div className="card-body">
                                <h5 className="card-title">Total des Récompenses</h5>
                                <p><span className="amount">{state.userProperties.totalRewards}</span><span className="currency"> Eth</span></p>
                                <p>Date of last reward : {state.userProperties.lastClaim}</p>
                            </div>
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className="card mt-5">
                            <div className="card-body">
                                <h5 className="card-title">Rewards to be claimed:</h5>
                                <p><span className="amount">{state.userProperties.rewardsToClaim}</span><span className="currency">DEvToken</span></p>
                             

                                <button id="harvestRewardButton" className='btn btn-secondary mb-3' onClick={this.harvestReward}>harvest Reward</button>

                            </div>
                        </div>
                    </div>

                </div>

                <div className='row'>
                    <div className='col-6'>
                        <div className="card mt-5">
                            <div className="card-body">
                                <h5 className="card-title">Stake Pool information</h5>
                                <p><span className="amount">{state.contractProperties.totalStake}</span><span className="currency"> Eth</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-12'>

                    <div className="card mt-5">
                    <div className="card-body">
                                <h5 className="card-title">Contract information</h5>
                        <div className='Title'>
                            Envoy staking contract overview
                        </div>
                        <div className='Subtitle'>
                            Info
                        </div>
                        <div>
                            This contract will be used to reward DEvToken stakers with staking rewards.
                            <ul>
                                <li>Testing contract with address '{this.props.state.contractOwnerAddresse}' on network {getConnectedNetwork(state.connectedNetwork)}</li>
                                <li>The contract address of the staking token is '{this.props.tokenAddress}' on network {getConnectedNetwork(state.connectedNetwork)}</li>
                            </ul>

                        </div>
                        <div className='Subtitle'>
                            Contract properties:
                        </div>
                        <div>
                            <ul>
                                <li>The address of the contract owner able to update the contract state is: '{this.props.state.contractOwnerAddresse}'.</li>
                                <li>BaseInterest (every staker gets this interest): {state.contractProperties.annualRewardRate}%</li>
                                <li>ExtraInterest (linear increase with the level of the staker): {state.contractProperties.extraInterest/state.contractProperties.interestDecimals*100}%</li>
                                <li>Period you have to wait before rewards are earned: {state.contractProperties.cooldown} s</li>
                                <li>Cooldown period before withdrawl is possible: {state.contractProperties.cooldown/86400} days</li>
                                <li>Total staked funds in the contract: {state.contractProperties.totalStake}</li>
                            </ul>
                            <button onClick={() => this.props.navigate('/contract')}>Update properties as owner</button>
                        </div>
                        
                        </div>       
                        </div>      
                    </div>  
                </div>  
            </div>
        )
    }
    

}

function StakingOverviewWithNavigate(props) {
    let navigate = useNavigate();
    return <StakingOverview {...props} navigate={navigate} />
}

export default StakingOverviewWithNavigate