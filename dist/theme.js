const themeButton=document.getElementById('theme-toggle');
function syncThemeButton(){const dark=document.documentElement.dataset.theme==='dark';themeButton.textContent=dark?'☀ Light mode':'☾ Dark mode';themeButton.setAttribute('aria-pressed',String(dark));themeButton.setAttribute('aria-label','Dark mode');document.querySelector('meta[name="theme-color"]').setAttribute('content',dark?'#111817':'#f6f7f9');}
themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('repo-radar-theme',theme)}catch{}syncThemeButton()});
syncThemeButton();
