// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "./PriceConverter.sol";
import "hardhat/console.sol";

error FundMe__NotOwner();

/**@title A contract for crowdfunding
 * @author Simon Covenant
 * @notice This contract is to demo a sample funding contract
 * @dev This makes use of the chainlink price feed library
 */

contract FundMe {
    using PriceConverter for uint256;

    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmountFunded;

    address public immutable i_owner;
    AggregatorV3Interface public s_priceFeed;
    uint256 public constant MIN_USD = 50 * 1e18;

    modifier onlyOwner() {
        // require(msg.sender == owner, "Not owner");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        // Underscore is a special character only used inside
        // a function modifier and it tells Solidity to
        // execute the rest of the code.
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MIN_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmountFunded[funder] = 0;
        }
        //Rest s_funders array
        s_funders = new address[](0);
        //Withdraw funds
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;

        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }
}
