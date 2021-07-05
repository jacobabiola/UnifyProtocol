//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IRootChainManager.sol";
import "./interfaces/IDai.sol";

contract ETHVault {
  address token;
  string public name; 
  // address rootChainManager = 0xA0c68C638235ee32657e8f720a23ceC1bFc77C77; // MAINNET RootChainManagerProxy
  // address erc20Predicate = 0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf;   // MAINNET ERC20PredicateProxy

  address rootChainManager = 0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74; // Goerli RootChainManagerProxy
  address erc20Predicate = 0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34;   // Goerli ERC20PredicateProxy

  mapping(address => uint256) balances;
  address[] public userAddresses;

  constructor(string memory _name, address _token) {
      name = _name;
      token = _token;
  }
  
  function moveFundsToPolygon(address addressOnPolygonSide) public {

    IERC20 tokenContract = IERC20(token);
    IRootChainManager rootChainManagerContract = IRootChainManager(rootChainManager);
    uint256 amount = vaultBalance();
    
    console.log("Approving erc20Predicate for amount: ", amount);

    // APPROVE ---- IF WE APPROVE THE ERC20 TO MOVE DAI AN UNLIMITED AMOUNT WE COULD PROBABLY REMOVE THIS AND SAVE GAS
    tokenContract.approve(erc20Predicate, amount);
    console.log("Despositing amount: ", amount);
    rootChainManagerContract.depositFor(addressOnPolygonSide, token, abi.encode(amount));
    console.log("Deposit complete");
  }

  function deposit(uint256 amount) public { // Deposit into vault. Assumes you already have approval
    IERC20 tokenContract = IERC20(token);
    updateBalances(msg.sender, amount);
    tokenContract.transferFrom(msg.sender, address(this), amount);

  }

  function bringAllBalancesBackToEth(bytes[] calldata burnTxnHashes) public {
    IRootChainManager rootChainManagerContract = IRootChainManager(rootChainManager);

    // rootChainManagerContract.exit(burnTxnHashes);

    for(uint i = 0 ; i<burnTxnHashes.length; i++) {
      rootChainManagerContract.exit(burnTxnHashes[i]);
    }
  }


  function moveAllBalancesToPolygon() public {

    IERC20 tokenContract = IERC20(token);
    IRootChainManager rootChainManagerContract = IRootChainManager(rootChainManager);
    uint256 amount = vaultBalance();
    tokenContract.approve(erc20Predicate, amount);

    for(uint i = 0 ; i<userAddresses.length; i++) {
        address addressOnPolygonSide = userAddresses[i]; // Remove this assignment to save gas cost?
        rootChainManagerContract.depositFor(addressOnPolygonSide, token, abi.encode(balances[addressOnPolygonSide])); // If we store the ABI encoding instead of computing it on the fly is it cheaper?
        delete balances[addressOnPolygonSide];
    }
    
    delete userAddresses;
  }

  function depositWithPermit(uint256 amount, uint256 fee, address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s) public { 
    IDai daiContract = IDai(token); // contains permit function
    // IERC20 tokenContract = IERC20(token);

    daiContract.permit(holder, spender, nonce, expiry, allowed, v, r, s);
    updateBalances(holder, amount - fee);
    daiContract.transferFrom(holder, address(this), amount);

  }

  function updateBalances(address user, uint256 amount) private {
    // if user is in mapping
    if (balances[user] > 0) {
        balances[user] += amount;
    } else {
      userAddresses.push(user);
      balances[user] += amount;
    }
  }

  function printAddresses() public view returns (address[] memory) {
      return userAddresses;
  }
  function userBalance() public view returns (uint256) {
    return balances[msg.sender];
  }

  function vaultBalance() public view returns (uint256) {
    IERC20 tokenContract = IERC20(token);
    uint256 balance = tokenContract.balanceOf(address(this));
    return balance;
  }

  fallback() external payable {}

}