//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ETHVault {
  address token;
  string public name; 

  constructor(string memory _name, address _token) {
      name = _name;
      token = _token;
  }

  function checkBalance() public view returns (uint256) {
    IERC20 tokenContract = IERC20(token);
    uint256 balance = tokenContract.balanceOf(address(this));
    return balance;
  }

}
