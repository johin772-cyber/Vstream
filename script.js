document.addEventListener('DOMContentLoaded', function () {
    const ambientLayer = document.getElementById('ambientLayer');
    
    let is18PlusUnlocked = false;
    let logoClickCount = 0;
    let clickTimer;

    // 1. KELOMPOKKAN FILM & BUAT SLIDER UTAMA
    const rawMovies = document.querySelectorAll('#rawMovieData .movie-card');
    const mainContainer = document.getElementById('genreSectionsContainer');
    const genresMap = {};

    rawMovies.forEach(card => {
        const genre = card.getAttribute('data-genre') || 'Lainnya';
        if (!genresMap[genre]) {
            genresMap[genre] = [];
        }
        genresMap[genre].push(card);
    });

    for (const genre in genresMap) {
        const genreRow = document.createElement('div');
        genreRow.className = 'genre-row';
        genreRow.setAttribute('data-genre-row', genre);

        if (genre === 'Film 18+') {
            genreRow.classList.add('adult-genre-row');
            genreRow.style.display = 'none'; 
        }

        const genreHeader = document.createElement('div');
        genreHeader.className = 'genre-header';

        const title = document.createElement('h2');
        title.className = 'genre-title';
        title.textContent = genre;
        genreHeader.appendChild(title);

        genreRow.appendChild(genreHeader);

        const slider = document.createElement('div');
        slider.className = 'genre-slider';

        genresMap[genre].forEach(card => {
            slider.appendChild(card);
        });

        genreRow.appendChild(slider);
        mainContainer?.appendChild(genreRow);
    }

    // 2. LOGIKA KODE RAHASIA (KETUK LOGO 3 KALI)
    const secretLogoTrigger = document.getElementById('secretLogoTrigger');
    const secretPillBtn = document.getElementById('secretPillBtn');
    const bustedOverlay = document.getElementById('bustedOverlay');
    
    secretLogoTrigger?.addEventListener('click', function(e) {
        e.preventDefault(); 
        
        logoClickCount++;
        
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            logoClickCount = 0; 
        }, 1500);

        if (logoClickCount === 3) {
            is18PlusUnlocked = !is18PlusUnlocked; 
            logoClickCount = 0; 

            if (is18PlusUnlocked) {
                bustedOverlay?.classList.add('active');
                setTimeout(() => {
                    bustedOverlay?.classList.remove('active');
                }, 2500);
            } else {
                alert("🔒 Mode Dewasa Dikunci Kembali.");
            }

            secretPillBtn?.style && (secretPillBtn.style.display = is18PlusUnlocked ? 'inline-block' : 'none');

            const activePill = document.querySelector('.pill-btn.active');
            if (!is18PlusUnlocked && activePill?.getAttribute('data-filter') === 'Film 18+') {
                document.querySelector('[data-filter="all"]')?.click();
            } else {
                activePill?.click();
            }
        }
            // 3. SISTEM FILTER PILL BUTTONS 
    const pillBtns = document.querySelectorAll('.pill-btn');
    pillBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            pillBtns.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');
            const genreRows = document.querySelectorAll('.genre-row');

            genreRows.forEach(row => {
                const rowGenre = row.getAttribute('data-genre-row');
                const isAdultRow = rowGenre === 'Film 18+';

                if (isAdultRow && !is18PlusUnlocked) {
                    row.style.display = 'none';
                    return; 
                }

                if (filterValue === 'all' || rowGenre === filterValue) {
                    row.style.display = 'block';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    // 4. LOGIKA AMBIENT LIGHTING
    function applyAmbientLighting(cards) {
        cards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                const ambientColor = this.getAttribute('data-ambient') || 'rgba(235, 49, 90, 0.3)';
                ambientLayer?.style.setProperty('--ambient-color', ambientColor);
            });
            card.addEventListener('mouseleave', function () {
                ambientLayer?.style.setProperty('--ambient-color', 'rgba(235, 49, 90, 0.25)');
            });
        });
    }

    // 5. OVERLAY WATCH PLAYER
    const watchOverlay = document.getElementById('watchOverlay');
    const doodFrame = document.getElementById('doodFrame');
    const playerTitle = document.getElementById('playerTitle');
    const closePlayerBtn = document.getElementById('closePlayerBtn');
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    const relatedGrid = document.getElementById('relatedMoviesGrid');
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    const playerSynopsis = document.getElementById('playerSynopsis');

    function openPlayer(doodUrl, movieTitleStr, movieGenreStr, movieSynopsisStr) {
        if (doodUrl) {
            doodFrame && (doodFrame.src = doodUrl);
            playerTitle && (playerTitle.textContent = movieTitleStr);
            watchOverlay?.classList.add('active');
            document.body.classList.add('no-scroll');

            if (movieSynopsisStr && movieGenreStr !== 'Film 18+') {
                playerSynopsis && (playerSynopsis.textContent = movieSynopsisStr);
            } else {
                playerSynopsis && (playerSynopsis.textContent = ''); 
            }

            relatedGrid && (relatedGrid.innerHTML = '');
            const allCards = document.querySelectorAll('#genreSectionsContainer .movie-card');
            allCards.forEach(otherCard => {
                const otherGenre = otherCard.getAttribute('data-genre');
                const otherAdultStatus = otherCard.getAttribute('data-adult') === 'true';
                const otherTitle = otherCard.getAttribute('data-title') || otherCard.querySelector('.movie-title')?.textContent || '';
                
                if (otherAdultStatus && !is18PlusUnlocked) return;

                if (otherGenre === movieGenreStr && otherTitle !== movieTitleStr) {
                    const clonedCard = otherCard.cloneNode(true);
                    attachCardClickEvents([clonedCard]);
                    applyAmbientLighting([clonedCard]);
                    relatedGrid?.appendChild(clonedCard);
                }
            });
        }
    }
            function attachCardClickEvents(cards) {
        cards.forEach(card => {
            card.addEventListener('click', function () {
                const doodUrl = this.getAttribute('data-dood');
                const movieTitleStr = this.getAttribute('data-title') || this.querySelector('.movie-title').textContent;
                const movieGenreStr = this.getAttribute('data-genre');
                const movieSynopsisStr = this.getAttribute('data-synopsis') || ''; 
                
                openPlayer(doodUrl, movieTitleStr, movieGenreStr, movieSynopsisStr);
            });
        });
    }

    if(heroPlayBtn) {
        heroPlayBtn.addEventListener('click', function() {
            const doodUrl = this.getAttribute('data-dood');
            const movieTitleStr = this.getAttribute('data-title');
            const heroSynopsis = "Babak baru petualangan Peter Parker dalam menghadapi tantangan yang menguji batas kekuatan dan keberaniannya di kota New York yang penuh intrik serta ancaman musuh baru.";
            
            openPlayer(doodUrl, movieTitleStr, 'Film Action', heroSynopsis);
        });
    }

    const initialCards = document.querySelectorAll('.movie-card');
    attachCardClickEvents(initialCards);
    applyAmbientLighting(initialCards);

    closePlayerBtn.addEventListener('click', function () {
        watchOverlay.classList.remove('active');
        doodFrame.src = '';
        document.body.classList.remove('no-scroll');
    });

    fullScreenBtn.addEventListener('click', function () {
        if (doodFrame.requestFullscreen) {
            doodFrame.requestFullscreen();
        } else if (doodFrame.webkitRequestFullscreen) {
            doodFrame.webkitRequestFullscreen();
        } else if (doodFrame.msRequestFullscreen) {
            doodFrame.msRequestFullscreen();
        }
    });

    // 6. LIVE SEARCH
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchResultsDropdown');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const searchToggleMobile = document.getElementById('searchToggleMobile');
    const searchContainer = document.getElementById('searchContainer');

    if(menuToggle && navMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            if(searchContainer) searchContainer.classList.remove('active');
        });
    }

    if(searchToggleMobile && searchContainer) {
        searchToggleMobile.addEventListener('click', function(e) {
            e.stopPropagation();
            searchContainer.classList.toggle('active');
            if(navMenu) navMenu.classList.remove('active');
            if(searchContainer.classList.contains('active')) {
                searchInput.focus();
            }
        });
    }
    });
        if(searchToggleMobile && searchContainer) {
        searchToggleMobile.addEventListener('click', function(e) {
            e.stopPropagation();
            searchContainer.classList.toggle('active');
            if(navMenu) navMenu.classList.remove('active');
            if(searchContainer.classList.contains('active')) {
                searchInput.focus();
            }
        });
    }

    searchInput.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();
        searchDropdown.innerHTML = '';

        if (query.length === 0) {
            searchDropdown.classList.remove('active');
            return;
        }

        const allCards = document.querySelectorAll('#genreSectionsContainer .movie-card');
        let matchCount = 0;

        allCards.forEach(card => {
            const isAdult = card.getAttribute('data-adult') === 'true';
            if (isAdult && !is18PlusUnlocked) return; 

            const titleText = (card.getAttribute('data-title') || card.querySelector('.movie-title').textContent).toLowerCase();
            const genreText = (card.getAttribute('data-genre') || '').toLowerCase();

            if (titleText.includes(query) || genreText.includes(query)) {
                matchCount++;
                const imgSrc = card.querySelector('.movie-poster').src;
                const displayTitle = card.querySelector('.movie-title').textContent;
                const displayGenre = card.getAttribute('data-genre');

                const itemDiv = document.createElement('div');
                itemDiv.className = 'search-item';
                itemDiv.innerHTML = `
                    <img src="${imgSrc}" alt="${displayTitle}">
                    <div class="search-item-info">
                        <div class="search-item-title">${displayTitle}</div>
                        <div class="search-item-meta">${displayGenre}</div>
                    </div>
                `;

                itemDiv.addEventListener('click', function () {
                    searchDropdown.classList.remove('active');
                    searchInput.value = '';
                    if(window.innerWidth <= 768) {
                        searchContainer.classList.remove('active');
                    }
                    card.click();
                });

                searchDropdown.appendChild(itemDiv);
            }
        });

        if (matchCount === 0) {
            searchDropdown.innerHTML = `<div class="search-no-match">Tidak ada film yang cocok.</div>`;
        }

        searchDropdown.classList.add('active');
    });

    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.remove('active');
        }
        if (navMenu && menuToggle) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        }
        if (window.innerWidth <= 768 && searchContainer && searchToggleMobile) {
            if (!searchContainer.contains(e.target) && !searchToggleMobile.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchContainer.classList.remove('active');
            }
        }
    });
});
