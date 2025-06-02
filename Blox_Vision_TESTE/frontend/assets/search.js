// Enhanced search system for BloxVision
document.addEventListener('DOMContentLoaded', function() {
  // Get the search bar element
  const searchBar = document.querySelector('.search-bar input');
  
  // Create search type selector container
  const searchTypeContainer = document.createElement('div');
  searchTypeContainer.className = 'search-type-selector';
  searchTypeContainer.style.display = 'none';
  
  // Create the search type buttons
  const videosButton = document.createElement('button');
  videosButton.innerHTML = '<img src="/frontend/icons/video-icon.webp"><span>Vídeos</span>';
  videosButton.className = 'search-type-btn active';
  
  const usersButton = document.createElement('button');
  usersButton.innerHTML = '<img src="/frontend/icons/user-icon.webp"><span>Usuários</span>';
  usersButton.className = 'search-type-btn';
  
  // Append buttons to container
  searchTypeContainer.appendChild(videosButton);
  searchTypeContainer.appendChild(usersButton);
  
  // Insert the container after the search bar
  searchBar.parentNode.appendChild(searchTypeContainer);
  
  // Current search type (default to videos)
  let currentSearchType = 'videos';
  
  // Event listeners
  searchBar.addEventListener('input', function() {
    if (searchBar.value.length > 0) {
      searchTypeContainer.style.display = 'flex';
    } else {
      searchTypeContainer.style.display = 'none';
    }
  });
  
  searchBar.addEventListener('focus', function() {
    if (searchBar.value.length > 0) {
      searchTypeContainer.style.display = 'flex';
    }
  });
  
  document.addEventListener('click', function(e) {
    if (!searchBar.contains(e.target) && !searchTypeContainer.contains(e.target)) {
      searchTypeContainer.style.display = 'none';
    }
  });
  
  searchBar.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') performSearch();
  });
  
  videosButton.addEventListener('click', function() {
    currentSearchType = 'videos';
    videosButton.classList.add('active');
    usersButton.classList.remove('active');
    performSearch();
  });
  
  usersButton.addEventListener('click', function() {
    currentSearchType = 'users';
    usersButton.classList.add('active');
    videosButton.classList.remove('active');
    performSearch();
  });
  
  function performSearch() {
    const query = searchBar.value.trim();
    if (query.length === 0) return;
    
    const searchUrl = currentSearchType === 'videos' 
      ? `/frontend/search/video.html?q=${encodeURIComponent(query)}`
      : `/frontend/search/users.html?q=${encodeURIComponent(query)}`;
    
    window.location.href = searchUrl;
  }
});