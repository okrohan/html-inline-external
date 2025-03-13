document.addEventListener('DOMContentLoaded', () => {
  console.log('Script loaded');
  
  const heading = document.querySelector('h1');
  if (heading) {
    heading.addEventListener('click', () => {
      alert('Heading clicked!');
    });
  }
});