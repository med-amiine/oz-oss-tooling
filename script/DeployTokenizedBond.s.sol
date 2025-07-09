// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "lib/forge-std/src/Script.sol";
import "../src/TokenizedBond.sol";

contract DeployTokenizedBond is Script {
    function run() external {
        // Get private key from command line argument
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Demo constructor arguments
        string memory name = "Demo Bond";
        string memory symbol = "DBOND";
        uint256 faceValue = 1000000 ether; // 1,000,000 tokens
        uint256 couponRate = 500; // 5% (in basis points)
        uint256 maturityDate = block.timestamp + 365 days * 5; // 5 years from now
        address monitor = msg.sender;
        address treasury = msg.sender;
        address compliance = msg.sender;

        TokenizedBond bond = new TokenizedBond(
            name,
            symbol,
            faceValue,
            couponRate,
            maturityDate,
            monitor,
            treasury,
            compliance
        );

        // Mint initial tokens to the deployer (deployer has treasury role)
        bond.mint(vm.addr(deployerPrivateKey), faceValue);

        console2.log("TokenizedBond deployed at:", address(bond));
        console2.log("Initial tokens minted to deployer:", faceValue);
        vm.stopBroadcast();
    }
} 