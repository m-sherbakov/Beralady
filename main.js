document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('mintNFT').addEventListener('click', mintNFT);

let web3;
let accounts;

// Адрес вашего смарт-контракта и его ABI
const contractAddress = '0x5da90b45da9f7f831a7cfa6d783229c1439f2ef7';
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "tokenURI",
                "type": "string"
            }
        ],
        "name": "createCollectible",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "tokenCounter",
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
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "minter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "NewNFTMinted",
        "type": "event"
    }
];

const metadataURIs = [
    "ipfs://QmT2s5uXpXaC1aMmDbuBFPpLMzWpwQY3ddT3wfeuE8UFxf",
    "ipfs://QmS96Ba2CQVu3MhJf6JZgeKVVaNHbHNhGhU1xtMFNfUbs2",
    "ipfs://QmRSiopNauRm8V1SC5ZvLDkHGpv1QS5EgDQjPFi3zWqNh3",
    "ipfs://QmWJrNi35t15xCwdWjQEdwYTnbQN5rZQHPFAcuxThrLZSv",
    "ipfs://QmQL5fHd1dhDVfRnRRCTXvvUDGRm9SNjMz3nopQBSrpfR5",
    "ipfs://QmcniWice1Wgc1KABP8vw6F9frVuZQoVioZC7G51oqtTjo",
    "ipfs://QmXYVLEd6ZQYbHVYtNCX63eV5hpKQCaKLCW5fuZT34pCak",
    "ipfs://QmNZ4j5zqNzuuskKEpL1dd7bEX3iUeHiCNWyJFLAPqqeUM",
    "ipfs://QmYLNDqhJNnaZz4Fdna4Qf2Pi6YK9LsEeS1fVa9vo1wsHA",
    "ipfs://QmYzkptfMrfaFDERsHGYc6N2LAo49zsgNonjZaUfctfqRS",
    "ipfs://Qme9NNzqkTwps4x2BPp8hm4N4hJU5wCkh3fJbDibU4c8p8",
    "ipfs://Qme63AmYMajZYEMgPcj5p7VXXoJqKQrxUFSJ32s4nKuvta",
    "ipfs://QmRvaft77Bn4cBzqYNiByEWpNDPXBMSwDqk2RHbX99dryW",
    "ipfs://QmaBiAXnGGqZQYNQs62cGiAJqSZ3gEbZ569LKLYE5R9Jcf",
    "ipfs://QmXAWUB8asfYb42Zhf8MUdjryat4VxoWJNSVJVtUTY4zX8",
    "ipfs://Qme9xP5FtYY3vavCKYDqgjdbvRRpoXk2U8dkUpcXg75AQD",
    "ipfs://QmTomF71ncQsaX3jfgwjFEAs3FTVw3jbUXNzBA62tajm7m",
    "ipfs://QmZRodvGf1ahhLzAi2JLnvnD5ULu4ksqJAzzYR91tjLCk3",
    "ipfs://QmXQWFR5QhRFvA2JtDYR3cAr2eZEbtdFdBjryJBHYseErQ",
    "ipfs://QmdMyDypRk7ckU29CEAsPG5nNuGZ2dujvye1wrGPVk5TcT",
    "ipfs://QmX1Y7zGm1VYkpia3HqMUwA48LaHfEWFnjuJVvSMBR873x"
];

const imageURIs = [
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmZ9orbhNwzEjDxynPpqwgVUnhHY29C3AzGtLabsjm1CD4",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmVqJfZJxnGbfNQFp38FjJq1fWoEWZiJHALQmprDQLat5F",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/Qmadkwe5mRm2FHHw3Hb92Gxmjsmx3E11kejoFKxBXdQ2Hz",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmeotQEmo1Jczgc9ULXwJ4gke6SQa8m7hAbYyi2SQyD33J",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmaETZuaUGJvZccFkS6gfPXL2UbGJk9GA51rQV76FXWfWY",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmcraEcx1cTV7V5oQPWLSCbqpuLdFT5F7oe4ErmQY1cxiD",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmcteaZx8y6kMifBFBMaLpZyZjWVU2TpbYKNTNLKpvvxZz",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmWX8CetncgZVn329xAsVfBU89kd2B1Yam1RXa6DGyVUEg",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmeMJtDQM9iZE8V5poHHr199p8RhWCTqd2RoSN9D1z8JxU",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmaSvsJ7TwHwuZftH1XTKQpSaybadjoEW3xL4xkojfk8R1",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmW4AUSVgRR6n41RMjfm2baYJo8haEUv8e6gmWjGZG3kbJ",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmeN516ithKAwudXhDN5NL1LtuCVCeEPsGCauiE1psFWmH",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmQPbQ3Nq4ALG1ek8NFqpCBDiZg3uBEHVQFUAqGdcCknaw",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmdmSDajgoyL9X3jiu47HzMiSSS5dWYikYoTJXKYVkL2PQ",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmeKd9aTYvqkeGaqfzx7GmqEfUDoPxnHyo2LN8fr3skQG",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmNpcBRmDau51QafngtjxFt7QHEJsaZCayACBuD5vW5SSc",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmQ6aGLgubvdK9h8GJoEuUNU95iEpHpK5iDgHBMF4m3Jiu <----- неверный",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/Qmdn7Ti6dLShzQd3xWaHLkXoHqrmAXpKHPAw8M4JYd6rY <----- неверный",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmdiiChGAH82q6fmSh714NSFGyW4qR1vQRinbUSWcstkxC",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmXQopdjAojgoqrMeuNhtTu4pvh35Gwb4nKzGNUnR7MZmV",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmYTbHKjGiCBrCs4GVg9MVKg1dyQNCJdafS5hxhKpTvXDe",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmWpuaxjf8L659gBjN8EUAJStu2bs9f7Dzgg8JVGKeWah6",
    "https://pink-real-crow-67.mypinata.cloud/ipfs/QmbcrBnS6LXQz9oLDSFK6dgpxUvKb7UgtybEiKr5JPkBpg"
];

