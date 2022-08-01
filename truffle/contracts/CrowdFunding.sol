// SPDX-License-Identifier: MIT

pragma solidity >=0.8.14;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title A crowdfunding contract
 * @author RisMouZ (https://github.com/RisMouZ)
 * This contract stake funds pending the end of the campaign period.
 * Staking funds will recoverable once the campaign period is over with an nft guaranteeing 1% profit from the campaign owner's project if the minimum price for obtaining the nft has been paid.
 */

contract CrowdFunding is Ownable {
    IERC20 public stakingToken;

    struct Campaigner {
        uint256 campaignObjectif; //The amount of campaign minimum target
        string description; // The campaign description
        uint256 poolAmount; // The total participation amount
        uint256 minimumForNftReward; // The minimum amount requested to obtain a percentage of the profits of the project
        uint256 cratedDate; // The date of campaign creation (in second)
        uint256 durationCampaign; // The campaign duration (in second)
        bool exists;
    }

    mapping(address => Campaigner) public campaigners;
    mapping(address => mapping(address => uint256)) public participations;

    event CampaignCreate(
        address campaignOwner,
        uint256 campaignObjectif,
        string description,
        uint256 minimumForNftReward,
        uint256 createDate,
        uint256 durationCampaign
    );

    event StakingComplete(
        address staker,
        address campaignOwner,
        uint256 stakingAmount
    );

    function createCampaign(
        uint256 _objectif,
        string memory _description,
        uint256 _minimumForNft,
        uint256 _durationCampaign
    ) public {
        require(
            campaigners[msg.sender].exists != true,
            "You have already create a campaign"
        );
        // Create new creator
        Campaigner memory creator;
        creator.campaignObjectif = _objectif;
        creator.description = _description;
        creator.minimumForNftReward = _minimumForNft;
        creator.cratedDate = block.timestamp;
        creator.durationCampaign = _durationCampaign;
        creator.exists = true;
        // Add creator to campaigners
        campaigners[msg.sender] = creator;

        emit CampaignCreate(
            msg.sender,
            _objectif,
            _description,
            _minimumForNft,
            block.timestamp,
            _durationCampaign
        );
    }

    function Stake(uint256 _amount, address _campaignOwner) public {
        require(_amount > 0, "You have entered no amount");
        require(
            campaigners[_campaignOwner].exists = true,
            "This campaign does not exist"
        );
        // Transfer the tokens for staking
        // stakingToken.transferFrom(msg.sender, address(this), _amount);

        // Staker and campaign map
        participations[msg.sender][_campaignOwner] += _amount;

        emit StakingComplete(msg.sender, _campaignOwner, _amount);
    }
}
