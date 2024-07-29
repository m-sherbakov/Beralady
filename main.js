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
    let web3;
    let userAccount = null;
  
    async function connectMetaMask() {
      console.log('Attempting to connect to MetaMask...');
      if (window.ethereum) {
        try {
          const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
          web3 = new Web3(window.ethereum);
          userAccount = accounts[0];
          connectButton.textContent = userAccount;
          mintButton.textContent = 'Mint 🐻⛓';
          mintButton.removeEventListener('click', connectMetaMask);
          mintButton.addEventListener('click', mintNFT);
  
          const currentChainId = await ethereum.request({ method: 'eth_chainId' });
          console.log('Connected accounts:', accounts);
          if (currentChainId !== '0x138d4') {
            showSwitchNetworkModal();
          } else {
            console.log('Connected to MetaMask and Berachain bArtio Testnet');
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
      mintButton.textContent = 'Mint 🐻⛓';
      mintButton.onclick = mintNFT;
    }
  
    async function mintNFT() {
      console.log('Attempting to mint NFT...');
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const account = accounts[0];
      const contractAddress = '0x488c94071efa90acd2fc43ea5cb8fa9c94f6ddc3';
      const nftCount = await getNFTCount();
      const randomIndex = Math.floor(Math.random() * (nftCount + 1));
  
      try {
        const tx = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: account,
              to: contractAddress,
              data: getMintingData(account, randomIndex),
            },
          ],
        });
        showMintModal(randomIndex);
        console.log('Transaction sent:', tx);
      } catch (error) {
        console.error('Error minting NFT:', error);
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
        // Add more image URLs here
      ];
  
      message.textContent = 'Congrats!';
      nftImage.src = imageUrls[index];
      nftImage.style.display = 'block';
      downloadButton.style.display = 'block';
      downloadButton.onclick = () => {
        window.open(imageUrls[index], '_blank');
      };
      modal.style.display = 'block';
    }
  
    async function getNFTCount() {
      // Replace with actual call to get NFT count
      return 21; // Example value
    }
  
    function getMintingData(account, index) {
      // Replace with actual data for minting transaction
      return `0x...`; // Example data
    }
  
    document.querySelector('.close')?.addEventListener('click', () => {
      const modal = document.getElementById('nftModal');
      modal.style.display = 'none';
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

  // Добавляем новый обработчик кликов для изменения фона
  document.addEventListener('click', (event) => {
    if (!event.target.closest('button')) {
      const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF', '#FFFFFF'];
      const randomChoice = Math.floor(Math.random() * (colors.length + 1));
      if (randomChoice === colors.length) {
        document.body.style.backgroundImage = 'url("fon2.png")';
        document.body.style.backgroundSize = 'cover';
      } else {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = colors[randomChoice];
      }
    }
  });

