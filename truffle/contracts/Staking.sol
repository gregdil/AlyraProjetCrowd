// SPDX-License-Identifier: MIT

pragma solidity >=0.8.14;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Staking is Ownable, ReentrancyGuard {
    struct Staker {
        uint256 totalStaked; // Total amount staked
        uint256 lastDeposit; // Date of last deposit
        uint256 lastClaim; // Date of last claim
        uint256 totalRewards; // Total of rewards
        bool exists;
    }

    mapping(address => Staker) public stakers;

    uint256 public annualRewardRate; //annual rewards percentage
    uint256 public cooldown; //minimum time between two claims (in seconds)
    uint256 public minimumReward; //minimum reward to claim

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

    // ----------- CALCULATION FUNCTIONS ------------ //

    function rewardPerSecond(address a) public view returns (uint256) {
        return (((stakers[a].totalStaked * annualRewardRate) / 100) / 31536000);
    }

    function rewardDuration(address a) public view returns (uint256) {
        return block.timestamp - stakers[a].lastDeposit;
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

    function getLastClaim(address a) public view returns (uint256 lastClaim) {
        lastClaim = stakers[a].lastClaim;
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
                stakers[user].lastDeposit = block.timestamp;
            } else {
                stakers[user].totalStaked += eth;
                stakers[user].lastDeposit = block.timestamp;
            }
        } else {
            // Create new user
            Staker memory newUser;
            newUser.totalStaked = eth;
            newUser.lastDeposit = block.timestamp;
            newUser.exists = true;
            // Add user to stakers
            stakers[user] = newUser;
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
        stakers[user].lastDeposit = block.timestamp;
        (bool res, ) = user.call{value: amount}("");
        require(res, "Failed to send Ether");
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
        stakers[user].totalRewards = 0;
        stakers[user].totalStaked = 0;
        stakers[user].lastDeposit = 0;
        (bool res, ) = user.call{value: withdrawal}("");
        require(res, "Failed to send Ether");
        bool res2 = ERC20(stakingToken).transfer(user, harvest);
        require(res2, "Failed to send tokens");
    }

    function unstakeAll() external onlyOwner {}

    // --------------- HARVEST FUNCTION -------------------------//

    function harvestReward() external nonReentrant {
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
        require(
            stakers[user].lastClaim + cooldown > block.timestamp,
            "You haven't reached the minimum time between two harvests"
        );
        uint256 reward = (rewardPerSecond(user) * rewardDuration(user));
        stakers[user].totalRewards += reward;
        uint256 harvest = stakers[user].totalRewards;
        stakers[user].totalRewards = 0;
        stakers[user].lastDeposit = block.timestamp;
        stakers[user].lastClaim = block.timestamp;
        bool res2 = ERC20(stakingToken).transfer(user, harvest);
        require(res2, "Failed to send tokens");
    }
}

/// require(stakers[user].totalStaked > 0, "You didn't stake anything");
/// require(block.timestamp - stakers[user].lastDeposit > cooldown, "You cannot yet withdraw your rewards");
