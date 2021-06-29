//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IRootChainManager.sol";

contract ETHVault {
  address token;
  string public name; 
  address rootChainManager = 0xA0c68C638235ee32657e8f720a23ceC1bFc77C77; // RootChainManagerProxy
  address erc20Predicate = 0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf; // ERC20PredicateProxy
  address polygonVault = 0x9b591bf6970D271c4660Df5E08d85773E998B59E; // This needs to be updated to the deployed address

  constructor(string memory _name, address _token) {
      name = _name;
      token = _token;
  }

  function depositERC20() public {
    IERC20 tokenContract = IERC20(token);
    IRootChainManager rootChainManagerContract = IRootChainManager(rootChainManager);
    uint256 amount = checkBalance();
    
    console.log("Approving erc20Predicate for amount: ", amount);
    // APPROVE
    tokenContract.approve(erc20Predicate, amount);
    
    console.log("Despositing amount: ", amount);
    // DEPOSIT
    rootChainManagerContract.depositFor(polygonVault, token, abi.encode(amount));
    console.log("Deposit complete");
  }

  function checkBalance() public view returns (uint256) {
    IERC20 tokenContract = IERC20(token);
    uint256 balance = tokenContract.balanceOf(address(this));
    return balance;
  }

}
