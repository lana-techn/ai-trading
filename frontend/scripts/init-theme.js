// Theme initialization script that runs immediately
// This ensures theme is applied before React renders to prevent flash

(function initTheme() {
  try {
    const root = document.documentElement;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    let isDark = false;
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      isDark = savedTheme === 'dark';
    } else {
      // Check system preference
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Apply theme immediately
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    
    console.log('Theme initialized:', isDark ? 'dark' : 'light');
    
  } catch (error) {
    console.warn('Failed to initialize theme:', error);
    // Default to light mode on error
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
})();