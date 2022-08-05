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
        this.handleChange = this.handleChange.bind(this);
        this.submitChange = this.submitChange.bind(this);

    }
    
    handleChange(event) {
        let state = this.state
        let name = event.target.name
        let value = event.target.value
        console.log(value)
        if(name === 'cooldown' || name === 'interestPeriod'){
            value = parseFloat(value)*86400 || ''
        }
        console.log(value)
        
        
        state.contractProperties[name] = value
        this.setState(state);
    }

    async submitChange(event){
        event.preventDefault()
        console.log(event.target[0], event.target.length)
        console.log(event.target.name)
        let state = this.state
        let name = event.target[0].name
        let value = event.target[0].value
        if(name === 'cooldown' || name === 'interestPeriod'){
            value = value*86400
        }
        try{
            let receipt = await state.contract.methods[event.target.name](value).send({from: state.connectedWallet})
            await receipt
            this.setState(state)
            alert('Updated field!');
            //this.forceUpdate()
        }
        catch (error){
            await error
            alert(error)
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

    render(){
        let state = this.props.state;
        if(state.contractOwnerAddresse !== state.accounts[0]){
            alert('You are not connected with the owner address! Change to the owner address in your wallet to use this page.')
        }
        return(
           
            <div className='container'>
                <div className='row'>
                    <div className='col'>
                        <Address addrr={state.accounts} />
                        <button onClick={() => this.props.navigate('/main')}>Back to overview</button>
                        <div className='Title'>
                            Update global parameters
                        </div>
                        <div>
                        Update the global parameters as contract owner. The address of the contract owner able to update the contract state is: '{state.contractOwnerAddresse}'.
                        </div>

                    </div>
                </div>
            </div>
    )}
}

function ContractPropertiesWithNavigate(props) {
    let navigate = useNavigate();
    return <ContractProperties {...props} navigate={navigate} />
}

export default ContractPropertiesWithNavigate
