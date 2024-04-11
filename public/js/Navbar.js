const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');

navToggle.addEventListener('click', () => {
    navMenu.classList.add('show-menu');
})

navClose.addEventListener('click', () => {
    navMenu.classList.remove('show-menu');
})

const search = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const searchClose = document.getElementById('search-close');

searchBtn.addEventListener('click' , () => {
    search.classList.add('show-search');
})
 
searchClose.addEventListener('click' , () => {
    search.classList.remove('show-search');
})
