// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@thirdweb-dev/contracts/extension/ContractMetadata.sol";

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;


    // Create a New Campaign for Doation
    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(
            _deadline > block.timestamp,
            "The deadline should be a date in the future."
        );

        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }


    // Helper functions
    // Check Fund is enabled or not
    function isFundEnabled(uint256 _id) public view returns (bool) {
        Campaign storage campaign = campaigns[_id];
        return
            campaign.deadline >= block.timestamp &&
            campaign.amountCollected < campaign.target;
    }
    // Check Fund is success or not
    function isFundSuccess(uint256 _id) public view returns (bool) {
        Campaign storage campaign = campaigns[_id];
        return campaign.amountCollected >= campaign.target;
    }

    // Check Campaign is Failure or not
    function isCampaignFailure(uint256 _id) public view returns (bool) {
        Campaign storage campaign = campaigns[_id];
        return
            block.timestamp >= campaign.deadline &&
            campaign.amountCollected < campaign.target;
    }


    
    // Donate for the Campaigns
    function donateToCampaign(uint256 _id) public payable {
        require(isFundEnabled(_id), "Funds are not enabled for this campaign.");

        Campaign storage campaign = campaigns[_id];
        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.amountCollected += msg.value;
    }

    // Owner Can Withdraw from the contract
    function withdrawCampaignOwner(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(
            campaign.owner == msg.sender,
            "Only the owner can withdraw funds."
        );
        require(
            campaign.amountCollected >= campaign.target,
            "Funds cannot be withdrawn until the target is reached."
        );

        uint256 withdrawAmount = campaign.amountCollected;
        campaign.amountCollected = 0; // Reset collected amount

        payable(campaign.owner).transfer(withdrawAmount);
    }

    // Donor can withdraw from the contract
    function withdrawFundDonator(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(
            block.timestamp >= campaign.deadline,
            "Withdrawal is only allowed after the campaign deadline."
        );

        if (campaign.amountCollected < campaign.target) {
            uint256 index;
            for (uint256 i = 0; i < campaign.donators.length; i++) {
                if (campaign.donators[i] == msg.sender) {
                    index = i;
                    break;
                }
            }
            require(index >= 0, "You are not a donator of this campaign.");
            uint256 donationAmount = campaign.donations[index];
            campaign.donators[index] = campaign.donators[
                campaign.donators.length - 1
            ];
            campaign.donations[index] = campaign.donations[
                campaign.donations.length - 1
            ];
            campaign.donators.pop();
            campaign.donations.pop();
            campaign.amountCollected -= donationAmount;
            payable(msg.sender).transfer(donationAmount);
        }
    }


    // Total Collected Funds
    function totalFund(
        uint256 _id
    )
        public
        view
        returns (uint256 totalCollected, uint256 target, uint256 remaining)
    {
        Campaign storage campaign = campaigns[_id];
        totalCollected = campaign.amountCollected;
        target = campaign.target;
        remaining = target > totalCollected ? target - totalCollected : 0;
        return (totalCollected, target, remaining);
    }


    // Information about Total Numbers of Donors
    function getDonators(
        uint256 _id
    ) public view returns (address[] memory, uint256[] memory) {
        Campaign storage campaign = campaigns[_id];
        return (campaign.donators, campaign.donations);
    }

    // Get Information about All the Campaigns Listed
    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }

        return allCampaigns;
    }
}
