/**
     * Connect the Ethereum wallet (e.g. Metamask) to the web application.
     */
 async function connectWallet(state){
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        state.connectedWallet = await accounts[0];
        state.connectedNetwork = await window.ethereum.networkVersion;
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
    } else if (networkId === "42") {
        return "Kovan Testnet";
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

    state.contractAddress = state.contract.options.address;

    console.log('getContractProperties : contractAddress ' + state.contractAddress);

    console.log('getContractProperties : state.contractProperties._contractOwner ' + state.contractProperties._contractOwner); 

    let annualRewardRate = await  state.contract.methods.annualRewardRate().call();
    console.log('getContractProperties : annualRewardRate ' + annualRewardRate);

    let cooldown = await state.contract.methods.cooldown().call();
    console.log('getContractProperties : cooldown ' + cooldown);

    let minimumReward = await  state.contract.methods.minimumReward().call();
    console.log('getContractProperties : minimumReward ' + minimumReward);

    let poolBalance = await  state.contract.methods.poolBalance().call();
    poolBalance = poolBalance / 1000000000000000000;
    console.log('getContractProperties : poolBalance ' + poolBalance);
    
    let stakersInPool = await  state.contract.methods.getStakersInPool().call();
    console.log('getContractProperties : stakersInPool ' + stakersInPool);

    let stakingToken = await  state.contract.methods.stakingToken().call();
    console.log('getContractProperties : stakingToken ' + stakingToken);
    
    state.contractProperties.annualRewardRate = annualRewardRate;
    state.contractProperties.cooldown = cooldown;
    state.contractProperties.minimumReward = minimumReward;
    state.contractProperties.totalStake = poolBalance;
    state.contractProperties.stakersInPool = stakersInPool;
    state.contractProperties.tokenAddress = stakingToken;
   
    return state
}


/**
 * Liste des transactions de l'utilisateur
 * 
 * @param {*} state 
 * @returns 
 */
async function getUserTransactions(state) {

    let options = {
        fromBlock: 0,
        toBlock: 'latest'
      };

    // Recherche de la liste des transactions
    let listStakings = await state.contract.getPastEvents('Transaction', options);   
  
    // Construction du tableau des transactions
    let transactionsListing = [];
    for(let j=0; j < listStakings.length; j++){

        if ( listStakings[j].returnValues.stakerAddress.toLowerCase() === state.connectedWallet.toLowerCase() ) {
            
            var timestamp = new Date(listStakings[j].returnValues.timastamp * 1000);
            var timestampFormatted = ('0' + timestamp.getDate()).slice(-2) + '/' + ('0' + (timestamp.getMonth() + 1)).slice(-2) + '/' + timestamp.getFullYear() + ' ' + ('0' + timestamp.getHours()).slice(-2) + ':' + ('0' + timestamp.getMinutes()).slice(-2);
          
            var amountStacked = listStakings[j].returnValues.amountStacked;
            amountStacked = amountStacked / 1000000000000000000;
            amountStacked = amountStacked.toFixed(6) + ' Eth';
            if ( listStakings[j].returnValues.amountStacked == 0 ) {
                amountStacked = '';
            }

            var rewards = listStakings[j].returnValues.rewards;
            rewards = rewards / 1000000000000000000;
            rewards = rewards.toFixed(12) + ' Dev';
            if ( listStakings[j].returnValues.rewards == 0 ) {
                rewards = '';
            }

            var obj = {
                action: listStakings[j].returnValues.action,
                amountStacked: amountStacked,
                rewards: rewards,
                timestamp: listStakings[j].returnValues.timastamp,
                timestampFormatted: timestampFormatted
            };

            transactionsListing.unshift(obj);
        } 
    }
    state.transactionsListing = transactionsListing;
    return state;
}

/**
 * Update des information du staking de l'utilisateur
 * 
 * @param {*} state 
 * @returns 
 */
async function getUserProperties(state){

    let stakedAmount = await state.contract.methods.getStakedAmount(state.connectedWallet).call();
    stakedAmount = stakedAmount / 1000000000000000000;
  
    let stakedAmountUsd = stakedAmount * state.latestPrice;
    stakedAmountUsd = stakedAmountUsd.toFixed(2);

    let lastClaim = await state.contract.methods.getlastDepositOrClaim(state.connectedWallet).call();
    var date = new Date(lastClaim * 1000);
    var formattedDate = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  
    let rewardsToClaim = await state.contract.methods.getRewards(state.connectedWallet).call();
    rewardsToClaim = rewardsToClaim / 1000000000000000000;
    rewardsToClaim = rewardsToClaim.toFixed(12);
   
    let firstTimeDeposit = await state.contract.methods.getFirstTimeDeposit(state.connectedWallet).call();
    var dateFirstTimeDeposit = new Date(firstTimeDeposit * 1000);
    var formattedFirstTimeDeposit = ('0' + dateFirstTimeDeposit.getDate()).slice(-2) + '/' + ('0' + (dateFirstTimeDeposit.getMonth() + 1)).slice(-2) + '/' + dateFirstTimeDeposit.getFullYear() + ' ' + ('0' + dateFirstTimeDeposit.getHours()).slice(-2) + ':' + ('0' + dateFirstTimeDeposit.getMinutes()).slice(-2);
  
    let allTimeHarvest = await state.contract.methods.getAllTimeHarvest(state.connectedWallet).call();
    allTimeHarvest = allTimeHarvest / 1000000000000000000;
    allTimeHarvest = allTimeHarvest.toFixed(12);
  
    state.userProperties.stakingBalance = stakedAmount;
    state.userProperties.stakingBalanceUsd = stakedAmountUsd;
    state.userProperties.lastClaim = formattedDate;
    state.userProperties.rewardsToClaim = rewardsToClaim;
    state.userProperties.firstTimeDeposit = formattedFirstTimeDeposit;
    state.userProperties.allTimeHarvest = allTimeHarvest;
    
    return state
}

export {connectWallet, getConnectedNetwork, getContractProperties, getUserTransactions, getUserProperties }