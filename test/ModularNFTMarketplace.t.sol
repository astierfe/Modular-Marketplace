// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Test, console} from "../lib/forge-std/src/Test.sol";
import {ModularNFTMarketplace} from "../src/ModularNFTMarketplace.sol";
import {MockModularNFT} from "./mocks/MockModularNFT.sol";

/**
 * @title Tests pour ModularNFTMarketplace
 * @dev Tests unitaires du marketplace NFT
 */
contract ModularNFTMarketplaceTest is Test {
    // ===== VARIABLES D'ÉTAT =====
    
    ModularNFTMarketplace public marketplace;
    MockModularNFT public mockNFT;
    
    // Adresses de test
    address public owner = makeAddr("owner");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public feeRecipient = makeAddr("feeRecipient");
    
    // Constantes de test
    uint256 public constant MARKETPLACE_FEE = 250; // 2.5%
    uint256 public constant TOKEN_ID = 1;
    uint256 public constant LISTING_PRICE = 1 ether;
    
    // ===== EVENTS À TESTER =====
    event ProceedsWithdrawn(
        address indexed recipient,
        uint256 amount
    );
    
    event PriceUpdated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 oldPrice,
        uint256 newPrice
    );

    event ItemDelisted(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event ItemListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    
    event ItemSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 royaltyAmount,
        uint256 marketplaceFeeAmount
    );

    // ===== SETUP =====
    
    function setUp() public {
        // Setup owner
        vm.startPrank(owner);
        
        // 1. Déployer Mock NFT
        mockNFT = new MockModularNFT();
        
        // 2. Déployer Marketplace
        marketplace = new ModularNFTMarketplace(
            address(mockNFT),
            MARKETPLACE_FEE,
            feeRecipient
        );
        
        vm.stopPrank();
        
        // 3. Setup Alice avec ETH
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        
        // 4. Mint NFT à Alice
        vm.prank(owner);
        mockNFT.mint(alice, TOKEN_ID);
        
        // Vérifications setup
        assertEq(mockNFT.ownerOf(TOKEN_ID), alice);
        assertEq(address(marketplace.modularNFT()), address(mockNFT));
        assertEq(marketplace.marketplaceFee(), MARKETPLACE_FEE);
        assertEq(marketplace.feeRecipient(), feeRecipient);
    }

    // ===== TEST SIMPLE : LISTING =====
    
    /**
     * @dev Test basique : Alice liste son NFT
     */
    function testListItem() public {
        // === ARRANGE ===
        
        // Vérifier state initial
        assertEq(mockNFT.ownerOf(TOKEN_ID), alice);
        assertEq(marketplace.getActiveListingsCount(), 0);
        
        // === ACT ===
        
        vm.startPrank(alice);
        
        // 1. Alice approuve le marketplace
        mockNFT.setApprovalForAll(address(marketplace), true);
        
        // 2. Vérifier approbation
        assertTrue(mockNFT.isApprovedForAll(alice, address(marketplace)));
        
        // 3. Alice liste son NFT - avec expectation de l'event
        vm.expectEmit(true, true, false, true);
        emit ItemListed(TOKEN_ID, alice, LISTING_PRICE, block.timestamp);
        
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        
        vm.stopPrank();
        
        // === ASSERT ===
        
        // 4. Vérifier le listing
        ModularNFTMarketplace.Listing memory listing = marketplace.getListing(TOKEN_ID);
        assertEq(listing.tokenId, TOKEN_ID);
        assertEq(listing.seller, alice);
        assertEq(listing.price, LISTING_PRICE);
        assertTrue(listing.active);
        assertEq(listing.timestamp, block.timestamp);
        
        // 5. Vérifier que le NFT est toujours chez Alice
        assertEq(mockNFT.ownerOf(TOKEN_ID), alice);
        
        // 6. Vérifier les listes d'énumération
        assertEq(marketplace.getActiveListingsCount(), 1);
        
        uint256[] memory activeListings = marketplace.getActiveListings();
        assertEq(activeListings.length, 1);
        assertEq(activeListings[0], TOKEN_ID);
        
        uint256[] memory aliceListings = marketplace.getSellerListings(alice);
        assertEq(aliceListings.length, 1);
        assertEq(aliceListings[0], TOKEN_ID);
        
        // 7. Vérifier que Alice n'a pas encore de revenus
        assertEq(marketplace.getProceeds(alice), 0);
        
        console.log("Test listItem reussi !");
        console.log("- NFT", TOKEN_ID, "liste par", alice);
        console.log("- Prix:", LISTING_PRICE / 1e18, "ETH");
        console.log("- Listings actifs:", marketplace.getActiveListingsCount());
    }
    
    // ===== TEST D'ERREUR SIMPLE =====
    
    /**
     * @dev Test : Listing sans approbation doit echouer
     */
    function testListItemFailsWithoutApproval() public {
        vm.startPrank(alice);
        
        // Alice essaie de lister sans approuver -> doit revert
        vm.expectRevert(ModularNFTMarketplace.TokenNotApproved.selector);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        
        vm.stopPrank();
        
        console.log("Test revert sans approbation reussi !");
    }
    
    /**
     * @dev Test : Listing avec prix zero doit echouer
     */
    function testListItemFailsWithZeroPrice() public {
        vm.startPrank(alice);
        
        mockNFT.setApprovalForAll(address(marketplace), true);
        
        // Prix zero -> doit revert
        vm.expectRevert(ModularNFTMarketplace.InvalidPrice.selector);
        marketplace.listItem(TOKEN_ID, 0);
        
        vm.stopPrank();
        
        console.log("Test revert prix zero reussi !");
    }
    /**
     * @dev Test complet : Bob achète le NFT d'Alice
     */
    function testBuyItem() public {
        // === SETUP : Alice liste son NFT ===
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        // Vérifier que le listing existe
        assertTrue(marketplace.getListing(TOKEN_ID).active);
        assertEq(mockNFT.ownerOf(TOKEN_ID), alice);
        
        // === ARRANGE : Calculer les montants attendus ===
        
        // Royalty recipient = deployer du MockNFT (owner dans notre cas)
        address royaltyRecipient = owner;
        
        // Calculs selon les taux configurés
        uint256 expectedRoyalty = (LISTING_PRICE * 500) / 10000;        // 5% = 0.05 ETH
        uint256 expectedMarketplaceFee = (LISTING_PRICE * 250) / 10000; // 2.5% = 0.025 ETH
        uint256 expectedSellerAmount = LISTING_PRICE - expectedRoyalty - expectedMarketplaceFee; // 0.925 ETH
        
        // Vérifier balances initiales
        assertEq(marketplace.getProceeds(alice), 0);
        assertEq(marketplace.getProceeds(royaltyRecipient), 0);
        assertEq(marketplace.getProceeds(feeRecipient), 0);
        
        // === ACT : Bob achète le NFT ===
        
        vm.startPrank(bob);
        
        // Expectation de l'event ItemSold
        vm.expectEmit(true, true, true, true);
        emit ItemSold(
            TOKEN_ID,
            alice,                    // seller
            bob,                      // buyer  
            LISTING_PRICE,           // price
            expectedRoyalty,         // royaltyAmount
            expectedMarketplaceFee   // marketplaceFeeAmount
        );
        
        // Bob achète le NFT
        marketplace.buyItem{value: LISTING_PRICE}(TOKEN_ID);
        
        vm.stopPrank();
        
        // === ASSERT : Vérifier tous les résultats ===
        
        // 1. NFT transféré à Bob
        assertEq(mockNFT.ownerOf(TOKEN_ID), bob);
        
        // 2. Listing supprimé
        assertFalse(marketplace.getListing(TOKEN_ID).active);
        assertEq(marketplace.getActiveListingsCount(), 0);
        
        // 3. Arrays nettoyées
        uint256[] memory activeListings = marketplace.getActiveListings();
        assertEq(activeListings.length, 0);
        
        uint256[] memory aliceListings = marketplace.getSellerListings(alice);
        assertEq(aliceListings.length, 0);
        
        // 4. Proceeds correctement distribués
        assertEq(marketplace.getProceeds(alice), expectedSellerAmount);
        assertEq(marketplace.getProceeds(royaltyRecipient), expectedRoyalty);
        assertEq(marketplace.getProceeds(feeRecipient), expectedMarketplaceFee);
        
        // 5. Vérification des montants exacts
        assertEq(expectedSellerAmount, 0.925 ether);     // 92.5%
        assertEq(expectedRoyalty, 0.05 ether);          // 5%
        assertEq(expectedMarketplaceFee, 0.025 ether);  // 2.5%
        
        // 6. Total doit égaler le prix payé
        assertEq(
            expectedSellerAmount + expectedRoyalty + expectedMarketplaceFee, 
            LISTING_PRICE
        );
        
        // Debug info
        console.log("=== ACHAT REALISE ===");
        console.log("Prix total:", LISTING_PRICE / 1e18, "ETH");
        console.log("Alice (vendeur):", expectedSellerAmount / 1e18, "ETH");
        console.log("Createur (royalty):", expectedRoyalty / 1e18, "ETH");
        console.log("Marketplace (fee):", expectedMarketplaceFee / 1e18, "ETH");
        console.log("Nouveau owner:", bob);
    }
    
    /**
     * @dev Test erreur : Achat avec paiement insuffisant
     */
    function testBuyItemFailsWithInsufficientPayment() public {
        // Setup : Alice liste son NFT
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        // Bob essaie d'acheter avec trop peu d'ETH
        vm.startPrank(bob);
        vm.expectRevert(ModularNFTMarketplace.InsufficientPayment.selector);
        marketplace.buyItem{value: LISTING_PRICE - 1}(TOKEN_ID); // 1 wei de moins
        vm.stopPrank();
        
        console.log("Test revert paiement insuffisant reussi !");
    }
    
    /**
     * @dev Test erreur : Alice ne peut pas acheter son propre NFT
     */
    function testBuyItemFailsWhenBuyingOwnToken() public {
        // Setup : Alice liste son NFT
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        
        // Alice essaie d'acheter son propre NFT
        vm.expectRevert(ModularNFTMarketplace.CannotBuyOwnToken.selector);
        marketplace.buyItem{value: LISTING_PRICE}(TOKEN_ID);
        vm.stopPrank();
        
        console.log("Test revert achat propre token reussi !");
    }

   /**
     * @dev Test complet : Alice retire son listing
     */
    function testDelistItem() public {
        // === SETUP : Alice liste son NFT ===
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        // Vérifier état initial
        assertTrue(marketplace.getListing(TOKEN_ID).active);
        assertEq(marketplace.getActiveListingsCount(), 1);
        assertEq(marketplace.getSellerListings(alice).length, 1);
        assertEq(mockNFT.ownerOf(TOKEN_ID), alice);
        
        // === ACT : Alice retire son listing ===
        
        vm.startPrank(alice);
        
        // Expectation de l'event ItemDelisted
        vm.expectEmit(true, true, false, false);
        emit ItemDelisted(TOKEN_ID, alice);
        
        // Alice deliste son NFT
        marketplace.delistItem(TOKEN_ID);
        
        vm.stopPrank();
        
        // === ASSERT : Vérifier le nettoyage complet ===
        
        // 1. Listing marqué comme inactif
        assertFalse(marketplace.getListing(TOKEN_ID).active);
        
        // 2. NFT reste chez Alice (pas de transfert)
        assertEq(mockNFT.ownerOf(TOKEN_ID), alice);
        
        // 3. Compteurs mis à jour
        assertEq(marketplace.getActiveListingsCount(), 0);
        
        // 4. Arrays nettoyées
        uint256[] memory activeListings = marketplace.getActiveListings();
        assertEq(activeListings.length, 0);
        
        uint256[] memory aliceListings = marketplace.getSellerListings(alice);
        assertEq(aliceListings.length, 0);
        
        // 5. Pas de proceeds générés (pas de vente)
        assertEq(marketplace.getProceeds(alice), 0);
        assertEq(marketplace.getProceeds(feeRecipient), 0);
        
        console.log("=== DELISTING REALISE ===");
        console.log("NFT", TOKEN_ID, "retire de la vente par Alice");
        console.log("NFT reste chez:", mockNFT.ownerOf(TOKEN_ID));
        console.log("Listings actifs:", marketplace.getActiveListingsCount());
    }
    
    /**
     * @dev Test erreur : Bob ne peut pas delister le NFT d'Alice
     */
    function testDelistItemFailsWhenNotOwner() public {
        // Setup : Alice liste son NFT
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        // Bob essaie de delister le NFT d'Alice
        vm.startPrank(bob);
        vm.expectRevert(ModularNFTMarketplace.NotTokenOwner.selector);
        marketplace.delistItem(TOKEN_ID);
        vm.stopPrank();
        
        // Vérifier que le listing existe toujours
        assertTrue(marketplace.getListing(TOKEN_ID).active);
        
        console.log("Test revert delist par non-owner reussi !");
    }
    
    /**
     * @dev Test erreur : Impossible de delister un token non listé
     */
    function testDelistItemFailsWhenTokenNotListed() public {
        // Mint un NFT à Alice mais ne pas le lister
        vm.prank(owner);
        mockNFT.mint(alice, TOKEN_ID + 1);
        
        // Alice essaie de delister un NFT jamais listé
        vm.startPrank(alice);
        vm.expectRevert(ModularNFTMarketplace.TokenNotListed.selector);
        marketplace.delistItem(TOKEN_ID + 1);
        vm.stopPrank();
        
        console.log("Test revert delist token non liste reussi !");
    }
    
    /**
     * @dev Test erreur : Impossible de delister deux fois
     */
    function testDelistItemFailsWhenDoubleDelist() public {
        // Setup : Alice liste son NFT
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        
        // Alice deliste une première fois (OK)
        marketplace.delistItem(TOKEN_ID);
        
        // Alice essaie de delister à nouveau (FAIL)
        vm.expectRevert(ModularNFTMarketplace.TokenNotListed.selector);
        marketplace.delistItem(TOKEN_ID);
        vm.stopPrank();
        
        console.log("Test revert double delist reussi !");
    }
    
    /**
     * @dev Test workflow : List → Delist → Re-list
     */
    function testDelistThenRelistWorkflow() public {
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        
        // 1. List à 1 ETH
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        assertTrue(marketplace.getListing(TOKEN_ID).active);
        
        // 2. Delist
        marketplace.delistItem(TOKEN_ID);
        assertFalse(marketplace.getListing(TOKEN_ID).active);
        
        // 3. Re-list à 2 ETH (nouveau prix)
        uint256 newPrice = 2 ether;
        marketplace.listItem(TOKEN_ID, newPrice);
        
        // Vérifier nouveau listing
        ModularNFTMarketplace.Listing memory newListing = marketplace.getListing(TOKEN_ID);
        assertTrue(newListing.active);
        assertEq(newListing.price, newPrice);
        assertEq(newListing.seller, alice);
        
        vm.stopPrank();
        
        console.log("Test workflow List->Delist->Relist reussi !");
        console.log("Nouveau prix:", newPrice / 1e18, "ETH");
    }

       /**
     * @dev Test complet : Alice modifie le prix de son listing
     */
    function testUpdatePrice() public {
        // === SETUP : Alice liste son NFT à 1 ETH ===
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        // Vérifier état initial
        ModularNFTMarketplace.Listing memory initialListing = marketplace.getListing(TOKEN_ID);
        assertTrue(initialListing.active);
        assertEq(initialListing.price, LISTING_PRICE);
        assertEq(initialListing.seller, alice);
        uint256 initialTimestamp = initialListing.timestamp;
        
        // === ACT : Alice change le prix à 2 ETH ===
        
        uint256 newPrice = 2 ether;
        
        vm.startPrank(alice);
        
        // Expectation de l'event PriceUpdated
        vm.expectEmit(true, true, false, true);
        emit PriceUpdated(TOKEN_ID, alice, LISTING_PRICE, newPrice);
        
        // Alice met à jour le prix
        marketplace.updatePrice(TOKEN_ID, newPrice);
        
        vm.stopPrank();
        
        // === ASSERT : Vérifier la mise à jour ===
        
        ModularNFTMarketplace.Listing memory updatedListing = marketplace.getListing(TOKEN_ID);
        
        // 1. Prix mis à jour
        assertEq(updatedListing.price, newPrice);
        
        // 2. Autres champs inchangés
        assertTrue(updatedListing.active);
        assertEq(updatedListing.seller, alice);
        assertEq(updatedListing.tokenId, TOKEN_ID);
        assertEq(updatedListing.timestamp, initialTimestamp); // Timestamp ne change pas
        
        // 3. NFT toujours chez Alice
        assertEq(mockNFT.ownerOf(TOKEN_ID), alice);
        
        // 4. Compteurs inchangés
        assertEq(marketplace.getActiveListingsCount(), 1);
        assertEq(marketplace.getSellerListings(alice).length, 1);
        
        // 5. Pas de proceeds générés
        assertEq(marketplace.getProceeds(alice), 0);
        
        console.log("=== PRIX MIS A JOUR ===");
        console.log("Ancien prix:", LISTING_PRICE / 1e18, "ETH");
        console.log("Nouveau prix:", newPrice / 1e18, "ETH");
        console.log("Listing toujours actif:", updatedListing.active);
    }
    
    /**
     * @dev Test erreur : Bob ne peut pas modifier le prix du NFT d'Alice
     */
    function testUpdatePriceFailsWhenNotOwner() public {
        // Setup : Alice liste son NFT
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        // Bob essaie de modifier le prix
        vm.startPrank(bob);
        vm.expectRevert(ModularNFTMarketplace.NotTokenOwner.selector);
        marketplace.updatePrice(TOKEN_ID, 2 ether);
        vm.stopPrank();
        
        // Vérifier que le prix n'a pas changé
        assertEq(marketplace.getListing(TOKEN_ID).price, LISTING_PRICE);
        
        console.log("Test revert update prix par non-owner reussi !");
    }
    
    /**
     * @dev Test erreur : Prix zéro invalide
     */
    function testUpdatePriceFailsWithZeroPrice() public {
        // Setup : Alice liste son NFT
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        
        // Alice essaie de mettre prix = 0
        vm.expectRevert(ModularNFTMarketplace.InvalidPrice.selector);
        marketplace.updatePrice(TOKEN_ID, 0);
        vm.stopPrank();
        
        // Vérifier que le prix n'a pas changé
        assertEq(marketplace.getListing(TOKEN_ID).price, LISTING_PRICE);
        
        console.log("Test revert prix zero reussi !");
    }
    
    /**
     * @dev Test erreur : Token non listé
     */
    function testUpdatePriceFailsWhenTokenNotListed() public {
        // Mint un NFT à Alice mais ne pas le lister
        vm.prank(owner);
        mockNFT.mint(alice, TOKEN_ID + 1);
        
        // Alice essaie de modifier le prix d'un NFT non listé
        vm.startPrank(alice);
        vm.expectRevert(ModularNFTMarketplace.TokenNotListed.selector);
        marketplace.updatePrice(TOKEN_ID + 1, 2 ether);
        vm.stopPrank();
        
        console.log("Test revert update prix token non liste reussi !");
    }
    
    /**
     * @dev Test workflow : Multiples mises à jour de prix
     */
    function testMultiplePriceUpdates() public {
        // Setup : Alice liste son NFT à 1 ETH
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        
        // 1ère mise à jour : 1 ETH -> 2 ETH
        uint256 price1 = 2 ether;
        vm.expectEmit(true, true, false, true);
        emit PriceUpdated(TOKEN_ID, alice, LISTING_PRICE, price1);
        marketplace.updatePrice(TOKEN_ID, price1);
        assertEq(marketplace.getListing(TOKEN_ID).price, price1);
        
        // 2ème mise à jour : 2 ETH -> 0.5 ETH
        uint256 price2 = 0.5 ether;
        vm.expectEmit(true, true, false, true);
        emit PriceUpdated(TOKEN_ID, alice, price1, price2);
        marketplace.updatePrice(TOKEN_ID, price2);
        assertEq(marketplace.getListing(TOKEN_ID).price, price2);
        
        // 3ème mise à jour : 0.5 ETH -> 5 ETH
        uint256 price3 = 5 ether;
        vm.expectEmit(true, true, false, true);
        emit PriceUpdated(TOKEN_ID, alice, price2, price3);
        marketplace.updatePrice(TOKEN_ID, price3);
        assertEq(marketplace.getListing(TOKEN_ID).price, price3);
        
        vm.stopPrank();
        
        // Vérifications finales
        ModularNFTMarketplace.Listing memory finalListing = marketplace.getListing(TOKEN_ID);
        assertTrue(finalListing.active);
        assertEq(finalListing.price, price3);
        assertEq(marketplace.getActiveListingsCount(), 1);
        
        console.log("Test multiples updates prix reussi !");
        console.log("Prix final:", price3 / 1e18, "ETH");
    }
    
    /**
     * @dev Test workflow : Update prix puis achat
     */
    function testUpdatePriceThenBuy() public {
        // Setup : Alice liste son NFT à 1 ETH
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        
        // Alice change le prix à 3 ETH
        uint256 newPrice = 3 ether;
        marketplace.updatePrice(TOKEN_ID, newPrice);
        vm.stopPrank();
        
        // Bob achète au nouveau prix
        vm.startPrank(bob);
        marketplace.buyItem{value: newPrice}(TOKEN_ID);
        vm.stopPrank();
        
        // Vérifications
        assertEq(mockNFT.ownerOf(TOKEN_ID), bob);
        assertFalse(marketplace.getListing(TOKEN_ID).active);
        
        // Vérifier calculs avec nouveau prix
        uint256 expectedRoyalty = (newPrice * 500) / 10000;        // 5%
        uint256 expectedMarketplaceFee = (newPrice * 250) / 10000; // 2.5%
        uint256 expectedSellerAmount = newPrice - expectedRoyalty - expectedMarketplaceFee;
        
        assertEq(marketplace.getProceeds(alice), expectedSellerAmount);
        
        console.log("Test update prix puis achat reussi !");
        console.log("Prix final vente:", newPrice / 1e18, "ETH");
        console.log("Alice recoit:", expectedSellerAmount / 1e18, "ETH");
    }

        /**
     * @dev Test complet : Alice withdraw ses proceeds après vente
     */
    function testWithdrawProceeds() public {
        // === SETUP : Vente complète NFT ===
        
        // Alice liste et Bob achète
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        vm.startPrank(bob);
        marketplace.buyItem{value: LISTING_PRICE}(TOKEN_ID);
        vm.stopPrank();
        
        // Calculer montants attendus
        uint256 expectedRoyalty = (LISTING_PRICE * 500) / 10000;        // 0.05 ETH
        uint256 expectedMarketplaceFee = (LISTING_PRICE * 250) / 10000; // 0.025 ETH
        uint256 expectedSellerAmount = LISTING_PRICE - expectedRoyalty - expectedMarketplaceFee; // 0.925 ETH
        
        // Vérifier proceeds avant withdraw
        assertEq(marketplace.getProceeds(alice), expectedSellerAmount);
        assertEq(marketplace.getProceeds(owner), expectedRoyalty); // owner = royalty recipient
        assertEq(marketplace.getProceeds(feeRecipient), expectedMarketplaceFee);
        
        // === ACT : Alice withdraw ses proceeds ===
        
        // Enregistrer balance ETH avant
        uint256 aliceBalanceBefore = address(alice).balance;
        
        vm.startPrank(alice);
        
        // Expectation de l'event ProceedsWithdrawn
        vm.expectEmit(true, false, false, true);
        emit ProceedsWithdrawn(alice, expectedSellerAmount);
        
        // Alice withdraw
        marketplace.withdrawProceeds();
        
        vm.stopPrank();
        
        // === ASSERT : Vérifier le withdraw ===
        
        // 1. Proceeds d'Alice remis à zéro
        assertEq(marketplace.getProceeds(alice), 0);
        
        // 2. Balance ETH d'Alice augmentée
        uint256 aliceBalanceAfter = address(alice).balance;
        assertEq(aliceBalanceAfter, aliceBalanceBefore + expectedSellerAmount);
        
        // 3. Proceeds des autres inchangés
        assertEq(marketplace.getProceeds(owner), expectedRoyalty);
        assertEq(marketplace.getProceeds(feeRecipient), expectedMarketplaceFee);
        
        console.log("=== WITHDRAW ALICE REALISE ===");
        console.log("Montant retire:", expectedSellerAmount / 1e18, "ETH");
        console.log("Nouvelle balance Alice:", aliceBalanceAfter / 1e18, "ETH");
        console.log("Proceeds Alice restants:", marketplace.getProceeds(alice));
    }
    
    /**
     * @dev Test : Withdraw pour tous les bénéficiaires
     */
    function testWithdrawProceedsAllParties() public {
        // Setup : Vente complète
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        vm.startPrank(bob);
        marketplace.buyItem{value: LISTING_PRICE}(TOKEN_ID);
        vm.stopPrank();
        
        // Montants attendus
        uint256 expectedRoyalty = (LISTING_PRICE * 500) / 10000;
        uint256 expectedMarketplaceFee = (LISTING_PRICE * 250) / 10000;
        uint256 expectedSellerAmount = LISTING_PRICE - expectedRoyalty - expectedMarketplaceFee;
        
        // Balances avant withdraw
        uint256 aliceBalanceBefore = address(alice).balance;
        uint256 ownerBalanceBefore = address(owner).balance;
        uint256 feeRecipientBalanceBefore = address(feeRecipient).balance;
        
        // === Alice withdraw ===
        vm.startPrank(alice);
        marketplace.withdrawProceeds();
        vm.stopPrank();
        
        // === Owner (créateur) withdraw ===
        vm.startPrank(owner);
        marketplace.withdrawProceeds();
        vm.stopPrank();
        
        // === Fee recipient withdraw ===
        vm.startPrank(feeRecipient);
        marketplace.withdrawProceeds();
        vm.stopPrank();
        
        // === Vérifications finales ===
        
        // Tous proceeds à zéro
        assertEq(marketplace.getProceeds(alice), 0);
        assertEq(marketplace.getProceeds(owner), 0);
        assertEq(marketplace.getProceeds(feeRecipient), 0);
        
        // Balances mises à jour
        assertEq(address(alice).balance, aliceBalanceBefore + expectedSellerAmount);
        assertEq(address(owner).balance, ownerBalanceBefore + expectedRoyalty);
        assertEq(address(feeRecipient).balance, feeRecipientBalanceBefore + expectedMarketplaceFee);
        
        console.log("=== WITHDRAW TOUS BENEFICIAIRES ===");
        console.log("Alice:", expectedSellerAmount / 1e18, "ETH");
        console.log("Createur:", expectedRoyalty / 1e18, "ETH");
        console.log("Marketplace:", expectedMarketplaceFee / 1e18, "ETH");
    }
    
    /**
     * @dev Test erreur : Withdraw sans proceeds
     */
    function testWithdrawProceedsFailsWithNoProceeds() public {
        // Bob n'a jamais eu de proceeds
        vm.startPrank(bob);
        vm.expectRevert(ModularNFTMarketplace.NoProceeds.selector);
        marketplace.withdrawProceeds();
        vm.stopPrank();
        
        console.log("Test revert withdraw sans proceeds reussi !");
    }
    
    /**
     * @dev Test erreur : Double withdraw
     */
    function testWithdrawProceedsFailsOnDoubleWithdraw() public {
        // Setup : Vente pour générer proceeds
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        vm.startPrank(bob);
        marketplace.buyItem{value: LISTING_PRICE}(TOKEN_ID);
        vm.stopPrank();
        
        // Alice withdraw une première fois (OK)
        vm.startPrank(alice);
        marketplace.withdrawProceeds();
        
        // Alice essaie de withdraw à nouveau (FAIL)
        vm.expectRevert(ModularNFTMarketplace.NoProceeds.selector);
        marketplace.withdrawProceeds();
        vm.stopPrank();
        
        console.log("Test revert double withdraw reussi !");
    }
    
    /**
     * @dev Test : Proceeds s'accumulent avec plusieurs ventes
     */
    function testWithdrawProceedsAccumulation() public {
        // === Première vente ===
        
        vm.startPrank(alice);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, LISTING_PRICE);
        vm.stopPrank();
        
        vm.startPrank(bob);
        marketplace.buyItem{value: LISTING_PRICE}(TOKEN_ID);
        vm.stopPrank();
        
        uint256 expectedFirst = (LISTING_PRICE * 9250) / 10000; // 92.5% de 1 ETH
        assertEq(marketplace.getProceeds(alice), expectedFirst);
        
        // === Deuxième vente (Bob revend à Alice) ===
        
        uint256 secondPrice = 2 ether;
        
        vm.startPrank(bob);
        mockNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listItem(TOKEN_ID, secondPrice);
        vm.stopPrank();
        
        vm.startPrank(alice);
        marketplace.buyItem{value: secondPrice}(TOKEN_ID);
        vm.stopPrank();
        
        uint256 expectedSecond = (secondPrice * 9250) / 10000; // 92.5% de 2 ETH
        
        // Alice a maintenant ses proceeds de la première vente
        // Bob a ses proceeds de la deuxième vente
        assertEq(marketplace.getProceeds(alice), expectedFirst);
        assertEq(marketplace.getProceeds(bob), expectedSecond);
        
        // === Withdraw accumulés ===
        
        uint256 aliceBalanceBefore = address(alice).balance;
        uint256 bobBalanceBefore = address(bob).balance;
        
        vm.startPrank(alice);
        marketplace.withdrawProceeds();
        vm.stopPrank();
        
        vm.startPrank(bob);
        marketplace.withdrawProceeds();
        vm.stopPrank();
        
        // Vérifications
        assertEq(address(alice).balance, aliceBalanceBefore + expectedFirst);
        assertEq(address(bob).balance, bobBalanceBefore + expectedSecond);
        assertEq(marketplace.getProceeds(alice), 0);
        assertEq(marketplace.getProceeds(bob), 0);
        
        console.log("=== PROCEEDS ACCUMULES ===");
        console.log("Alice proceedings:", expectedFirst / 1e18, "ETH");
        console.log("Bob proceedings:", expectedSecond / 1e18, "ETH");
    }
}