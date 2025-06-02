document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  let currentPage = 1;
  const limit = 10;
  
  // DOM Elements
  const searchQueryElement = document.getElementById('search-query');
  const loadingIndicator = document.getElementById('loading-indicator');
  const noResultsElement = document.getElementById('no-results');
  const userGrid = document.getElementById('user-results');
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  // Initialize
  searchQueryElement.textContent = query;
  
  // Function to fetch users from API
  async function fetchUsers(searchQuery, page = 1, limit = 10) {
    const API_BASE_URL = 'http://localhost:3000';
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friends/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return { users: [], pagination: { total: 0 } };
    }
  }
  
  // Create user card
  function createUserCard(user) {
    const card = document.createElement('a');
    card.className = 'user-card';
    card.href = `../user_profile/user_profile.html?id=${user._id}`;
    
    card.innerHTML = `
      <img src="${user.profilePicture || '../icons/default-profile.webp'}" alt="${user.username}">
      <div class="user-info">
        <h3>${user.username}</h3>
        <p>${user.email}</p>
      </div>
    `;
    
    return card;
  }
  
  // Main search function
  async function performSearch(page = 1, append = false) {
    // Show loading
    loadingIndicator.style.display = 'flex';
    userGrid.style.display = 'none';
    noResultsElement.style.display = 'none';
    loadMoreBtn.style.display = 'none';
    
    const result = await fetchUsers(query, page, limit);
    
    // Hide loading
    loadingIndicator.style.display = 'none';
    
    if (result.users.length === 0) {
      if (!append) {
        noResultsElement.style.display = 'block';
      }
      return;
    }
    
    // Show results
    if (!append) {
      userGrid.innerHTML = '';
    }
    
    result.users.forEach(user => {
      userGrid.appendChild(createUserCard(user));
    });
    
    userGrid.style.display = 'grid';
    
    // Show load more if there are more results
    if (result.pagination.pages > currentPage) {
      loadMoreBtn.style.display = 'block';
    }
  }
  
  // Load more handler
  loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    performSearch(currentPage, true);
  });
  
  // Initial search
  performSearch();
});