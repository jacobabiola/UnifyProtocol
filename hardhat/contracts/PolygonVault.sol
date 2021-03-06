//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PolygonVault {

  string[] userBurnTxnHashes;
  address token = 0x27a44456bEDb94DbD59D0f0A14fE977c777fC5C3;

  function addHash(string memory txnHash, uint256 fee, address holder) public {
    userBurnTxnHashes.push(txnHash);
    IERC20 tokenContract = IERC20(token);
    tokenContract.transferFrom(holder, address(this), fee);
  }

  function getHashes() public view returns (string[] memory) {
      return userBurnTxnHashes;
  }

  function emptyHashes() public {
      delete userBurnTxnHashes;
  }

  function vaultBalance() public view returns (uint256) {
    IERC20 tokenContract = IERC20(token);
    uint256 balance = tokenContract.balanceOf(address(this));
    return balance;
  }

}