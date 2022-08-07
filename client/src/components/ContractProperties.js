import React, {Component}  from 'react'
import {useNavigate} from 'react-router-dom'
import Web3 from 'web3'
import Address from './Address/Address'
import {connectWallet, getConnectedNetwork, getContractProperties} from './utils'

/**
 * Component to update stake properties in the contract
 */
class ContractProperties extends Component{
    constructor(props){
        super(props)
        this.state = {
            connectedWallet: null,
            connectedNetwork: null,
            web3: null,
            contract: null,
            web3ReadOnly: null,
            contractReadOnly: null,
            contractProperties: {
                balance: 0,
                _contractOwner: 0,
                baseInterest: 0,
                extraInterest: 0,
                interestDecimals: 0,
                interestDecimalsExp: 0,
                interestPeriod: 0,
                cooldown: 0,
                totalStake: 0,
                maxWeight: 0
            }
        }

    }
    
    async componentDidMount(){

        const { contract,accounts, contractOwnerAddresse } = this.props.state;

        console.log('Contract : componentDidMount accounts : ' + accounts);
        console.log('Contract : componentDidMount contractOwnerAddresse : ' + contractOwnerAddresse);

/////        console.log('Contract : componentDidMount contractAddress ' + this.props.contractAddress); 
     //   console.log('Contract : componentDidMount abiContract ' + this.props.abiContract); 
        /*
        let state = this.state

        // Get read version and write version (connected via wallet) of web3
        
        state.web3ReadOnly = new Web3(this.props.web3Provider);
        state.contractReadOnly = new state.web3ReadOnly.eth.Contract(this.props.abiContract, this.props.contractAddress);
        
        // First we need to check if a Web3 browser extension was found
        if (!window.ethereum) {
            alert("Web3 wallet not found");
        } else {
            state.web3 = new Web3(window.ethereum);
            state.contract = new state.web3.eth.Contract(this.props.abiContract, this.props.contractAddress);
            state = await connectWallet(state);

        console.log('Contract : componentDidMount state.connectedWallet ' + state.connectedWallet); 
        console.log('Contract : componentDidMount state.contract.addrr ' + state.contract.addrr); 

        //console.log('Contract : componentDidMount state ' + state); 
            state = await getContractProperties(state)
            console.log('Contract : componentDidMount state.contractProperties._contractOwner ' + state.contractProperties._contractOwner); 
           // state.contractProperties.interestDecimalsExp = Math.log10(state.contractProperties.interestDecimals)
        }

        console.log('Contract : componentDidMount connectWallet ' + state.connectedWallet); 
        this.setState(state)
        */
    }

    // Mise en pause de la Pool
    pause = async () => {
        const { contract, accounts } = this.props.state;
        await contract.methods.pausedPool().send({from: accounts[0]});
    }

    // Activation de la Pool
    activate = async () => {
        const { contract, accounts } = this.props.state;
        await contract.methods.activePool().send({from: accounts[0]});
    }

    // Close de la Pool
    close = async () => {
        const { contract, accounts } = this.props.state;
        await contract.methods.closedPool().send({from: accounts[0]});
    }

    // Unstake complet de la Pool
    unstakeAll = async () => {
        const { contract, accounts } = this.props.state;
        await contract.methods.unstakeAll().send({from: accounts[0]});
    }


    render(){
        let state = this.props.state;

        if (state.isAdmin === true) {

            if( state.currentStep === '0' ){
                return(
           
                    <div className='container'>
                        <div className='row'>
                            <div className='col'>
                                <Address addrr={state.accounts} />
                                <button className='btn btn-secondary btn-action m-2' onClick={() => this.props.navigate('/')}>Back to overview</button>
                                <h1>Pool is Active</h1>
                            </div>
                        </div>
                        <div className='row mt-4'>
                            <div className='col-12 text-end'>
                                <button id="pauseButton" className='btn btn-secondary btn-action m-2' onClick={this.pause}>Pause</button>
                                <button id="closeButton" className='btn btn-secondary btn-action m-2' onClick={this.close}>Close</button>
                            </div>
                        </div>
                    </div>
                )  
            }

            if( state.currentStep === '1' ){
            
                return(
            
                    <div className='container'>
                        <div className='row'>
                            <div className='col'>
                                <Address addrr={state.accounts} />
                                <button className='btn btn-secondary btn-action m-2' onClick={() => this.props.navigate('/')}>Back to overview</button>
                                <h1>
                                        Pool is Paused
                                        {state.currentStep}
                                    </h1>
                                <div className='Title'>
                                    Update global parameters
                                    {state.currentStep}
                                </div>
                                <div>
                                Update the global parameters as contract owner. The address of the contract owner able to update the contract state is: '{state.contractOwnerAddresse}'.
                                </div>
        
                            </div>
                        </div>

                        <div className='row mt-4'>
                                <div className='col-12 text-end'>
                                    <button id="pauseButton" className='btn btn-secondary btn-action m-2' onClick={this.activate}>Active</button>
                                    <button id="closeButton" className='btn btn-secondary btn-action m-2' onClick={this.close}>Close</button>
                                </div>
                            </div>
                    </div>
                )    
            }   
            
            
            if( state.currentStep === '2' ){
            
                return(
            
                    <div className='container'>
                        <div className='row'>
                            <div className='col-12'>
                                <Address addrr={state.accounts} />
                                <button  className='btn btn-secondary btn-action m-2' onClick={() => this.props.navigate('/')}>Back to overview</button>
                                <h1>Pool is Closed</h1>
                                <div>
                                Update the global parameters as contract owner. The address of the contract owner able to update the contract state is: '{state.contractOwnerAddresse}'.
                                </div>
                            </div>
                        </div>

                        <div className='row mt-4'>
                            <div className='col-12 text-end'>
                                <button id="pauseButton" className='btn btn-secondary btn-action m-2' onClick={this.unstakeAll}>Unstake All</button>
                                <button id="pauseButton" className='btn btn-secondary btn-action m-2' onClick={this.activate}>Active</button>
                                <button id="pauseButton" className='btn btn-secondary btn-action m-2' onClick={this.pause}>Pause</button>
                            </div>
                        </div>
                    </div>
                )    
            }   

        } else {
            return (                 
                
                <div className='container'>
                    <div className='row'>
                        <div className='col-12'>

                        <Address addrr={state.accounts} />
                            You are not connected with the owner address! Change to the owner address in your wallet to use this page
                        </div>
                    </div>
                </div>
            )
        }
    }
        
}

function ContractPropertiesWithNavigate(props) {
    let navigate = useNavigate();
    return <ContractProperties {...props} navigate={navigate} />
}

export default ContractPropertiesWithNavigate
