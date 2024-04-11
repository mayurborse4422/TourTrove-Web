document.addEventListener("DOMContentLoaded", function () {
    const carousel1 = document.querySelector(".indiatrip .carousel");
    const carousel2 = document.querySelector(".abroadtrip .carousel");
    const left1 = document.getElementById('left1');
    const left2 = document.getElementById('left2');
    const right1 = document.getElementById('right1');
    const right2 = document.getElementById('right2');

    const firstCard1 = carousel1.querySelector(".card");
    const firstCardWidth1 = firstCard1.offsetWidth;
    const firstCard2 = carousel2.querySelector(".card");
    const firstCardWidth2 = firstCard2.offsetWidth;

    let isDragging = false,
        startX,
        startScrollLeft;

    const dragStart = (e) => {
        isDragging = true;
        e.preventDefault();
        const carousel = e.target.closest(".carousel");
        carousel.classList.add("dragging");
        startX = e.pageX;
        startScrollLeft = carousel.scrollLeft;
    };

    const dragging = (e) => {
        if (!isDragging) return;
        const newScrollLeft = startScrollLeft - (e.pageX - startX);
        const carousel = e.target.closest(".carousel");
        if (newScrollLeft <= 0 || newScrollLeft >= carousel.scrollWidth - carousel.offsetWidth) {
            isDragging = false;
            return;
        }
        carousel.scrollLeft = newScrollLeft;
    };

    const dragStop = () => {
        isDragging = false;
        const carousel = document.querySelector(".carousel.dragging");
        if (carousel) {
            carousel.classList.remove("dragging");
        }
    };

    const autoplayCarousel = (carousel, firstCardWidth, delay) => {
        setInterval(() => {
            carousel.scrollLeft += firstCardWidth;
            if (carousel.scrollLeft >= carousel.scrollWidth - carousel.offsetWidth - 10) {
                carousel.scrollLeft = 0;
            }
        }, delay);
    };

    setTimeout(() => {
        autoplayCarousel(carousel1, firstCardWidth1, 3400);
        autoplayCarousel(carousel2, firstCardWidth2, 3900);
    }, 1600);

    carousel1.addEventListener("mousedown", dragStart);
    carousel2.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", dragging);
    document.addEventListener("mouseup", dragStop);

    left1.addEventListener("click", () => {
        carousel1.scrollLeft -= firstCardWidth1;
    });
    left2.addEventListener("click", () => {
        carousel2.scrollLeft -= firstCardWidth2;
    });
    right1.addEventListener("click", () => {
        carousel1.scrollLeft += firstCardWidth1;
    });
    right2.addEventListener("click", () => {
        carousel2.scrollLeft += firstCardWidth2;
    });
});

let flashMessage = document.getElementById('flashMessage');
if (flashMessage.innerHTML == "") {
    flashMessage.style.display = 'none';
}
else {
    if (flashMessage) {
        setTimeout(() => {
            flashMessage.style.display = 'none';
        }, 2500);
    }
}


