const images = [
    'bear.png', // путь к вашему изображению медведя
    'chain.png' // путь к вашему изображению цепи
];

function createFallingImage() {
    const image = document.createElement('img');
    image.src = images[Math.floor(Math.random() * images.length)];
    image.classList.add('falling-image');
    document.body.appendChild(image);

    image.style.left = `${Math.random() * 100}vw`;
    image.style.animationDuration = `${5 + Math.random() * 5}s`;

    image.addEventListener('animationend', () => {
        image.remove();
    });
}

setInterval(createFallingImage, 1000);