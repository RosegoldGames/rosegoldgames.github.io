// Toggle mobile menu
const menuToggle = document.querySelector('.menu-toggle');
const navList = document.querySelector('nav ul');
const navLinks = document.querySelectorAll('nav ul li a');

menuToggle.addEventListener('click', () => {
  navList.classList.toggle('active');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('active');
  });
});