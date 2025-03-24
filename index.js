let index = 0;
function slideImages() {
    const images = document.querySelectorAll('.carousel img');
    images.forEach(img => img.classList.remove('active'));
    index = (index + 1) % images.length;
    images[index].classList.add('active');
}
setInterval(slideImages, 3000);

        window.addEventListener("scroll", function () {
        const rightContent = document.querySelector(".right-content");
        const scrollY = window.scrollY;
        rightContent.style.transform = `translateY(${scrollY * 0.2}px)`;
    });


