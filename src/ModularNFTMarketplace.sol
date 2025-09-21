// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC721} from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {IERC2981} from "../lib/openzeppelin-contracts/contracts/interfaces/IERC2981.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/security/ReentrancyGuard.sol";
import {Pausable} from "../lib/openzeppelin-contracts/contracts/security/Pausable.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC165} from "../lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";

/**
 * @title ModularNFTMarketplace
 * @dev Marketplace pour trading P2P des NFT ModularNFT
 * @notice Contrat indépendant qui interagit avec le contrat ModularNFT existant
 * @author Marketplace Team
 */
contract ModularNFTMarketplace is ReentrancyGuard, Pausable, Ownable {
    // ===== CONSTANTES =====
    uint256 public constant MAX_MARKETPLACE_FEE = 1000; // 10% maximum
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points

    // ===== VARIABLES D'ÉTAT =====
    
    /// @notice Contrat ModularNFT existant (immutable pour sécurité)
    IERC721 public immutable modularNFT;
    
    /// @notice Support EIP-2981 pour royalties
    IERC2981 public immutable royaltyContract;
    
    /// @notice Commission du marketplace en basis points (ex: 250 = 2.5%)
    uint256 public marketplaceFee;
    
    /// @notice Destinataire des commissions marketplace
    address public feeRecipient;
    
    /// @notice Revenus accumulés par adresse (vendeurs, créateurs, marketplace)
    mapping(address => uint256) public proceeds;
    
    /// @notice Listings actifs par tokenId
    mapping(uint256 => Listing) public listings;
    
    /// @notice Tokens listés par vendeur
    mapping(address => uint256[]) public sellerTokens;
    
    /// @notice Index des tokens dans sellerTokens pour suppression efficace
    mapping(address => mapping(uint256 => uint256)) private sellerTokenIndex;
    
    /// @notice Liste des tokenIds actifs (pour énumération)
    uint256[] public activeListings;
    
    /// @notice Index des tokens dans activeListings
    mapping(uint256 => uint256) private activeListingIndex;

    // ===== STRUCTURES =====
    
    /**
     * @dev Structure représentant un listing NFT
     */
    struct Listing {
        uint256 tokenId;      // ID du token NFT
        address seller;       // Adresse du vendeur
        uint256 price;        // Prix en wei
        bool active;          // Statut du listing
        uint256 timestamp;    // Timestamp de création
    }

    // ===== EVENTS =====
    
    /**
     * @dev Émis quand un NFT est mis en vente
     */
    event ItemListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    
    /**
     * @dev Émis quand un NFT est vendu
     */
    event ItemSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 royaltyAmount,
        uint256 marketplaceFeeAmount
    );
    
    /**
     * @dev Émis quand un listing est retiré
     */
    event ItemDelisted(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    /**
     * @dev Émis quand le prix d'un listing est modifié
     */
    event PriceUpdated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 oldPrice,
        uint256 newPrice
    );
    
    /**
     * @dev Émis quand des revenus sont retirés
     */
    event ProceedsWithdrawn(
        address indexed recipient,
        uint256 amount
    );
    
    /**
     * @dev Émis quand la commission marketplace est modifiée
     */
    event MarketplaceFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
    
    /**
     * @dev Émis quand le destinataire des commissions est modifié
     */
    event FeeRecipientUpdated(
        address indexed oldRecipient,
        address indexed newRecipient
    );

    // ===== ERREURS PERSONNALISÉES =====
    
    error NotTokenOwner();
    error TokenNotApproved();
    error InvalidPrice();
    error TokenAlreadyListed();
    error TokenNotListed();
    error InsufficientPayment();
    error CannotBuyOwnToken();
    error NoProceeds();
    error InvalidMarketplaceFee();
    error InvalidFeeRecipient();
    error ArrayIndexOutOfBounds();

    // ===== CONSTRUCTEUR =====
    
    /**
     * @dev Initialise le marketplace
     * @param _modularNFT Adresse du contrat ModularNFT existant
     * @param _marketplaceFee Commission initiale en basis points
     * @param _feeRecipient Destinataire des commissions
     */
    constructor(
        address _modularNFT,
        uint256 _marketplaceFee,
        address _feeRecipient
    ) {
        if (_modularNFT == address(0)) revert InvalidFeeRecipient();
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        if (_marketplaceFee > MAX_MARKETPLACE_FEE) revert InvalidMarketplaceFee();
        
        modularNFT = IERC721(_modularNFT);
        royaltyContract = IERC2981(_modularNFT);
        marketplaceFee = _marketplaceFee;
        feeRecipient = _feeRecipient;
        
        // Transférer ownership au déployeur (OpenZeppelin v4.9.3)
        _transferOwnership(msg.sender);
    }

    // ===== FONCTIONS PRINCIPALES =====
    
    /**
     * @notice Lister un NFT à la vente
     * @param tokenId ID du token à vendre
     * @param price Prix de vente en wei
     */
    function listItem(uint256 tokenId, uint256 price) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (price == 0) revert InvalidPrice();
        
        // Vérifier ownership
        if (modularNFT.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        
        // Vérifier approbation
        if (!_isApprovedForMarketplace(tokenId, msg.sender)) revert TokenNotApproved();
        
        // Vérifier que le token n'est pas déjà listé
        if (listings[tokenId].active) revert TokenAlreadyListed();
        
        // Créer le listing
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            timestamp: block.timestamp
        });
        
        // Ajouter aux listes d'énumération
        _addToSellerTokens(msg.sender, tokenId);
        _addToActiveListings(tokenId);
        
        emit ItemListed(tokenId, msg.sender, price, block.timestamp);
    }
    
    /**
     * @notice Acheter un NFT listé
     * @param tokenId ID du token à acheter
     */
    function buyItem(uint256 tokenId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        Listing memory listing = listings[tokenId];
        
        if (!listing.active) revert TokenNotListed();
        if (msg.value != listing.price) revert InsufficientPayment();
        if (listing.seller == msg.sender) revert CannotBuyOwnToken();
        
        // Vérifier que le vendeur possède toujours le NFT
        if (modularNFT.ownerOf(tokenId) != listing.seller) revert NotTokenOwner();
        
        // Vérifier que le marketplace est toujours approuvé
        if (!_isApprovedForMarketplace(tokenId, listing.seller)) revert TokenNotApproved();
        
        // Supprimer le listing
        _removeListing(tokenId, listing.seller);
        
        // Calculer et distribuer les fonds
        uint256 royaltyAmount;
        uint256 marketplaceFeeAmount;
        (royaltyAmount, marketplaceFeeAmount) = _distributeFunds(tokenId, msg.value, listing.seller);
        
        // Transférer le NFT
        modularNFT.safeTransferFrom(listing.seller, msg.sender, tokenId);
        
        emit ItemSold(
            tokenId,
            listing.seller,
            msg.sender,
            msg.value,
            royaltyAmount,
            marketplaceFeeAmount
        );
    }
    
    /**
     * @notice Retirer un NFT de la vente
     * @param tokenId ID du token à retirer
     */
    function delistItem(uint256 tokenId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        Listing memory listing = listings[tokenId];
        
        if (!listing.active) revert TokenNotListed();
        if (listing.seller != msg.sender) revert NotTokenOwner();
        
        _removeListing(tokenId, msg.sender);
        
        emit ItemDelisted(tokenId, msg.sender);
    }
    
    /**
     * @notice Modifier le prix d'un listing existant
     * @param tokenId ID du token
     * @param newPrice Nouveau prix en wei
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (newPrice == 0) revert InvalidPrice();
        
        Listing storage listing = listings[tokenId];
        
        if (!listing.active) revert TokenNotListed();
        if (listing.seller != msg.sender) revert NotTokenOwner();
        
        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        
        emit PriceUpdated(tokenId, msg.sender, oldPrice, newPrice);
    }
    
    /**
     * @notice Retirer les revenus accumulés
     */
    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        if (amount == 0) revert NoProceeds();
        
        proceeds[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit ProceedsWithdrawn(msg.sender, amount);
    }

    // ===== FONCTIONS DE VUE =====
    
    /**
     * @notice Obtenir les détails d'un listing
     * @param tokenId ID du token
     * @return listing Détails du listing
     */
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
    
    /**
     * @notice Obtenir tous les listings actifs
     * @return tokenIds Array des tokenIds listés
     */
    function getActiveListings() external view returns (uint256[] memory) {
        return activeListings;
    }
    
    /**
     * @notice Obtenir les listings d'un vendeur
     * @param seller Adresse du vendeur
     * @return tokenIds Array des tokenIds du vendeur
     */
    function getSellerListings(address seller) external view returns (uint256[] memory) {
        return sellerTokens[seller];
    }
    
    /**
     * @notice Obtenir les revenus d'une adresse
     * @param seller Adresse à vérifier
     * @return amount Montant des revenus
     */
    function getProceeds(address seller) external view returns (uint256) {
        return proceeds[seller];
    }
    
    /**
     * @notice Nombre total de listings actifs
     * @return count Nombre de listings
     */
    function getActiveListingsCount() external view returns (uint256) {
        return activeListings.length;
    }

    // ===== FONCTIONS ADMIN =====
    
    /**
     * @notice Modifier la commission du marketplace (owner only)
     * @param _newFee Nouvelle commission en basis points
     */
    function setMarketplaceFee(uint256 _newFee) external onlyOwner {
        if (_newFee > MAX_MARKETPLACE_FEE) revert InvalidMarketplaceFee();
        
        uint256 oldFee = marketplaceFee;
        marketplaceFee = _newFee;
        
        emit MarketplaceFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @notice Modifier le destinataire des commissions (owner only)
     * @param _newRecipient Nouvelle adresse destinataire
     */
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        if (_newRecipient == address(0)) revert InvalidFeeRecipient();
        
        address oldRecipient = feeRecipient;
        feeRecipient = _newRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, _newRecipient);
    }
    
    /**
     * @notice Pause le contrat (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Reprendre le contrat
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Retirer un listing abusif (emergency only)
     * @param tokenId ID du token à retirer
     */
    function emergencyDelist(uint256 tokenId) external onlyOwner {
        Listing memory listing = listings[tokenId];
        if (listing.active) {
            _removeListing(tokenId, listing.seller);
            emit ItemDelisted(tokenId, listing.seller);
        }
    }

    // ===== FONCTIONS INTERNES =====
    
    /**
     * @dev Vérifier si le marketplace est approuvé pour un token
     */
    function _isApprovedForMarketplace(uint256 tokenId, address owner) 
        internal 
        view 
        returns (bool) 
    {
        return modularNFT.getApproved(tokenId) == address(this) ||
               modularNFT.isApprovedForAll(owner, address(this));
    }
    
    /**
     * @dev Calculer et distribuer les fonds lors d'un achat
     */
    function _distributeFunds(uint256 tokenId, uint256 totalPrice, address seller) 
        internal 
        returns (uint256 royaltyAmount, uint256 marketplaceFeeAmount) 
    {
        // 1. Calculer royalties créateur (EIP-2981)
        address royaltyRecipient;
        (royaltyRecipient, royaltyAmount) = _getRoyaltyInfo(tokenId, totalPrice);
        
        // 2. Calculer commission marketplace
        marketplaceFeeAmount = (totalPrice * marketplaceFee) / BASIS_POINTS;
        
        // 3. Calculer revenu vendeur
        uint256 sellerAmount = totalPrice - royaltyAmount - marketplaceFeeAmount;
        
        // 4. Distribuer les fonds
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            proceeds[royaltyRecipient] += royaltyAmount;
        }
        
        if (marketplaceFeeAmount > 0) {
            proceeds[feeRecipient] += marketplaceFeeAmount;
        }
        
        proceeds[seller] += sellerAmount;
    }
    
    /**
     * @dev Obtenir les informations de royalties
     */
    function _getRoyaltyInfo(uint256 tokenId, uint256 salePrice) 
        internal 
        view 
        returns (address receiver, uint256 royaltyAmount) 
    {
        // Vérifier si le contrat supporte EIP-2981
        if (IERC165(address(royaltyContract)).supportsInterface(type(IERC2981).interfaceId)) {
            return royaltyContract.royaltyInfo(tokenId, salePrice);
        }
        return (address(0), 0);
    }
    
    /**
     * @dev Supprimer un listing
     */
    function _removeListing(uint256 tokenId, address seller) internal {
        delete listings[tokenId];
        _removeFromSellerTokens(seller, tokenId);
        _removeFromActiveListings(tokenId);
    }
    
    /**
     * @dev Ajouter un token aux listings du vendeur
     */
    function _addToSellerTokens(address seller, uint256 tokenId) internal {
        sellerTokenIndex[seller][tokenId] = sellerTokens[seller].length;
        sellerTokens[seller].push(tokenId);
    }
    
    /**
     * @dev Retirer un token des listings du vendeur
     */
    function _removeFromSellerTokens(address seller, uint256 tokenId) internal {
        uint256 index = sellerTokenIndex[seller][tokenId];
        uint256 lastIndex = sellerTokens[seller].length - 1;
        
        if (index != lastIndex) {
            uint256 lastTokenId = sellerTokens[seller][lastIndex];
            sellerTokens[seller][index] = lastTokenId;
            sellerTokenIndex[seller][lastTokenId] = index;
        }
        
        sellerTokens[seller].pop();
        delete sellerTokenIndex[seller][tokenId];
    }
    
    /**
     * @dev Ajouter un token aux listings actifs
     */
    function _addToActiveListings(uint256 tokenId) internal {
        activeListingIndex[tokenId] = activeListings.length;
        activeListings.push(tokenId);
    }
    
    /**
     * @dev Retirer un token des listings actifs
     */
    function _removeFromActiveListings(uint256 tokenId) internal {
        uint256 index = activeListingIndex[tokenId];
        uint256 lastIndex = activeListings.length - 1;
        
        if (index != lastIndex) {
            uint256 lastTokenId = activeListings[lastIndex];
            activeListings[index] = lastTokenId;
            activeListingIndex[lastTokenId] = index;
        }
        
        activeListings.pop();
        delete activeListingIndex[tokenId];
    }
}