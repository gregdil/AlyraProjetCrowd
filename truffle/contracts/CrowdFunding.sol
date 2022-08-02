// SPDX-License-Identifier: MIT

pragma solidity >=0.8.14;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title A crowdfunding contract
 * @author RisMouZ (https://github.com/RisMouZ)
 * This contract stake funds pending the end of the campaign period.
 * Staking funds will recoverable once the campaign period is over with an nft guaranteeing 1% profit from the campaign owner's project if the minimum price for obtaining the nft has been paid.
 */

contract CrowdFunding is Ownable, ReentrancyGuard {
    IERC20 public stakingToken;

    struct Campaigner {
        uint256 campaignObjectif; //The amount of campaign minimum target
        string description; // The campaign description
        uint256 poolAmount; // The total participations amount
        uint256 minimumForNftReward; // The minimum amount requested to obtain a percentage of the profits of the project
        uint256 endOfCampaign; // The date of the end of the campaign
        bool exists;
    }

    mapping(address => Campaigner) public campaigners;
    mapping(address => mapping(address => uint256)) public participations;

    event CampaignCreate(
        address campaignOwner,
        uint256 campaignObjectif,
        string description,
        uint256 minimumForNftReward,
        uint256 endOfCampaign
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
        uint256 _endOfCampaign
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
        creator.endOfCampaign = _endOfCampaign;
        creator.exists = true;
        // Add creator to campaigners
        campaigners[msg.sender] = creator;

        emit CampaignCreate(
            msg.sender,
            _objectif,
            _description,
            _minimumForNft,
            _endOfCampaign
        );
    }

    function Stake(uint256 _amount, address _campaignOwner)
        public
        payable
        nonReentrant
    {
        require(_amount > 0, "You have entered no amount");
        require(
            campaigners[_campaignOwner].exists = true,
            "This campaign does not exist"
        );
        require(
            campaigners[_campaignOwner].endOfCampaign > block.timestamp,
            "The campaign is over"
        );
        // Transfer the tokens for staking
        // stakingToken.transferFrom(msg.sender, address(this), _amount);

        // Staker and campaign map
        participations[msg.sender][_campaignOwner] += _amount;
        campaigners[_campaignOwner].poolAmount += _amount;

        emit StakingComplete(msg.sender, _campaignOwner, _amount);
    }

    function stakeWithdraw(address _campaignOwner) public nonReentrant {
        require(
            campaigners[_campaignOwner].endOfCampaign < block.timestamp,
            "the campaign is not over yet"
        );
        if (
            campaigners[_campaignOwner].poolAmount <
            campaigners[_campaignOwner].campaignObjectif
        ) {
            uint256 balance = participations[msg.sender][_campaignOwner];
            require(balance > 0, "You have not participated in this campaign");
            (bool res, ) = msg.sender.call{value: balance}("");
            require(res, "Failed to send Ether");
            balance = 0;
        } else {
            if (
                participations[msg.sender][_campaignOwner] >=
                campaigners[_campaignOwner].minimumForNftReward
            ) {
                // envoyer un nft
            } else {
                uint256 balance = campaigners[msg.sender].poolAmount;
                (bool res, ) = msg.sender.call{value: balance}("");
                require(res, "Failed to send Ether");
                campaigners[_campaignOwner].exists = false;
            }
        }
    }
}
