document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    } else {
        alert('Please install MetaMask!');
        return;
    }

    const connectButton = document.getElementById('connectWallet');
    const mintButton = document.getElementById('mintNFT');
    const switchNetworkButton = document.getElementById('switchNetworkButton');
    const remainingText = document.getElementById('remainingNFTText');
    let web3;
    let userAccount = null;
    const contractAddress = '0x656a7ca1ecf19006e97bf21445f3868a7fc52424';

    const contractABI = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "tokenAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "index",
                    "type": "uint256"
                }
            ],
            "name": "NFTIssued",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "NFTNotIssued",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amountInWei",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "index",
                    "type": "uint256"
                }
            ],
            "name": "issueNFT",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getNFTCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
    ];

    async function connectMetaMask() {
        console.log('Attempting to connect to MetaMask...');
        if (window.ethereum) {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                web3 = new Web3(window.ethereum);
                userAccount = accounts[0];
                connectButton.textContent = userAccount;
                mintButton.textContent = 'Mint';
                mintButton.removeEventListener('click', connectMetaMask);
                mintButton.addEventListener('click', mintNFT);

                const currentChainId = await ethereum.request({ method: 'eth_chainId' });
                console.log('Connected accounts:', accounts);
                if (currentChainId !== '0x138d4') {
                    showSwitchNetworkModal();
                } else {
                    console.log('Connected to MetaMask and Berachain bArtio Testnet');
                    updateMintButton();
                }
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this feature.');
        }
    }

    function showSwitchNetworkModal() {
        const modal = document.getElementById('nftModal');
        const message = document.getElementById('mintedNFTMessage');
        mintButton.textContent = 'Switch Network';
        mintButton.onclick = switchNetwork;
        message.textContent = 'Please switch to the Berachain bArtio Testnet';
        modal.style.display = 'block';
        console.log('Showing switch network modal');
    }

    async function switchNetwork() {
        console.log('Attempting to switch network...');
        if (window.ethereum) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: '0x138d4',
                            chainName: 'Berachain bArtio Testnet',
                            rpcUrls: ['https://bartio.rpc.berachain.com/'],
                            nativeCurrency: {
                                name: 'Berachain Token',
                                symbol: 'BERA',
                                decimals: 18,
                            },
                            blockExplorerUrls: ['https://bartio.beratrail.io/']
                        },
                    ],
                });
                console.log('Successfully added and switched to Berachain bArtio Testnet');
                enableMintButton();
                const modal = document.getElementById('nftModal');
                modal.style.display = 'none';
            } catch (addError) {
                console.error('Failed to add the network:', addError);
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this feature.');
        }
    }

    function enableMintButton() {
        mintButton.textContent = 'Mint';
        mintButton.onclick = mintNFT;
    }

    async function updateMintButton() {
        const nftCount = await getNFTCount();
        mintButton.textContent = `Mint (${nftCount} NFTs available)`;
        updateRemainingNFTText(nftCount);
    }

    async function getNFTCount() {
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const nftCount = await contract.methods.getNFTCount().call();
        return nftCount;
    }

    async function mintNFT() {
        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            const account = accounts[0];
    
            // Get the honey amount from the slider and convert it to a BigInt in Wei
            const honeyAmount = BigInt(document.getElementById('honey-slider').value) * BigInt(1e18);
    
            // ERC20 approve ABI
            const erc20ApproveABI = [
                {
                    "constant": false,
                    "inputs": [
                        { "name": "_spender", "type": "address" },
                        { "name": "_value", "type": "uint256" }
                    ],
                    "name": "approve",
                    "outputs": [{ "name": "", "type": "bool" }],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ];
    
            // Initialize the approve contract
            const approveContractAddress = '0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03';
            const approveContract = new web3.eth.Contract(erc20ApproveABI, approveContractAddress);
    
            // Approve the token transfer
            await approveContract.methods.approve(contractAddress, honeyAmount.toString()).send({ from: account });
            console.log('Approve transaction successful');
    
            // Initialize the NFT contract
            const nftContract = new web3.eth.Contract(contractABI, contractAddress);
    
            // Get the number of available NFTs
            const nftCount = Number(await nftContract.methods.getNFTCount().call());
    
            if (nftCount === 0) {
                alert('No NFTs available to mint');
                return;
            }
    
            // Generate a random index within the valid range (0 to nftCount - 1)
            const randomIndex = Math.floor(Math.random() * nftCount).toString();
    
            // Call the issueNFT function with account, honeyAmount, and randomIndex
            const tx = await nftContract.methods.issueNFT(account, honeyAmount.toString(), randomIndex).send({ from: account });
    
            console.log('Transaction events:', tx.events);
    
            // Handle transaction events
            if (tx.events && tx.events.NFTIssued) {
                showMintModal(randomIndex); // Show modal with the NFT's image
                alert('Congratulations! You won an NFT!');
            } else if (tx.events && tx.events.NFTNotIssued) {
                alert('Sorry, you did not win.');
            } else {
                alert('Unknown result, please check the transaction details.');
            }
    
            updateMintButton(); // Update button text and remaining NFT count
    
        } catch (error) {
            console.error('Error minting NFT:', error);
            alert('Transaction failed: ' + error.message);
        }
    }

    function showMintModal(index) {
        const modal = document.getElementById('nftModal');
        const message = document.getElementById('mintedNFTMessage');
        const nftImage = document.getElementById('mintedNFTImage');
        const downloadButton = document.getElementById('downloadNFTButton');
        const imageUrls = [
            "https://pink-real-crow-67.mypinata.cloud/ipfs/QmZ9orbhNwzEjDxynPpqwgVUnhHY29C3AzGtLabsjm1CD4",
            "https://pink-real-crow-67.mypinata.cloud/ipfs/QmVqJfZJxnGbfNQFp38FjJq1fWoEWZiJHALQmprDQLat5F",
            'https://pink-real-crow-67.mypinata.cloud/ipfs/Qmadkwe5mRm2FHHw3Hb92Gxmjsmx3E11kejoFKxBXdQ2Hz',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmeotQEmo1Jczgc9ULXwJ4gke6SQa8m7hAbYyi2SQyD33J',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmaETZuaUGJvZccFkS6gfPXL2UbGJk9GA51rQV76FXWfWY',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmcraEcx1cTV7V5oQPWLSCbqpuLdFT5F7oe4ErmQY1cxiD',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmcteaZx8y6kMifBFBMaLpZyZjWVU2TpbYKNTNLKpvvxZz',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmWX8CetncgZVn329xAsVfBU89kd2B1Yam1RXa6DGyVUEg',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmeMJtDQM9iZE8V5poHHr199p8RhWCTqd2RoSN9D1z8JxU',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmaSvsJ7TwHwuZftH1XTKQpSaybadjoEW3xL4xkojfk8R1',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmW4AUSVgRR6n41RMjfm2baYJo8haEUv8e6gmWjGZG3kbJ',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmeN516ithKAwudXhDN5NL1LtuCVCeEPsGCauiE1psFWmH',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmQPbQ3Nq4ALG1ek8NFqpCBDiZg3uBEHVQFUAqGdcCknaw',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmdmSDajgoyL9X3jiu47HzMiSSS5dWYikYoTJXKYVkL2PQ',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmeKd9aTYvqkeGaqfzx7GmqEfUDoPxnHyo2LNN8fr3skQG',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmNpcBRmDau51QafngtjxUB4aqTE4SQA6RCd883Rb9D6rY',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmdiiChGAH82q6fmSh714NSFGyW4qR1vQRinbUSWcstkxC',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmXQopdjAojgoqrMeuNhtTu4pvh35Gwb4nKzGNUnR7MZmV',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmYTbHKjGiCBrCs4GVg9MVKg1dyQNCJdafS5hxhKpTvXDe',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmWpuaxjf8L659gBjN8EUAJStu2bs9f7Dzgg8JVGKeWah6',
            'https://pink-real-crow-67.mypinata.cloud/ipfs/QmbcrBnS6LXQz9oLDSFK6dgpxUvKb7UgtybEiKr5JPkBpg',
        ];
    
        if (message && nftImage && downloadButton) {
            message.textContent = 'Congrats!';
            nftImage.src = imageUrls[index] || '';
            nftImage.style.display = 'block';
            downloadButton.style.display = 'block';
            downloadButton.onclick = () => {
                window.open(imageUrls[index], '_blank');
            };
        }
    
        if (modal) {
            modal.style.display = 'block';
        }
    
        const switchNetworkButton = document.getElementById('switchNetworkButton');
        if (switchNetworkButton) {
            switchNetworkButton.style.display = 'none';
        }
    
        const mintButton = document.getElementById('mintButton');
        if (mintButton) {
            mintButton.textContent = 'Mint';
        }
    }
    // Close modal logic
    document.querySelector('.close')?.addEventListener('click', () => {
        const modal = document.getElementById('nftModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        const switchNetworkButton = document.getElementById('switchNetworkButton');
        if (switchNetworkButton) {
            switchNetworkButton.style.display = 'block';  // Reset after modal closes
        }
    });

    document.addEventListener('mousemove', function(e) {
        var bearEmoji = document.createElement('img');
        bearEmoji.src = 'bera_face.png'; // Путь к вашему файлу с изображением
        bearEmoji.style.position = 'absolute';
        bearEmoji.style.left = e.pageX + 'px';
        bearEmoji.style.top = e.pageY + 'px';
        bearEmoji.style.width = '30px'; // Размер изображения медведя
        bearEmoji.style.height = '30px';
        bearEmoji.style.pointerEvents = 'none';
        bearEmoji.style.opacity = '1';
        bearEmoji.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
    
        document.body.appendChild(bearEmoji);
    
        setTimeout(function() {
          bearEmoji.style.opacity = '0';
          bearEmoji.style.transform = 'scale(0.5)';
        }, 50);
    
        setTimeout(function() {
          bearEmoji.remove();
        }, 1000);
      });

    
    document.addEventListener('DOMContentLoaded', () => {
        const slider = document.getElementById('honey-slider');
        const output = document.getElementById('honey-output');
    
        slider.addEventListener('input', () => {
            output.value = this.value + " 🍯";
        });
    });

    function createFallingImages() {
        const numberOfImages = 300; // Number of images to fall at the same time
        const images = ['bera_face.png', 'chain.png']; // Array of images
    
        for (let i = 0; i < numberOfImages; i++) {
          const img = document.createElement('img');
          img.src = images[Math.floor(Math.random() * images.length)];
          img.className = 'falling-image';
          img.style.left = Math.random() * window.innerWidth + 'px';
          img.style.animationDuration = Math.random() * 3 + 2 + 's'; // Random animation duration
          img.style.animationDelay = Math.random() * 0.1 + 's'; // Random animation delay
          document.body.appendChild(img);
    
          // Remove image after animation ends
          img.addEventListener('animationend', () => {
            document.body.removeChild(img);
            createFallingImages(); // Repeat image creation for infinite animation
          });
        }
      }
    
      window.addEventListener('load', createFallingImages);
    
      function createRandomBerachainImage() {
        const berachainImage = document.createElement('img');
        berachainImage.src = 'berachain.png'; // Path to your berachain image
        berachainImage.style.position = 'absolute';
        berachainImage.style.left = `${Math.random() * window.innerWidth}px`;
        berachainImage.style.top = `${Math.random() * window.innerHeight}px`;
        berachainImage.style.width = '100px'; // Image size
        berachainImage.style.height = '100px';
        berachainImage.style.pointerEvents = 'none';
        berachainImage.style.opacity = '1';
        berachainImage.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
    
        document.body.appendChild(berachainImage);
    
        setTimeout(function() {
          berachainImage.style.opacity = '0';
          berachainImage.style.transform = 'scale(0.5)';
        }, 1000);
    
        setTimeout(function() {
          berachainImage.remove();
        }, 2000);
      }
    
      setInterval(createRandomBerachainImage, 100);
    
      connectButton.addEventListener('click', connectMetaMask); // Добавляем слушатель для кнопки Connect MetaMask
      mintButton.addEventListener('click', connectMetaMask); // Добавляем слушатель для кнопки Mint
      switchNetworkButton.addEventListener('click', switchNetwork); // Добавляем слушатель для кнопки Switch Network
    });
  
