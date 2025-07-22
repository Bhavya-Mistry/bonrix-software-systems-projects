// Script to remove the notification badge with "99+"
(function() {
  // Function to remove notification badges
  function removeNotificationBadges() {
    // Try various selectors that might match the notification badge
    const selectors = [
      'div[data-badge="99+"]',
      '.MuiBadge-badge[data-badge="99+"]',
      'span.notranslate:not(.credit-badge .MuiBadge-badge)',
      'button[aria-label="notifications"]',
      '.MuiBadge-root:not(.credit-badge)',
      'img[alt*="notification"]',
      '.notification-badge',
      // Chrome DevTools specific selectors
      '.devtools-badge',
      '.dt-badge-value',
      '[data-icon="devtools-notification"]',
      // More general selectors
      '[data-badge]',
      '.MuiBadge-badge'
    ];
    
    // Try each selector
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Check if it's a notification badge (has "99+" or similar text)
        if (el.textContent && (
            el.textContent.includes('99') || 
            el.textContent.includes('+') ||
            el.getAttribute('data-badge') === '99+')) {
          // Don't remove credit badge
          if (!el.closest('.credit-badge')) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.width = '0';
            el.style.height = '0';
            el.style.position = 'absolute';
            el.style.pointerEvents = 'none';
            console.log('Removed notification badge:', el);
          }
        }
      });
    });
  }
  
  // Run on page load
  removeNotificationBadges();
  
  // Also run periodically to catch dynamically added elements
  setInterval(removeNotificationBadges, 1000);
  
  // Run when DOM changes
  const observer = new MutationObserver(removeNotificationBadges);
  observer.observe(document.body, { childList: true, subtree: true });
})();
