// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {NFGToken} from "../src/NFGToken.sol";
import {AgentNFT} from "../src/AgentNFT.sol";
import {AgentMarket} from "../src/AgentMarket.sol";
import {YieldVault} from "../src/YieldVault.sol";
import {JobSettler} from "../src/JobSettler.sol";
import {JobLedger} from "../src/JobLedger.sol";
import {JobPaymentRouter} from "../src/JobPaymentRouter.sol";

contract DeployArcTestnet is Script {
    // Arc testnet USDC address
    address constant ARC_USDC = 0x79AEc4EeA31D50792F61D1Ca0733C18c89524C9e;

    function run() external {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        address treasury = vm.envOr("PLATFORM_TREASURY", deployer);
        address agentOwner = vm.envOr("AGENT_OWNER", deployer);

        vm.startBroadcast();

        NFGToken nfg = new NFGToken(deployer);
        AgentNFT agentNFT = new AgentNFT(deployer);
        YieldVault yieldVault = new YieldVault(deployer, address(nfg), address(agentNFT), 100);
        JobSettler jobSettler = new JobSettler(deployer, address(yieldVault), address(nfg), treasury);
        JobLedger jobLedger = new JobLedger(deployer, address(agentNFT));
        JobPaymentRouter router = new JobPaymentRouter(deployer, address(jobLedger), ARC_USDC, address(nfg));

        address[] memory supportedTokens = new address[](2);
        supportedTokens[0] = ARC_USDC;
        supportedTokens[1] = address(nfg);
        AgentMarket agentMarket = new AgentMarket(deployer, address(agentNFT), supportedTokens);

        router.setSettlementEscrow(address(jobSettler));
        jobLedger.setPaymentAdapter(address(router));
        jobLedger.setJobSettler(address(jobSettler));
        jobLedger.setYieldVault(address(yieldVault));
        jobSettler.setJobLedger(address(jobLedger));
        yieldVault.setJobSettler(address(jobSettler));
        nfg.setMinter(address(yieldVault), true);
        agentNFT.setTransferGuard(address(jobLedger));

        uint256 agentId = agentNFT.mintAgent(agentOwner, "ipfs://nanoforge/agent/1");

        vm.stopBroadcast();

        console.log("=== NanoForge Arc Testnet Deployment ===");
        console.log("ChainId:", block.chainid);
        console.log("USDC (Arc native):", ARC_USDC);
        console.log("NFGToken:", address(nfg));
        console.log("AgentNFT:", address(agentNFT));
        console.log("YieldVault:", address(yieldVault));
        console.log("JobSettler:", address(jobSettler));
        console.log("JobLedger:", address(jobLedger));
        console.log("JobPaymentRouter:", address(router));
        console.log("AgentMarket:", address(agentMarket));
        console.log("Demo AgentId:", agentId);
    }
}
