/**
     * Connect the Ethereum wallet (e.g. Metamask) to the web application.
     */
 async function connectWallet(state){
    try {
    
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        state.connectedWallet = await accounts[0];
        state.connectedNetwork = await window.ethereum.networkVersion;

        console.log('connectWallet : accounts ' + accounts); 
        console.log('connectWallet : state.connectedWallet ' + state.connectedWallet); 
        console.log('connectWallet : state.connectedNetwork ' + state.connectedNetwork); 
        return state

    } catch (error){
        if (error.code === 4001) {
            alert('User rejected the request') // User rejected request
        }
        console.error(error);
    }
}

/**
 * Mapping to translate network ID into a name
 * @param {*} networkId number of the network ID to connect to
 * @returns the name of the network to connect to
 */
function getConnectedNetwork(networkId){
    if (networkId === '1'){
        return "Ethereum Mainnet";
    } else if (networkId === "4") {
        return "Rinkeby Testnet";
    } else if (networkId === "5") {
        return "Goerli Testnet";
    } else {
        return "Unknown network - probably local";
    }
}

/**
 * Load the smart contract properties and put them into the state under 'contractProperties'
 */
async function getContractProperties(state){

    console.log('getContractProperties : state.contract ' + state.contract); 
    state.contractProperties._contractOwner = await state.contract.methods.owner().call();

    console.log('getContractProperties : state.contractProperties._contractOwner ' + state.contractProperties._contractOwner); 

    let annualRewardRate = await  state.contract.methods.annualRewardRate().call();
    console.log('getContractProperties : annualRewardRate ' + annualRewardRate);

    let cooldown = await  state.contract.methods.cooldown().call();
    console.log('getContractProperties : cooldown ' + cooldown);

    let minimumReward = await  state.contract.methods.minimumReward().call();
    console.log('getContractProperties : minimumReward ' + minimumReward);

    let poolBalance = await  state.contract.methods.poolBalance().call();
    poolBalance = poolBalance / 1000000000000000000;
    console.log('getContractProperties : poolBalance ' + poolBalance);
    
    state.contractProperties.annualRewardRate = annualRewardRate;
    state.contractProperties.cooldown = cooldown;
    state.contractProperties.annualRewminimumRewardardRate = minimumReward;

    state.contractProperties.totalStake = poolBalance;

    //state.contractProperties.interestDecimals = await state.contractReadOnly.methods.interestDecimals().call()
    //state.contractProperties.baseInterest = await state.contractReadOnly.methods.baseInterest().call()
    //state.contractProperties.extraInterest = await state.contractReadOnly.methods.extraInterest().call()
    //state.contractProperties.cooldown = await state.contractReadOnly.methods.cooldown().call()
    //state.contractProperties.interestPeriod = await state.contractReadOnly.methods.interestPeriod().call()
    //state.contractProperties.totalStake = await state.contractReadOnly.methods.totalStake().call()
    //state.contractProperties.maxWeight = await state.contractReadOnly.methods.maxWeight().call()
    return state
}

async function getUserProperties(sender, state){
    state.userProperties = await state.contractReadOnly.methods.stakeholders(sender).call()
    state.userProperties.rewardsToClaim = (await state.contractReadOnly.methods.calculateRewards(sender).call())[0]
    return state
}

export {connectWallet, getConnectedNetwork, getContractProperties, getUserProperties}