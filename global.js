console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'resume/index.html', title: 'Resume' },
  { url: 'https://github.com/boruilin', title: 'Profile' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home') || location.pathname === '/';

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust the URL if not on the home page and the URL is not absolute
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  // Create a new <a> element
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  if (url.startsWith('http')) {
    a.target = '_blank'; // Use explicit check for absolute URLs
  }

  // Append the link to the <nav>
  nav.append(a);
}

// Add the dark mode switch
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-switch">
      <option value="light dark" selected>Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`
);

// Get the <select> element
const themeSwitch = document.getElementById('theme-switch');

// Event listener for theme changes
themeSwitch.addEventListener('input', (event) => {
  const value = event.target.value;

  // Set the color-scheme property on the root element
  document.documentElement.style.setProperty('color-scheme', value);

  // Save the user's preference to localStorage
  localStorage.setItem('colorScheme', value);
});

// Apply the saved theme preference on page load
const savedTheme = localStorage.getItem('colorScheme');
if (savedTheme) {
  document.documentElement.style.setProperty('color-scheme', savedTheme);
  themeSwitch.value = savedTheme;
}
