// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script, console} from "../lib/forge-std/src/Script.sol";
import {ModularNFTMarketplace} from "../src/ModularNFTMarketplace.sol";
import {MockModularNFT} from "../test/mocks/MockModularNFT.sol";

/**
 * @title Script de Déploiement ModularNFTMarketplace
 * @dev Déploie le marketplace avec configuration par réseau
 * @notice Usage: forge script script/DeployMarketplace.s.sol --rpc-url $RPC_URL --broadcast
 */
contract DeployMarketplace is Script {
    // ===== CONFIGURATIONS PAR RÉSEAU =====
    
    struct NetworkConfig {
        address modularNFT;      // Adresse du contrat ModularNFT
        uint256 marketplaceFee;  // Commission en basis points (250 = 2.5%)
        address feeRecipient;    // Destinataire des commissions
        string networkName;      // Nom du réseau pour les logs
    }
    
    // ===== CONSTANTES =====
    
    uint256 public constant DEFAULT_MARKETPLACE_FEE = 250; // 2.5%
    uint256 public constant MAX_MARKETPLACE_FEE = 1000;    // 10% max
    
    // ===== VARIABLES D'ÉTAT =====
    
    NetworkConfig public activeNetworkConfig;
    ModularNFTMarketplace public marketplace;
    
    // ===== FONCTION PRINCIPALE =====
    
    /**
     * @notice Point d'entrée principal du script
     */
    function run() external returns (ModularNFTMarketplace) {
        console.log("=== DEBUT DEPLOIEMENT MARKETPLACE NFT ===");
        
        // 1. Obtenir la configuration réseau
        activeNetworkConfig = getNetworkConfig();
        
        // 2. Logs de configuration
        logNetworkConfig();
        
        // 3. Validations pré-déploiement
        validateConfig();
        
        // 4. Déploiement
        marketplace = deployMarketplace();
        
        // 5. Validation post-déploiement
        validateDeployment();
        
        // 6. Logs finaux
        logDeploymentSuccess();
        
        console.log("=== DEPLOIEMENT TERMINE AVEC SUCCES ===");
        
        return marketplace;
    }
    
    // ===== CONFIGURATION RÉSEAU =====
    
    /**
     * @notice Obtenir la configuration selon le réseau actuel
     */
    function getNetworkConfig() public returns (NetworkConfig memory) {
        uint256 chainId = block.chainid;
        
        if (chainId == 31337) {
            return getAnvilConfig();
        } else if (chainId == 11155111) {
            return getSepoliaConfig();
        } else if (chainId == 1) {
            return getMainnetConfig();
        } else {
            revert("Configuration non supportee pour cette chaine");
        }
    }
    
    /**
     * @notice Configuration pour Anvil (local)
     */
    function getAnvilConfig() public returns (NetworkConfig memory) {
        console.log("Configuration pour Anvil (local)");
        
        // Pour Anvil, on déploie un MockModularNFT si besoin
        address modularNFTAddress = deployMockNFTIfNeeded();
        
        return NetworkConfig({
            modularNFT: modularNFTAddress,
            marketplaceFee: DEFAULT_MARKETPLACE_FEE,
            feeRecipient: msg.sender, // Le déployeur reçoit les fees en local
            networkName: "Anvil (Local)"
        });
    }
    
    /**
     * @notice Configuration pour Sepolia (testnet)
     */
    function getSepoliaConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            modularNFT: 0x72Bd342Ec921BFcfDaeb429403cc1F0Da43fD312, // Adresse existante
            marketplaceFee: DEFAULT_MARKETPLACE_FEE,
            feeRecipient: 0x1234567890123456789012345678901234567890, // À remplacer par vraie adresse
            networkName: "Sepolia (Testnet)"
        });
    }
    
    /**
     * @notice Configuration pour Mainnet (production)
     */
    function getMainnetConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            modularNFT: address(0), // À définir lors du déploiement mainnet
            marketplaceFee: DEFAULT_MARKETPLACE_FEE,
            feeRecipient: address(0), // À définir lors du déploiement mainnet
            networkName: "Ethereum Mainnet"
        });
    }
    
    // ===== DÉPLOIEMENT =====
    
    /**
     * @notice Déployer un MockModularNFT si on est sur Anvil
     */
    function deployMockNFTIfNeeded() internal returns (address) {
        console.log("Deploiement MockModularNFT pour tests locaux...");
        
        vm.startBroadcast();
        MockModularNFT mockNFT = new MockModularNFT();
        vm.stopBroadcast();
        
        console.log("MockModularNFT deploye:", address(mockNFT));
        return address(mockNFT);
    }
    
    /**
     * @notice Déployer le marketplace
     */
    function deployMarketplace() internal returns (ModularNFTMarketplace) {
        console.log("Deploiement ModularNFTMarketplace...");
        
        vm.startBroadcast();
        
        ModularNFTMarketplace newMarketplace = new ModularNFTMarketplace(
            activeNetworkConfig.modularNFT,
            activeNetworkConfig.marketplaceFee,
            activeNetworkConfig.feeRecipient
        );
        
        vm.stopBroadcast();
        
        console.log("ModularNFTMarketplace deploye:", address(newMarketplace));
        return newMarketplace;
    }
    
    // ===== VALIDATIONS =====
    
    /**
     * @notice Valider la configuration avant déploiement
     */
    function validateConfig() internal view {
        console.log("Validation de la configuration...");
        
        require(
            activeNetworkConfig.modularNFT != address(0),
            "Adresse ModularNFT invalide"
        );
        
        require(
            activeNetworkConfig.feeRecipient != address(0),
            "Adresse fee recipient invalide"
        );
        
        require(
            activeNetworkConfig.marketplaceFee <= MAX_MARKETPLACE_FEE,
            "Commission marketplace trop elevee"
        );
        
        console.log("Configuration validee !");
    }
    
    /**
     * @notice Valider le déploiement
     */
    function validateDeployment() internal view {
        console.log("Validation du deploiement...");
        
        // Vérifier que le contrat est déployé
        require(address(marketplace) != address(0), "Marketplace non deploye");
        
        // Vérifier la configuration du marketplace
        require(
            address(marketplace.modularNFT()) == activeNetworkConfig.modularNFT,
            "Adresse ModularNFT incorrecte"
        );
        
        require(
            marketplace.marketplaceFee() == activeNetworkConfig.marketplaceFee,
            "Commission marketplace incorrecte"
        );
        
        require(
            marketplace.feeRecipient() == activeNetworkConfig.feeRecipient,
            "Fee recipient incorrect"
        );
        
        require(
            marketplace.owner() == msg.sender,
            "Owner incorrect"
        );
        
        // Vérifier que le marketplace n'est pas en pause
        require(!marketplace.paused(), "Marketplace en pause");
        
        console.log("Deploiement valide !");
    }
    
    // ===== LOGGING =====
    
    /**
     * @notice Logger la configuration réseau
     */
    function logNetworkConfig() internal view {
        console.log("=== CONFIGURATION RESEAU ===");
        console.log("Reseau:");
        console.log(activeNetworkConfig.networkName);
        console.log("Chain ID:");
        console.log(block.chainid);
        console.log("ModularNFT:");
        console.log(activeNetworkConfig.modularNFT);
        console.log("Marketplace Fee (basis points):");
        console.log(activeNetworkConfig.marketplaceFee);
        console.log("Fee Recipient:");
        console.log(activeNetworkConfig.feeRecipient);
        console.log("Deployer:");
        console.log(msg.sender);
        console.log("Balance Deployer (wei):");
        console.log(msg.sender.balance);
    }
    
    /**
     * @notice Logger le succès du déploiement
     */
    function logDeploymentSuccess() internal view {
        console.log("=== DEPLOIEMENT REUSSI ===");
        console.log("Adresse Marketplace:");
        console.log(address(marketplace));
        console.log("Owner:");
        console.log(marketplace.owner());
        console.log("Fee (basis points):");
        console.log(marketplace.marketplaceFee());
        console.log("Fee Recipient:");
        console.log(marketplace.feeRecipient());
        console.log("Contrat ModularNFT:");
        console.log(address(marketplace.modularNFT()));
        console.log("Paused:");
        console.log(marketplace.paused());
        
        // Informations utiles pour les tests
        console.log("=== INFORMATIONS POUR TESTS ===");
        console.log("1. Adresse Marketplace:");
        console.log(address(marketplace));
        console.log("2. Adresse NFT:");
        console.log(address(marketplace.modularNFT()));
        console.log("3. Commission (basis points):");
        console.log(marketplace.marketplaceFee());
        
        if (block.chainid == 31337) {
            console.log("=== COMMANDS UTILES ANVIL ===");
            console.log("forge test --match-contract ModularNFTMarketplaceTest -vv");
            console.log("cast call [MARKETPLACE_ADDRESS] \"getActiveListingsCount()\"");
        }
    }
    
    // ===== FONCTIONS HELPER =====
    
    /**
     * @notice Obtenir l'adresse du marketplace déployé
     */
    function getMarketplaceAddress() external view returns (address) {
        require(address(marketplace) != address(0), "Marketplace non deploye");
        return address(marketplace);
    }
    
    /**
     * @notice Obtenir l'adresse du contrat ModularNFT configuré
     */
    function getModularNFTAddress() external view returns (address) {
        return activeNetworkConfig.modularNFT;
    }
    
    /**
     * @notice Obtenir la configuration complète
     */
    function getActiveConfig() external view returns (NetworkConfig memory) {
        return activeNetworkConfig;
    }
}