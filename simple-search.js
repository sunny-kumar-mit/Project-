document.addEventListener('DOMContentLoaded', function() {
    // Toggle between simple and advanced search
    const simpleSearchToggle = document.getElementById('simpleSearchToggle');
    const advancedSearchToggle = document.getElementById('advancedSearchToggle');
    const simpleSearchContainer = document.getElementById('simpleSearchContainer');
    const advancedSearchContainer = document.getElementById('advancedSearchContainer');
    const simpleSearchResults = document.getElementById('simpleSearchResults');
    const advancedSearchResults = document.getElementById('searchResults');

    simpleSearchToggle.addEventListener('click', function() {
        simpleSearchToggle.classList.add('active');
        advancedSearchToggle.classList.remove('active');
        simpleSearchContainer.classList.add('active');
        advancedSearchContainer.style.display = 'none';
        advancedSearchResults.style.display = 'none';
    });

    advancedSearchToggle.addEventListener('click', function() {
        advancedSearchToggle.classList.add('active');
        simpleSearchToggle.classList.remove('active');
        advancedSearchContainer.style.display = 'block';
        simpleSearchContainer.classList.remove('active');
        simpleSearchResults.style.display = 'none';
    });

    // Load data and populate dropdowns
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            populateSimpleSearchDropdowns(data);
            setupSimpleSearchEventListeners(data);
        })
        .catch(error => console.error('Error loading data:', error));

    // Show search input when card is clicked
    document.querySelectorAll('.search-card').forEach(card => {
        card.addEventListener('click', function() {
            const searchType = this.dataset.searchType;
            const inputGroup = this.querySelector('.search-input-group');
            
            document.querySelectorAll('.search-input-group').forEach(group => {
                group.classList.remove('active');
            });
            
            inputGroup.classList.add('active');
        });
    });
});

function populateSimpleSearchDropdowns(data) {
    const simpleLocationSelect = document.getElementById('simpleLocation');
    data.propertyLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        simpleLocationSelect.appendChild(option);
    });

    const simpleRegistryOfficeSelect = document.getElementById('simpleRegistryOffice');
    data.registrationOffices.forEach(office => {
        const option = document.createElement('option');
        option.value = office;
        option.textContent = office;
        simpleRegistryOfficeSelect.appendChild(option);
    });
}

function setupSimpleSearchEventListeners(data) {
    document.getElementById('searchByName').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simpleName').value.trim();
        const results = performSearch(data.records, { partyName: searchValue });
        displaySimpleSearchResults(results);
    });

    document.getElementById('searchByAddress').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simpleLocation').value;
        const results = performSearch(data.records, { propertyLocation: searchValue });
        displaySimpleSearchResults(results);
    });

    document.getElementById('searchByPlot').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simplePlotNo').value.trim().toLowerCase();
        const results = data.records.filter(record => 
            record.serialNo.toLowerCase().includes(searchValue) ||
            record.plotNo.toLowerCase().includes(searchValue)
        );
        displaySimpleSearchResults(results);
    });

    document.getElementById('searchByDeed').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simpleDeedNo').value.trim();
        const results = performSearch(data.records, { deedNo: searchValue });
        displaySimpleSearchResults(results);
    });

    document.getElementById('searchRegistry').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simpleRegistryOffice').value;
        const results = performSearch(data.records, { registrationOffice: searchValue });
        displaySimpleSearchResults(results);
    });

    document.getElementById('searchDisputed').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simpleDisputed').value.trim();
        const resultsContainer = document.getElementById('simpleSearchResults');
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Disputed Properties Search</h3>
                <p>This feature requires additional data about property disputes</p>
            </div>
        `;
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });

    document.getElementById('generateReport').addEventListener('click', function(e) {
        e.preventDefault();
        const reportType = document.getElementById('reportType').value;
        const resultsContainer = document.getElementById('simpleSearchResults');
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-chart-pie"></i>
                <h3>Report Generation</h3>
                <p>This would generate a ${reportType} report in a real implementation</p>
            </div>
        `;
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
}