async function connectWallet() {
    if (window.ethereum) {
        try {
            accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            console.log('Connected account:', accounts[0]);
            updateWalletButton(accounts[0]);
            await checkNetwork();
        } catch (error) {
            console.error('Error connecting to MetaMask', error);
        }
    } else {
        console.error('MetaMask not installed');
        alert('MetaMask is not installed. Please install it to use this app.');
    }
}

async function checkNetwork() {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log(`Current chainId: ${chainId}`);
    const berachainTestnetChainId = parseInt('80084', 10);
    if (parseInt(chainId, 16) !== berachainTestnetChainId) {
        alert('Please switch your network to Berachain bArtio Testnet. Network: Berachain bArtio Testnet, Chain ID: 80084');
    }
}

async function mintNFT() {
    console.log('Mint button clicked');
    if (!accounts || accounts.length === 0) {
        alert('Please connect your wallet first.');
        return;
    }

    const chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log(`Current chainId: ${chainId}`);
    const berachainTestnetChainId = parseInt('80084', 10);
    if (parseInt(chainId, 16) !== berachainTestnetChainId) {
        alert('Please switch your network to Berachain bArtio Testnet. Network: Berachain bArtio Testnet, Chain ID: 80084');
        return;
    }

    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const randomIndex = Math.floor(Math.random() * metadataURIs.length);
    const tokenURI = metadataURIs[randomIndex];
    const imageURI = imageURIs[randomIndex];

    try {
        const result = await contract.methods.createCollectible(tokenURI).send({ from: accounts[0] });
        console.log('Minting result:', result);

        // Показать изображение и текст "Поздравляем!" сразу после успешной транзакции
        showMintedNFT(imageURI); 
        alert('NFT Minted Successfully!');
    } catch (error) {
        console.error('Error minting NFT:', error);
        alert(`Error minting NFT: ${error.message}`);
    }
}

// Функция для отображения изображения заминченного NFT и текста "Поздравляем!"
function showMintedNFT(imageURI) {
    const container = document.createElement('div');
    container.className = 'minted-nft-container';

    const img = document.createElement('img');
    img.src = imageURI;
    img.alt = 'Minted NFT';
    container.appendChild(img);

    const wowText = document.createElement('p');
    wowText.className = 'wow-text';
    wowText.textContent = 'Congrats!';
    container.appendChild(wowText);

    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Open in a new tab';
    downloadButton.onclick = () => {
        const newTab = window.open(imageURI, '_blank');
        if (newTab) {
            newTab.focus();
        } else {
            alert('Please allow popups for this website');
        }
    };
    container.appendChild(downloadButton);

    document.body.appendChild(container);
}

// Функция для обновления кнопки кошелька
function updateWalletButton(address) {
    const walletButton = document.getElementById('connectWallet');
    walletButton.textContent = address;
    walletButton.classList.add('connected-wallet');
}

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

// Функция для создания и добавления падающих изображений
function createFallingImages() {
    const numberOfImages = 150; // Количество изображений, которые будут падать одновременно
    const images = ['bera_face.png']; // Массив с изображениями

    for (let i = 0; i < numberOfImages; i++) {
        const img = document.createElement('img');
        img.src = images[Math.floor(Math.random() * images.length)];
        img.className = 'falling-image';
        img.style.left = Math.random() * window.innerWidth + 'px';
        img.style.animationDuration = Math.random() * 3 + 2 + 's'; // Случайная продолжительность анимации
        img.style.animationDelay = Math.random() * 0.1 + 's'; // Случайная задержка анимации
        document.body.appendChild(img);

        // Удаление изображения после завершения анимации
        img.addEventListener('animationend', () => {
            document.body.removeChild(img);
            createFallingImages(); // Повторное создание изображений для бесконечной анимации
        });
    }
}

// Запуск функции при загрузке страницы
window.addEventListener('load', createFallingImages);

function createRandomBerachainImage() {
    const berachainImage = document.createElement('img');
    berachainImage.src = 'berachain.png'; // Путь к вашему изображению berachain
    berachainImage.style.position = 'absolute';
    berachainImage.style.left = `${Math.random() * window.innerWidth}px`;
    berachainImage.style.top = `${Math.random() * window.innerHeight}px`;
    berachainImage.style.width = '100px'; // Размер изображения
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

// Запуск функции для создания изображения каждые 3 секунды
setInterval(createRandomBerachainImage, 100);
