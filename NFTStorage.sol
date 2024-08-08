// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTStorage is IERC721Receiver, Ownable {
    struct NFT {
        address tokenAddress;
        uint256 tokenId;
    }

    IERC20 public honeyToken;
    NFT[] private nfts;
    mapping(address => bool) private hasReceivedNFT;

    event NFTReceived(address indexed operator, address indexed from, uint256 tokenId, bytes data);
    event NFTIssued(address indexed to, address indexed tokenAddress, uint256 tokenId, uint256 index);
    event NFTNotIssued(address indexed to);
    event HoneyWithdrawn(address indexed owner, uint256 amount);

    constructor(address initialOwner, address _honeyToken) Ownable(initialOwner) {
        honeyToken = IERC20(_honeyToken);
    }

    function receiveNFT(address tokenAddress, uint256 tokenId) external onlyOwner {
        IERC721(tokenAddress).safeTransferFrom(msg.sender, address(this), tokenId);
        nfts.push(NFT(tokenAddress, tokenId));
        emit NFTReceived(msg.sender, address(this), tokenId, "");
    }

    function issueNFT(address to, uint256 amountInWei, uint256 index) external {
        require(!hasReceivedNFT[to], "User has already received an NFT");
        require(nfts.length > 0, "No NFTs available");
        require(index < nfts.length, "Invalid NFT index");

        require(honeyToken.transferFrom(msg.sender, address(this), amountInWei), "Token transfer failed");

        uint256 successChance = amountInWei * 100 / (10 * 10**18);
        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 100;

        if (randomValue < successChance) {
            NFT memory nft = nfts[index];
            IERC721(nft.tokenAddress).safeTransferFrom(address(this), to, nft.tokenId);
            emit NFTIssued(to, nft.tokenAddress, nft.tokenId, index);

            // Удаляем NFT из списка, сохраняя порядок
            nfts[index] = nfts[nfts.length - 1];
            nfts.pop();

            hasReceivedNFT[to] = true;
        } else {
            emit NFTNotIssued(to);
        }
    }

    function withdrawHoney(uint256 amountInWei) external onlyOwner {
        require(honeyToken.balanceOf(address(this)) >= amountInWei, "Insufficient balance");
        honeyToken.transfer(owner(), amountInWei);
        emit HoneyWithdrawn(owner(), amountInWei);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public override returns (bytes4) {
        emit NFTReceived(operator, from, tokenId, data);
        return this.onERC721Received.selector;
    }

    function getNFTCount() public view returns (uint256) {
        return nfts.length;
    }

    function getNFT(uint256 index) public view returns (address tokenAddress, uint256 tokenId) {
        require(index < nfts.length, "Invalid index");
        NFT memory nft = nfts[index];
        return (nft.tokenAddress, nft.tokenId);
    }
}