function displaySimpleSearchResults(results) {
    const resultsContainer = document.getElementById('simpleSearchResults');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search-minus"></i>
                <h3>No matching records found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        resultsContainer.style.display = 'block';
        resultsContainer.style.animation = 'fadeIn 0.5s ease-out';
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        return;
    }

    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'results-header';
    resultsHeader.innerHTML = `
        <div class="results-count">
            <i class="fas fa-check-circle"></i> ${results.length} records found
        </div>
        <button class="export-btn">
            <i class="fas fa-download"></i> Export
        </button>
    `;
    resultsContainer.appendChild(resultsHeader);

    const exportBtn = resultsHeader.querySelector('.export-btn');
    exportBtn.addEventListener('click', () => exportToJsonFile(results));

    const table = document.createElement('table');
    table.className = 'results-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Deed No', 'Registration Date', 'Party Name', 'Property Location', 'Area', 'Land Value', 'Actions'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    results.forEach(record => {
        const row = document.createElement('tr');
        ['deedNo', 'registrationDate', 'partyName', 'propertyLocation', 'area', 'landValue'].forEach(field => {
            const td = document.createElement('td');
            td.textContent = record[field];
            row.appendChild(td);
        });

        const actionTd = document.createElement('td');
        const viewMoreButton = document.createElement('button');
        viewMoreButton.textContent = 'View More';
        viewMoreButton.className = 'view-more-btn';
        viewMoreButton.addEventListener('click', () => showPropertyDetails(record));
        actionTd.appendChild(viewMoreButton);
        row.appendChild(actionTd);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    resultsContainer.appendChild(table);
    resultsContainer.style.display = 'block';
    resultsContainer.style.animation = 'fadeIn 0.5s ease-out';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function performSearch(records, criteria) {
    return records.filter(record => {
        if (criteria.registrationOffice && criteria.registrationOffice !== 'ALL' && 
            record.registrationOffice !== criteria.registrationOffice) return false;
        
        if (criteria.dateFrom && record.registrationDate < criteria.dateFrom) return false;
        if (criteria.dateTo && record.registrationDate > criteria.dateTo) return false;
        if (criteria.areaFrom && parseFloat(record.area) < parseFloat(criteria.areaFrom)) return false;
        if (criteria.areaTo && parseFloat(record.area) > parseFloat(criteria.areaTo)) return false;
        if (criteria.propertyLocation && criteria.propertyLocation !== 'ALL' && 
            record.propertyLocation !== criteria.propertyLocation) return false;
        if (criteria.serialNo && !record.serialNo.toLowerCase().includes(criteria.serialNo.toLowerCase())) return false;
        if (criteria.khataNo && !record.khataNo.toLowerCase().includes(criteria.khataNo.toLowerCase())) return false;
        if (criteria.circle && criteria.circle !== 'ALL' && record.circle !== criteria.circle) return false;
        if (criteria.deedNo && !record.deedNo.toLowerCase().includes(criteria.deedNo.toLowerCase())) return false;
        if (criteria.plotNo && !record.plotNo.toLowerCase().includes(criteria.plotNo.toLowerCase())) return false;
        if (criteria.mauja && criteria.mauja !== 'ALL' && record.mauja !== criteria.mauja) return false;
        if (criteria.partyName && !record.partyName.toLowerCase().includes(criteria.partyName.toLowerCase())) return false;
        if (criteria.landValueFrom && parseFloat(record.landValue) < parseFloat(criteria.landValueFrom)) return false;
        if (criteria.landValueTo && parseFloat(record.landValue) > parseFloat(criteria.landValueTo)) return false;
        if (criteria.fatherHusbandName && 
            !record.fatherHusbandName.toLowerCase().includes(criteria.fatherHusbandName.toLowerCase())) return false;
        if (criteria.landType && criteria.landType !== 'ALL' && record.landType !== criteria.landType) return false;

        return true;
    });
}

function showPropertyDetails(record) {
    const propertyDetailsContainer = document.getElementById('propertyDetails');
    const propertyDetailsContent = document.getElementById('propertyDetailsContent');
    
    const formattedLandValue = parseInt(record.landValue).toLocaleString('en-IN');
    
    propertyDetailsContent.innerHTML = `
        <div class="detail-item">
            <strong>Deed Number</strong>
            <span>${record.deedNo}</span>
        </div>
        <div class="detail-item">
            <strong>Registration Date</strong>
            <span>${record.registrationDate}</span>
        </div>
        <div class="detail-item">
            <strong>Party Name</strong>
            <span>${record.partyName}</span>
        </div>
        <div class="detail-item">
            <strong>Father/Husband Name</strong>
            <span>${record.fatherHusbandName}</span>
        </div>
        <div class="detail-item">
            <strong>Property Location</strong>
            <span>${record.propertyLocation}</span>
        </div>
        <div class="detail-item">
            <strong>Registration Office</strong>
            <span>${record.registrationOffice}</span>
        </div>
        <div class="detail-item">
            <strong>Area</strong>
            <span>${record.area} decimal</span>
        </div>
        <div class="detail-item">
            <strong>Land Value</strong>
            <span>₹${formattedLandValue}</span>
        </div>
        <div class="detail-item">
            <strong>Serial Number</strong>
            <span>${record.serialNo}</span>
        </div>
        <div class="detail-item">
            <strong>Khata Number</strong>
            <span>${record.khataNo}</span>
        </div>
        <div class="detail-item">
            <strong>Circle</strong>
            <span>${record.circle}</span>
        </div>
        <div class="detail-item">
            <strong>Plot Number</strong>
            <span>${record.plotNo}</span>
        </div>
        <div class="detail-item">
            <strong>Mauja</strong>
            <span>${record.mauja}</span>
        </div>
        <div class="detail-item">
            <strong>Land Type</strong>
            <span>${record.landType}</span>
        </div>
    `;
    
    propertyDetailsContainer.style.display = 'block';
    initPropertyMap(record.propertyLocation);
    propertyDetailsContainer.scrollIntoView({ behavior: 'smooth' });
}

function exportToJsonFile(data) {
    const dataStr = JSON.stringify(data, null, 4);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "property_records.json";
    a.click();

    URL.revokeObjectURL(url);
}

function initPropertyMap(location) {
    const locationCoords = {
        "Location A": { lat: 28.6139, lng: 77.2090 },
        "Location B": { lat: 28.6140, lng: 77.2150 },
        "Location C": { lat: 28.6200, lng: 77.2100 },
        "Location D": { lat: 28.6100, lng: 77.2000 }
    };
    
    const coords = locationCoords[location] || { lat: 28.6139, lng: 77.2090 };
    
    const mapElement = document.getElementById('propertyMap');
    mapElement.innerHTML = `
        <div class="map-placeholder">
            <i class="fas fa-map-marked-alt"></i>
            <p>Map would display here for ${location}</p>
            <p>Coordinates: ${coords.lat}, ${coords.lng}</p>
        </div>
    `;
}