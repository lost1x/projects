function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateImages() {
    const images = document.querySelectorAll('.grid-item');
    images.forEach(image => {
        const randomNumber = getRandomNumber(1, 30);
        image.src = `asset/img/${randomNumber}.jpeg`;
    });
}
updateImages();
setInterval(updateImages, 6000);
let currentPage = 1;


const generalSlideshow = document.createElement('div');
generalSlideshow.className = 'grid-container';
document.body.appendChild(generalSlideshow);

const images = [
    { alt: 'Image 1', src: '' },
    { alt: 'Image 2', src: '' },
    { alt: 'Image 3', src: '' },
    { alt: 'Image 4', src: '' },
    { alt: 'Image 5', src: '' },
];

images.forEach(image => {
    const img = document.createElement('img');
    img.alt = image.alt;
    img.className = 'grid-item';
    img.src = image.src;
    generalSlideshow.appendChild(img);
});