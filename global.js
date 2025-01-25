console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
// let navLinks = $$("nav a");

// // Step 2.2: Find the link to the current page
// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
// );

// // Step 2.3: Add the current class to the current page link
// currentLink?.classList.add('current');
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'resume/index.html', title: 'Resume' },
    { url: 'https://github.com/boruilin', title: 'Profile' },
  ];
  
  // Create <nav> and prepend it to <body>
  let nav = document.createElement('nav');
  document.body.prepend(nav);
  
  // Check if we're on the home page
  const ARE_WE_HOME = document.documentElement.classList.contains('home');
  
  // Add links dynamically
//   for (let p of pages) {
//     let url = p.url;
//     let title = p.title;
  
//     // Adjust the URL if not on the home page and the URL is not absolute
//     url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
//     // Create link and add it to nav
//     nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
//   }
for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    // Adjust the URL if not on the home page and the URL is not absolute
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
    // Create a new <a> element
    let a = document.createElement('a');  // NEW: Use createElement instead of inserting HTML
    a.href = url;                         // NEW: Set the href attribute
    a.textContent = title;                // NEW: Set the text of the link
  
    // Highlight the current page
    a.classList.toggle(                   // NEW: Add the `current` class dynamically
      'current',
      a.host === location.host && a.pathname === location.pathname
    );
  
    // Open external links in a new tab
    a.toggleAttribute('target', a.host !== location.host);  // NEW: Add target="_blank" conditionally
  
    // Append the link to the <nav>
    nav.append(a);  // NEW: Use append instead of insertAdjacentHTML
  }
  