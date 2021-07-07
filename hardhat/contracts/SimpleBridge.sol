//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Multicall.sol";
import "./interfaces/IRootChainManager.sol";
import "./interfaces/IERC20.sol"; // Custom interface with permit and withdraw

contract SimpleBridge is Multicall {

    address rootChainManager = 0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74; // Goerli RootChainManagerProxy
    address erc20Predicate = 0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34; // Goerli ERC20PredicateProxy

    //Declare Events
    event DepositFor(address indexed owner, address indexed token, uint256 value);
    event Withdraw(address indexed token, uint256 value);

    constructor(address[] memory acceptedTokens) {
        if (block.chainid == 5) {
            // Save 7k Gas per token on "bridgeToPolygon" by approving tokens here
            for (uint256 i = 0; i < acceptedTokens.length; i++) {
                IERC20(acceptedTokens[i]).approve(erc20Predicate, 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
            }
        }
    }

    function bridgeToPolygon(address token) public {
        IRootChainManager(rootChainManager).depositFor( address(this), token, abi.encode(balanceFor(token)) );
        emit DepositFor(address(this), token, balanceFor(token));
    }

    function distribute(uint256 amount, address token, address user) public {
        IERC20(token).transfer(user, amount);
    }

    function withdraw(address token) public {
        IERC20(token).withdraw(balanceFor(token));
        emit Withdraw(token, balanceFor(token));
    }

    function exit(bytes calldata burnTxnHash) public {
        IRootChainManager(rootChainManager).exit(burnTxnHash);

    }

    function balanceFor(address token) public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    fallback() external payable {}

}
