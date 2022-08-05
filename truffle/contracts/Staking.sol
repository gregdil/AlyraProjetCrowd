// SPDX-License-Identifier: MIT

pragma solidity >=0.8.14;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Chainlink.sol";

contract Staking is Ownable, ReentrancyGuard, Chainlink {
    struct Staker {
        uint256 totalStaked; // Total amount staked
        uint256 lastDepositOrClaim; // Date of last deposit or last claim
        uint256 totalRewards; // Total of rewards
        bool exists;
    }

    mapping(address => Staker) public stakers;
    address[] public stakerList;

    uint256 public annualRewardRate; //annual rewards percentage
    uint256 public cooldown; //minimum time between two claims (in seconds)
    uint256 public minimumReward; //minimum reward to claim
    uint256 public poolBalance; //Amount staked on the pool

    ERC20 public stakingToken;

    enum PoolInfo {
        ActivePool,
        PausedPool,
        ClosedPool
    }

    PoolInfo public poolStatus;

    constructor(
        uint256 annualRewardRate_,
        uint256 cooldown_, // (in second)
        uint256 minimumReward_,
        address stakingTokenAddress
    ) {
        annualRewardRate = annualRewardRate_;
        cooldown = cooldown_;
        minimumReward = minimumReward_;
        stakingToken = ERC20(stakingTokenAddress);
    }

    event PoolStatusChange(PoolInfo newStatus);
    event StakerAdded(address stakerAddress, uint256 totalStaked);
    event StakingUpdate(
        address stakerAddress,
        uint256 totalStaked,
        uint256 totalRewards
    );
    event RewardsHarvested(address stakerAddress, uint256 rewardsHarvested);
    event UnstakeCompleted(
        address stakerAddress,
        uint256 rewardsHarvested,
        uint256 amountUnstaked
    );

    // ----------- CALCULATION FUNCTIONS ------------ //

    function rewardPerSecond(address a) public view returns (uint256) {
        return (((stakers[a].totalStaked * annualRewardRate) / 100) / 31536000);
    }

    function rewardDuration(address a) public view returns (uint256) {
        return block.timestamp - stakers[a].lastDepositOrClaim;
    }

    // ----------- GETTER -------------- //

    function getRewards(address a) public view returns (uint256 reward) {
        reward =
            stakers[a].totalRewards +
            (rewardPerSecond(a) * rewardDuration(a));
    }

    function getStaker(address a) public view returns (bool exists) {
        exists = stakers[a].exists;
    }

    function getStakedAmount(address a) public view returns (uint256 amount) {
        amount = stakers[a].totalStaked;
    }

    function getRemainingCooldown(address a)
        public
        view
        returns (uint256 remainingCooldown)
    {
        remainingCooldown = ((stakers[a].lastDepositOrClaim + cooldown) -
            block.timestamp);
    }

    function getStakersInPool() public view returns (uint256 stakersInPool) {
        uint256 stakersActive;
        for (uint256 i = 0; i < stakerList.length; i++) {
            address user = stakerList[i];
            if (stakers[user].totalStaked > 0) {
                stakersActive++;
            }
        }
        stakersInPool = stakersActive;
    }

    function getlastDepositOrClaim(address a)
        public
        view
        returns (uint256 lastDepositOrClaim)
    {
        lastDepositOrClaim = stakers[a].lastDepositOrClaim;
    }

    // ----- STAKING / UNSTAKING FUNCTIONS  ---- //

    function stake() external payable nonReentrant {
        require(
            poolStatus == PoolInfo.ActivePool,
            "Pool isn't active, you can't do this now"
        );
        require(msg.value > 0, "You have not sent any ETH");
        uint256 eth = msg.value;
        address user = msg.sender;

        if (stakers[user].exists) {
            if (stakers[user].totalStaked > 0) {
                uint256 reward = (rewardPerSecond(user) * rewardDuration(user));
                stakers[user].totalRewards += reward;
                stakers[user].totalStaked += eth;
                poolBalance += eth;
                stakers[user].lastDepositOrClaim = block.timestamp;
                emit StakingUpdate(
                    user,
                    getStakedAmount(user),
                    getRewards(user)
                );
            } else {
                stakers[user].totalStaked += eth;
                poolBalance += eth;
                stakers[user].lastDepositOrClaim = block.timestamp;
                emit StakingUpdate(
                    user,
                    getStakedAmount(user),
                    getRewards(user)
                );
            }
        } else {
            // Create new user
            Staker memory newUser;
            newUser.totalStaked = eth;
            poolBalance += eth;
            newUser.lastDepositOrClaim = block.timestamp;
            newUser.exists = true;
            // Add user to stakers
            stakers[user] = newUser;
            stakerList.push(user);

            emit StakerAdded(user, eth);
        }
    }

    function partialUnstake(uint256 amount) external nonReentrant {
        require(
            poolStatus == PoolInfo.ActivePool,
            "Pool isn't active, you can't do this now"
        );
        address user = msg.sender;
        uint256 eth = amount;
        require(
            stakers[user].exists = true,
            "You didn't participate in staking"
        );
        require(stakers[user].totalStaked > 0, "You have nothing to unstake");

        uint256 reward = (rewardPerSecond(user) * rewardDuration(user));
        stakers[user].totalRewards += reward;
        stakers[user].totalStaked -= eth;
        poolBalance -= eth;
        stakers[user].lastDepositOrClaim = block.timestamp;
        (bool res, ) = user.call{value: amount}("");
        require(res, "Failed to send Ether");
        emit StakingUpdate(user, getStakedAmount(user), getRewards(user));
    }

    function unstake() external nonReentrant {
        require(
            poolStatus == PoolInfo.ActivePool,
            "Pool isn't active, you can't do this now"
        );
        address user = msg.sender;
        require(
            stakers[user].exists = true,
            "You didn't participate in staking"
        );
        require(stakers[user].totalStaked > 0, "You have nothing to unstake");
        uint256 reward = (rewardPerSecond(user) * rewardDuration(user));
        stakers[user].totalRewards += reward;
        uint256 harvest = stakers[user].totalRewards;
        uint256 withdrawal = stakers[user].totalStaked;
        poolBalance -= withdrawal;
        stakers[user].totalRewards = 0;
        stakers[user].totalStaked = 0;
        stakers[user].lastDepositOrClaim = 0;
        (bool res, ) = user.call{value: withdrawal}("");
        require(res, "Failed to send Ether");
        bool res2 = ERC20(stakingToken).transfer(user, harvest);
        require(res2, "Failed to send tokens");

        emit UnstakeCompleted(user, harvest, withdrawal);
    }

    // --------------- HARVEST FUNCTION -------------------//

    function harvestReward() external nonReentrant {
        require(
            poolStatus == PoolInfo.ActivePool ||
                poolStatus == PoolInfo.PausedPool,
            "Pool is closed, you can't do this now"
        );
        address user = msg.sender;
        require(
            stakers[user].exists = true,
            "You didn't participate in staking"
        );
        require(
            (stakers[user].lastDepositOrClaim + cooldown < block.timestamp),
            "You haven't reached the minimum time between two harvests"
        );
        uint256 reward = (rewardPerSecond(user) * rewardDuration(user));
        stakers[user].totalRewards += reward;
        uint256 harvest = stakers[user].totalRewards;
        stakers[user].lastDepositOrClaim = block.timestamp;
        stakers[user].totalRewards = 0;
        bool res2 = ERC20(stakingToken).transfer(user, harvest);
        require(res2, "Failed to send tokens");

        emit RewardsHarvested(user, harvest);
    }

    // ----------------- OWNER FUNCTION ------------------- //

    function pausedPool() external onlyOwner {
        poolStatus = PoolInfo.PausedPool;
        emit PoolStatusChange(PoolInfo.PausedPool);
    }

    function closedPool() external onlyOwner {
        poolStatus = PoolInfo.ClosedPool;
        emit PoolStatusChange(PoolInfo.ClosedPool);
    }

    function activePool() external onlyOwner {
        poolStatus = PoolInfo.ActivePool;
        emit PoolStatusChange(PoolInfo.ActivePool);
    }

    function unstakeAll() external onlyOwner {
        require(poolStatus == PoolInfo.ClosedPool, "Pool is not closed");
        for (uint256 i = 0; i < stakerList.length; i++) {
            address user = stakerList[i];
            ForceRemoveStake(user);
        }
    }

    function ForceRemoveStake(address user) private {
        require(
            stakers[user].exists = true,
            "You didn't participate in staking"
        );
        require(stakers[user].totalStaked > 0, "You have nothing to unstake");
        uint256 reward = (rewardPerSecond(user) * rewardDuration(user));
        stakers[user].totalRewards += reward;
        uint256 harvest = stakers[user].totalRewards;
        uint256 withdrawal = stakers[user].totalStaked;
        poolBalance -= withdrawal;
        stakers[user].totalRewards = 0;
        stakers[user].totalStaked = 0;
        stakers[user].lastDepositOrClaim = 0;
        (bool res, ) = user.call{value: withdrawal}("");
        require(res, "Failed to send Ether");
        bool res2 = ERC20(stakingToken).transfer(user, harvest);
        require(res2, "Failed to send tokens");

        emit UnstakeCompleted(user, harvest, withdrawal);
    }
}
