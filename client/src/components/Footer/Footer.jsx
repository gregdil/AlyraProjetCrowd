import React, {Component}  from 'react'
import {useNavigate} from 'react-router-dom'
import './Footer.css';
import {getConnectedNetwork} from '../utils'

class Footer extends Component {

    render(){
        return(
            <div className='footer mt-4 fixed-bottom'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-9'>
                            <ul>           
                                <li>Address of Staking contract is: '{this.props.state.contractAddress}' on network {getConnectedNetwork(this.props.state.connectedNetwork)}.</li>
                                <li>Address of the staking token is: '{this.props.state.contractProperties.tokenAddress}' on network {getConnectedNetwork(this.props.state.connectedNetwork)}</li>
                                <li>Address of the contract owner is: '{ this.props.state.contractProperties._contractOwner}'.</li>
                            </ul>
                        </div>
                        <div className='col-3'>
                          <button onClick={() => this.props.navigate('/contract')}>Administration</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}


function FooterWithNavigate(props) {
    let navigate = useNavigate();
    return <Footer {...props} navigate={navigate} />
}

export default FooterWithNavigate;
