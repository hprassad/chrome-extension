(function () {
  function getDateRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 10);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }

  function getImdbSearchUrl() {
    const { start, end } = getDateRange();
    const params = new URLSearchParams({
      title_type: 'feature',
      primary_language: 'ta',
      release_date: `${start},${end}`,
    });
    return 'https://www.imdb.com/search/title/?' + params.toString();
  }

  function show(el) {
    el.classList.remove('hidden');
  }

  function hide(el) {
    el.classList.add('hidden');
  }

  function showLoading() {
    show(document.getElementById('loading'));
    hide(document.getElementById('error'));
    hide(document.getElementById('movies-list'));
    hide(document.getElementById('open-imdb-bar'));
  }

  function showError(message) {
    hide(document.getElementById('loading'));
    show(document.getElementById('error'));
    document.getElementById('error-message').textContent = message;
    document.getElementById('open-imdb-fallback').href = getImdbSearchUrl();
    hide(document.getElementById('movies-list'));
    show(document.getElementById('open-imdb-bar'));
    document.getElementById('open-imdb-link').href = getImdbSearchUrl();
  }

  function showMovies(movies, imdbUrl) {
    hide(document.getElementById('loading'));
    hide(document.getElementById('error'));
    const list = document.getElementById('movies-list');
    list.innerHTML = '';

    const bar = document.getElementById('open-imdb-bar');
    document.getElementById('open-imdb-link').href = imdbUrl;
    show(bar);

    if (!movies.length) {
      const empty = document.createElement('div');
      empty.className = 'no-movies card';
      empty.textContent = 'No Tamil movies found in the last 10 days. Open IMDb to check.';
      list.appendChild(empty);
      show(list);
      return;
    }

    movies.forEach((movie) => {
      const a = document.createElement('a');
      a.className = 'movie-card';
      a.href = movie.url;
      a.target = '_blank';
      a.rel = 'noopener';

      const img = document.createElement('img');
      img.className = 'movie-poster';
      img.alt = movie.title;
      img.src = movie.poster || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="90" viewBox="0 0 60 90"><rect fill="%23333" width="60" height="90"/><text x="30" y="48" fill="%23999" font-size="10" text-anchor="middle">No image</text></svg>');

      const info = document.createElement('div');
      info.className = 'movie-info';
      const title = document.createElement('h3');
      title.className = 'movie-title';
      title.textContent = movie.title;
      const meta = document.createElement('p');
      meta.className = 'movie-date';
      const parts = [];
      if (movie.year) parts.push(movie.year);
      if (movie.runtime) parts.push(movie.runtime);
      meta.textContent = parts.length ? parts.join(' · ') : '—';
      info.appendChild(title);
      info.appendChild(meta);
      if (movie.director) {
        const directorEl = document.createElement('p');
        directorEl.className = 'movie-director';
        directorEl.textContent = 'Director: ' + movie.director;
        info.appendChild(directorEl);
      }
      if (movie.stars) {
        const starsEl = document.createElement('p');
        starsEl.className = 'movie-stars';
        starsEl.textContent = 'Stars: ' + movie.stars;
        info.appendChild(starsEl);
      }
      if (movie.rating) {
        const rating = document.createElement('span');
        rating.className = 'movie-rating';
        rating.textContent = '★ ' + movie.rating;
        info.appendChild(rating);
      }
      a.appendChild(img);
      a.appendChild(info);
      list.appendChild(a);
    });
    show(list);
  }

  function parseImdbSearchHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const movies = [];
    // IMDb search results: links to /title/ttXXXXX/ inside list items
    const links = doc.querySelectorAll('a[href*="/title/tt"]');
    const seen = new Set();
    for (const a of links) {
      const href = a.getAttribute('href') || '';
      const match = href.match(/\/title\/(tt\d+)\//);
      if (!match) continue;
      const id = match[1];
      if (seen.has(id)) continue;
      const titleEl = a.querySelector('span') || a;
      const title = (titleEl.textContent || '').trim();
      if (!title || title.length > 120) continue;
      seen.add(id);
      const fullUrl = href.startsWith('http') ? href : 'https://www.imdb.com' + href.split('?')[0];
      const li = a.closest('li');
      let year = '';
      let runtime = '';
      let rating = '';
      let poster = '';
      let director = '';
      let stars = '';
      if (li) {
        const text = li.textContent || '';
        const yearMatch = text.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) year = yearMatch[0];
        const runtimeMatch = text.match(/(\d+h\s*\d*m|\d+h|\d+m)/i);
        if (runtimeMatch) runtime = runtimeMatch[1].trim();
        const ratingMatch = text.match(/(\d+\.\d+)\s*\(\s*[\d.]*[KkMm]?\s*\)/);
        if (ratingMatch) rating = ratingMatch[1];
        const img = li.querySelector('img');
        if (img && img.getAttribute('src')) poster = img.getAttribute('src');
        const directorMatch = text.match(/Director[s]?:\s*([^·\n]+?)(?=\s+Stars?:\s|$)/i);
        if (directorMatch) director = directorMatch[1].trim().replace(/\s+/g, ' ').slice(0, 80);
        const starsMatch = text.match(/Stars?:\s*([^·\n]+?)(?=\s*\d+\.\d+\s*\(|$)/i) || text.match(/Stars?:\s*(.+?)(?=\s*\d+h\s|\s*\d+m\s|$)/i);
        if (starsMatch) stars = starsMatch[1].trim().replace(/\s+/g, ' ').slice(0, 100);
      }
      movies.push({ id, title, url: fullUrl, year, runtime, rating, poster, director, stars });
    }
    return movies;
  }

  document.getElementById('open-imdb-fallback').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: getImdbSearchUrl() });
  });

  document.getElementById('open-imdb-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: e.currentTarget.href });
  });

  const imdbUrl = getImdbSearchUrl();
  showLoading();

  fetch(imdbUrl, {
    credentials: 'omit',
    headers: { Accept: 'text/html' },
  })
    .then((res) => {
      if (!res.ok) throw new Error('IMDb search failed. Open the link below to view on IMDb.');
      return res.text();
    })
    .then((html) => {
      const movies = parseImdbSearchHtml(html);
      showMovies(movies.slice(0, 20), imdbUrl);
    })
    .catch(() => {
      showError('Could not load results here. Use the button below to open IMDb.');
    });
})();
