document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const searchQueryElement = document.getElementById('search-query');
  const loadingIndicator = document.getElementById('loading-indicator');
  const noResultsElement = document.getElementById('no-results');
  const videoGrid = document.getElementById('video-results');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  // State variables
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  let currentPage = 1;
  let currentSort = 'recent';
  let currentFilter = null;
  let hasMoreResults = true;

  // Initialize
  searchQueryElement.textContent = query;

  // Function to fetch videos from API
  async function fetchVideos(searchQuery, typeFilter = null, sortBy = 'recent', page = 1) {
    try {
      const API_BASE_URL = 'http://localhost:3000';
      let url = `${API_BASE_URL}/api/videos/search?q=${encodeURIComponent(searchQuery)}&page=${page}`;
      if (typeFilter) url += `&type=${typeFilter}`;
      if (sortBy) url += `&sort=${sortBy}`;
      
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch videos');
      
      const data = await response.json();
      return {
        videos: data.videos || [],
        hasMore: data.hasMore || (data.pagination?.page < data.pagination?.pages)
      };
    } catch (error) {
      console.error('Error fetching videos:', error);
      return { videos: [], hasMore: false };
    }
  }

  // Format duration as MM:SS
  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  // Create video card
  function createVideoCard(video) {
    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
      <a href="${video.type === 'short' ? '../video_page/short/short.html' : '../video_page/long/video.html'}?id=${video._id}" class="video-hover-container">
        <img class="thumbnail" src="${video.thumbnailUrl || '../icons/default-thumbnail.webp'}" alt="Thumbnail">
        <div class="video-overlay">
          ${video.type === 'short' ? '' : `<span class="duration">${formatDuration(video.duration)}</span>`}
          <span class="views">${video.views.toLocaleString()} visualizações</span>
        </div>
      </a>
      <div class="video-info">
        <h3>${video.title}</h3>
        <p class="video-description">${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''}</p>
      </div>
    `;

    return card;
  }
  
  // Main search function
  async function performSearch(typeFilter = null, sortBy = currentSort, page = 1, append = false) {
    // Show loading state
    loadingIndicator.style.display = 'flex';
    videoGrid.style.display = 'none';
    noResultsElement.style.display = 'none';
    loadMoreBtn.style.display = 'none';
    
    // Reset page if not appending
    if (!append) {
      currentPage = 1;
    }

    const result = await fetchVideos(query, typeFilter, sortBy, page);
    hasMoreResults = result.hasMore;
    
    // Hide loading
    loadingIndicator.style.display = 'none';
    
    // Handle no results
    if (result.videos.length === 0 && !append) {
      noResultsElement.style.display = 'block';
      return;
    }
    
    // Clear existing results if not appending
    if (!append) {
      videoGrid.innerHTML = '';
    }
    
    // Add new videos
    result.videos.forEach(video => {
      videoGrid.appendChild(createVideoCard(video));
    });
    
    // Show results
    videoGrid.style.display = 'grid';
    
    // Show load more button if there are more results
    if (hasMoreResults) {
      loadMoreBtn.style.display = 'block';
    }
    
    // Update current state
    currentPage = page;
    currentFilter = typeFilter;
    currentSort = sortBy;
  }
  
  // Filter buttons event listeners
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const filterValue = this.dataset.filter;
      let typeFilter = null;
      let sortBy = 'recent';
      
      if (filterValue === 'long') typeFilter = 'long';
      else if (filterValue === 'short') typeFilter = 'short';
      else if (filterValue === 'views') sortBy = 'views';
      
      performSearch(typeFilter, sortBy);
    });
  });
  
  // Load more button event listener
  loadMoreBtn.addEventListener('click', () => {
    if (hasMoreResults) {
      performSearch(currentFilter, currentSort, currentPage + 1, true);
    }
  });
  
  // Initial search
  performSearch();
});