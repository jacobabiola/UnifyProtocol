//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


contract PolygonVault {

  string[] userBurnTxnHashes;
  
  function addHash(string memory txnHash) public {
      userBurnTxnHashes.push(txnHash);
  }

  function getHashes() public view returns (string[] memory) {
      return userBurnTxnHashes;
  }

  function emptyHashes() public {
      delete userBurnTxnHashes;
  }

}