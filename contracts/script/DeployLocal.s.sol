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
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract DeployLocal is Script {
    function run() external {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        address treasury = vm.envOr("PLATFORM_TREASURY", deployer);
        address agentOwner = vm.envOr("AGENT_OWNER", deployer);

        vm.startBroadcast();

        // 1. Deploy mock USDC (Arc testnet uses real USDC, local uses mock)
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC:", address(usdc));

        // 2. NFG token
        NFGToken nfg = new NFGToken(deployer);
        console.log("NFGToken:", address(nfg));

        // 3. Agent NFT
        AgentNFT agentNFT = new AgentNFT(deployer);
        console.log("AgentNFT:", address(agentNFT));

        // 4. Yield Vault (NFG anchor: 1 NFG = 1 cent = 100 units)
        YieldVault yieldVault = new YieldVault(deployer, address(nfg), address(agentNFT), 100);
        console.log("YieldVault:", address(yieldVault));

        // 5. Job Settler
        JobSettler jobSettler = new JobSettler(deployer, address(yieldVault), address(nfg), treasury);
        console.log("JobSettler:", address(jobSettler));

        // 6. Job Ledger
        JobLedger jobLedger = new JobLedger(deployer, address(agentNFT));
        console.log("JobLedger:", address(jobLedger));

        // 7. Job Payment Router
        JobPaymentRouter router = new JobPaymentRouter(deployer, address(jobLedger), address(usdc), address(nfg));
        console.log("JobPaymentRouter:", address(router));

        // 8. Agent Market
        address[] memory supportedTokens = new address[](2);
        supportedTokens[0] = address(usdc);
        supportedTokens[1] = address(nfg);
        AgentMarket agentMarket = new AgentMarket(deployer, address(agentNFT), supportedTokens);
        console.log("AgentMarket:", address(agentMarket));

        // Wire up
        router.setSettlementEscrow(address(jobSettler));
        jobLedger.setPaymentAdapter(address(router));
        jobLedger.setJobSettler(address(jobSettler));
        jobLedger.setYieldVault(address(yieldVault));
        jobSettler.setJobLedger(address(jobLedger));
        yieldVault.setJobSettler(address(jobSettler));
        nfg.setMinter(address(yieldVault), true);
        agentNFT.setTransferGuard(address(jobLedger));

        // Mint a demo agent
        uint256 agentId = agentNFT.mintAgent(agentOwner, "ipfs://nanoforge/agent/1");
        console.log("Demo AgentId:", agentId);

        // Fund deployer with mock USDC for testing
        usdc.mint(deployer, 1_000_000 * 1e6); // 1M USDC

        vm.stopBroadcast();

        console.log("\n=== NanoForge Deployment Complete ===");
        console.log("Chain:", block.chainid);
        console.log("USDC:", address(usdc));
        console.log("NFG:", address(nfg));
        console.log("AgentNFT:", address(agentNFT));
        console.log("YieldVault:", address(yieldVault));
        console.log("JobSettler:", address(jobSettler));
        console.log("JobLedger:", address(jobLedger));
        console.log("JobPaymentRouter:", address(router));
        console.log("AgentMarket:", address(agentMarket));
    }
}