// Добавляем новый обработчик кликов для изменения фона и курсора
document.addEventListener('click', (event) => {
    if (!event.target.closest('button')) {
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF', '#FFFFFF'];
        const cursors = ['point.png', 'finger.png', 'big.png', 'ooga.png'];

        // Выбираем случайный цвет или фон
        const randomColorChoice = Math.floor(Math.random() * (colors.length + 1));
        if (randomColorChoice === colors.length) {
            document.body.style.backgroundImage = 'url("fon2.png")';
            document.body.style.backgroundSize = 'cover';
        } else {
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = colors[randomColorChoice];
        }

        // Выбираем случайный курсор
        const randomCursorChoice = cursors[Math.floor(Math.random() * cursors.length)];
        const cursorUrl = `url('${randomCursorChoice}'), auto`;

        // Применяем курсор к body и всем указанным элементам
        document.body.style.cursor = cursorUrl;
        document.querySelectorAll('button, .connect-wallet, #honey-output, .honey-slider, .slider-container, .x-link, .header, .container, .mint-button, .animated-text, .animated-text-small, .animated-text-small_second, .animated-text-large, .close-button, #counter, .modal-content img')
            .forEach(element => {
                element.style.cursor = cursorUrl;
            });
    }
});

    function updateRemainingNFTText(remaining) {
        const remainingNFTText = document.getElementById('remainingNFTText');
        if (remainingNFTText) {
            remainingNFTText.textContent = `${remaining} NFTs remaining`;
        }
    }
    
    connectButton.addEventListener('click', connectMetaMask);
