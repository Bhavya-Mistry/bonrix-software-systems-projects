// Script to find badge elements in the DOM
console.log('Searching for badge elements...');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Look for elements with class containing 'badge'
  const badgeElements = document.querySelectorAll('[class*="badge"]');
  console.log('Badge elements found:', badgeElements.length);
  
  badgeElements.forEach((el, index) => {
    console.log(`Badge ${index}:`, el);
    console.log('Text content:', el.textContent);
    console.log('HTML:', el.outerHTML);
    console.log('Classes:', el.className);
    console.log('Parent:', el.parentElement);
    console.log('-------------------');
  });

  // Look for MUI Badge components
  const muiBadges = document.querySelectorAll('.MuiBadge-root');
  console.log('MUI Badge components found:', muiBadges.length);
  
  muiBadges.forEach((el, index) => {
    console.log(`MUI Badge ${index}:`, el);
    console.log('Text content:', el.textContent);
    console.log('HTML:', el.outerHTML);
    console.log('Classes:', el.className);
    console.log('Parent:', el.parentElement);
    console.log('-------------------');
  });
});
