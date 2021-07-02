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
    // DEPOSIT
    rootChainManagerContract.depositFor(addressOnPolygonSide, token, abi.encode(amount));
    console.log("Deposit complete");
    
  }

  function deposit(uint256 amount) public { // Deposit into vault. Assumes you already have approval
    IERC20 tokenContract = IERC20(token);
    tokenContract.transferFrom(msg.sender, address(this), amount);
    balances[msg.sender] += amount;
  }

  // function depositWithPermit(uint256 amount, address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s) public { 
  //   IDai daiContract = IDai(token); // This is just to access the permit function
  //   IERC20 tokenContract = IERC20(token);

  //   console.log("holder: ", holder); 
  //   console.log("spender: ", spender); 
  //   console.log("nonce: ", nonce); 
  //   console.log("expiry: ", expiry); 
  //   console.log("allowed: ", allowed); 
  //   console.log("v: ", v); 
  //   console.logBytes32(r); 
  //   console.logBytes32(s); 

  //   daiContract.permit(holder, spender, nonce, expiry, allowed, v, r, s);
  //   tokenContract.transferFrom(msg.sender, address(this), amount);
  //   balances[msg.sender] += amount;
  // }

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
