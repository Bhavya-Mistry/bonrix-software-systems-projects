document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('image-input');
    const quantitySlider = document.getElementById('quantity-slider');
    const quantityValue = document.getElementById('quantity-value');
    const accuracySlider = document.getElementById('accuracy-slider');
    const accuracyValue = document.getElementById('accuracy-value');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');
    const fileNameSpan = document.getElementById('file-name');
    const dropZone = document.getElementById('drop-zone');

    // Handle file selection via click
    imageInput.addEventListener('change', () => handleFiles(imageInput.files));

    // Make the drop zone clickable
    dropZone.addEventListener('click', () => imageInput.click());

    // Drag and drop event listeners
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            imageInput.files = files; // Assign files to the input
            fileNameSpan.textContent = files[0].name;
        } else {
            fileNameSpan.textContent = 'No file chosen';
        }
    }

    // Update slider value displays
    quantitySlider.addEventListener('input', (e) => {
        quantityValue.textContent = e.target.value;
    });

    accuracySlider.addEventListener('input', (e) => {
        accuracyValue.textContent = `${e.target.value}%`;
    });

    searchButton.addEventListener('click', async () => {
        const file = imageInput.files[0];
        if (!file) {
            alert('Please select an image first.');
            return;
        }

        // Set loading state
        searchButton.disabled = true;
        searchButton.textContent = 'Searching...';
        resultsContainer.innerHTML = '<p>Searching for similar images...</p>';

        const formData = new FormData();
        formData.append('file', file);

        const topK = quantitySlider.value;
        const minPercent = accuracySlider.value;
        const url = `/search/image?top_k=${topK}&min_percent=${minPercent}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            resultsContainer.innerHTML = ''; // Clear loading message

            if (data && data.length > 0) {
                data.forEach(hit => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'result-item';

                    const img = document.createElement('img');
                    const imageName = hit.image_path.split(/[\\/]/).pop();
                    // Images are served from /images/ route which maps to data/images/
                    img.src = `/images/${imageName}`;
                    img.alt = hit.title || 'Jewelry image';
                    img.onerror = function() {
                        this.style.display = 'none'; // Hide broken images
                        const errorMsg = document.createElement('div');
                        errorMsg.textContent = 'Image not found';
                        errorMsg.className = 'image-error';
                        this.parentNode.insertBefore(errorMsg, this);
                    };

                    const details = document.createElement('div');
                    details.className = 'result-details';
                    
                    // Use match_percent from your API response
                    const score = document.createElement('p');
                    score.className = 'match-score';
                    score.textContent = `Match: ${hit.match_percent.toFixed(1)}%`;

                    // Display rank
                    const rank = document.createElement('p');
                    rank.className = 'result-rank';
                    rank.textContent = `Rank #${hit.rank}`;

                    // Display SKU and Title if available
                    if (hit.sku) {
                        const sku = document.createElement('p');
                        sku.className = 'product-sku';
                        sku.textContent = `SKU: ${hit.sku}`;
                        details.appendChild(sku);
                    }

                    if (hit.title && hit.title !== hit.sku) {
                        const title = document.createElement('p');
                        title.className = 'product-title';
                        title.textContent = hit.title;
                        details.appendChild(title);
                    }

                    details.appendChild(rank);
                    details.appendChild(score);
                    resultItem.appendChild(img);
                    resultItem.appendChild(details);
                    resultsContainer.appendChild(resultItem);
                });
            } else {
                resultsContainer.innerHTML = '<p>No similar images found. Try adjusting the search accuracy.</p>';
            }
        } catch (error) {
            console.error('Search Error:', error);
            resultsContainer.innerHTML = '<p>An error occurred during the search. Please ensure the backend is running and check the console for details.</p>';
        } finally {
            // Restore button state
            searchButton.disabled = false;
            searchButton.textContent = 'Search Similar Images';
        }
    });
});