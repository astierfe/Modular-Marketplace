// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ERC721} from "../../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {IERC2981} from "../../lib/openzeppelin-contracts/contracts/interfaces/IERC2981.sol";
import {IERC165} from "../../lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";

/**
 * @title MockModularNFT
 * @dev Mock NFT simple pour tester le marketplace
 * @notice Implémente ERC721 + EIP-2981 comme le vrai ModularNFT
 */
contract MockModularNFT is ERC721, IERC2981 {
    // ===== VARIABLES D'ÉTAT =====
    
    /// @notice Royalty rate en basis points (ex: 500 = 5%)
    uint96 public royaltyRate = 500; // 5% par défaut
    
    /// @notice Destinataire des royalties
    address public royaltyRecipient;
    
    /// @notice Counter pour les tokenIds
    uint256 private _tokenIdCounter;

    // ===== CONSTRUCTEUR =====
    
    constructor() ERC721("Mock Modular NFT", "MOCKNFT") {
        royaltyRecipient = msg.sender;
    }

    // ===== FONCTIONS PUBLIQUES =====
    
    /**
     * @notice Mint un NFT (pour les tests)
     * @param to Destinataire du NFT
     * @param tokenId ID du token à minter
     */
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
        
        // Update counter si nécessaire
        if (tokenId >= _tokenIdCounter) {
            _tokenIdCounter = tokenId + 1;
        }
    }
    
    /**
     * @notice Mint avec auto-increment du tokenId
     * @param to Destinataire du NFT
     * @return tokenId Token ID du NFT minté
     */
    function safeMint(address to) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        return tokenId;
    }
    
    /**
     * @notice Configurer les royalties
     * @param recipient Destinataire des royalties
     * @param rate Taux en basis points (ex: 500 = 5%)
     */
    function setRoyalty(address recipient, uint96 rate) external {
        require(rate <= 1000, "Royalty rate too high"); // Max 10%
        royaltyRecipient = recipient;
        royaltyRate = rate;
    }

    // ===== IMPLÉMENTATION EIP-2981 =====
    
    /**
     * @notice Calculer les royalties selon EIP-2981
     * @param tokenId ID du token (non utilisé dans ce mock)
     * @param salePrice Prix de vente
     * @return receiver Destinataire des royalties
     * @return royaltyAmount Montant des royalties
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        // Éviter warning unused parameter
        tokenId;
        
        receiver = royaltyRecipient;
        royaltyAmount = (salePrice * royaltyRate) / 10000;
    }

    // ===== SUPPORT D'INTERFACES =====
    
    /**
     * @notice Vérifier le support d'interface
     * @param interfaceId ID de l'interface
     * @return supported True si supportée
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // ===== FONCTIONS DE VUE HELPER =====
    
    /**
     * @notice Obtenir le prochain tokenId
     * @return nextId Prochain token ID disponible
     */
    function nextTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @notice Vérifier si un token existe
     * @param tokenId ID du token
     * @return exists True si le token existe
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }
}