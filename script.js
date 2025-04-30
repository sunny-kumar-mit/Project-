document.addEventListener('DOMContentLoaded', function() {
    // Load data from JSON file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            populateDropdowns(data);
            setupEventListeners(data);
            initMap(data.propertyLocations);
            setupSimpleSearch(data); // Initialize simple search
        })
        .catch(error => console.error('Error loading data:', error));

    // Tab functionality
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Add animation to active tab
            this.classList.add('pulse');
            setTimeout(() => this.classList.remove('pulse'), 2000);
        });
    });

    // Search toggle functionality
    const simpleSearchToggle = document.getElementById('simpleSearchToggle');
    const advancedSearchToggle = document.getElementById('advancedSearchToggle');
    const simpleSearchContainer = document.getElementById('simpleSearchContainer');
    const advancedSearchContainer = document.getElementById('advancedSearchContainer');

    simpleSearchToggle.addEventListener('click', function() {
        simpleSearchToggle.classList.add('active');
        advancedSearchToggle.classList.remove('active');
        simpleSearchContainer.classList.add('active');
        advancedSearchContainer.style.display = 'none';
    });

    advancedSearchToggle.addEventListener('click', function() {
        advancedSearchToggle.classList.add('active');
        simpleSearchToggle.classList.remove('active');
        simpleSearchContainer.classList.remove('active');
        advancedSearchContainer.style.display = 'block';
    });

    // Font size controls
    const fontButtons = document.querySelectorAll('.font-btn');
    fontButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            fontButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const size = this.classList.contains('small') ? '14px' : 
                         this.classList.contains('medium') ? '16px' : '18px';
            document.body.style.fontSize = size;
            
            // Store preference in localStorage
            localStorage.setItem('fontSize', size);
        });
    });

    // Apply saved font size preference
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.body.style.fontSize = savedFontSize;
        fontButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.font-btn.${savedFontSize === '14px' ? 'small' : 
                              savedFontSize === '16px' ? 'medium' : 'large'}`).classList.add('active');
    }

    // Scroll to top button
    const scrollTopBtn = document.querySelector('.scroll-top');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('active');
        } else {
            scrollTopBtn.classList.remove('active');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Close property details
    document.querySelector('.close-details').addEventListener('click', () => {
        document.getElementById('propertyDetails').style.display = 'none';
    });

    // Animation on form elements
    const formInputs = document.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});

function populateDropdowns(data) {
    // Registration Office
    const registrationOfficeSelect = document.getElementById('registrationOffice');
    data.registrationOffices.forEach(office => {
        const option = document.createElement('option');
        option.value = office;
        option.textContent = office;
        registrationOfficeSelect.appendChild(option);
    });

    // Property Location
    const propertyLocationSelect = document.getElementById('propertyLocation');
    data.propertyLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        propertyLocationSelect.appendChild(option);
    });

    // Circle
    const circleSelect = document.getElementById('circle');
    data.circles.forEach(circle => {
        const option = document.createElement('option');
        option.value = circle;
        option.textContent = circle;
        circleSelect.appendChild(option);
    });

    // Mauja
    const maujaSelect = document.getElementById('mauja');
    data.maujas.forEach(mauja => {
        const option = document.createElement('option');
        option.value = mauja;
        option.textContent = mauja;
        maujaSelect.appendChild(option);
    });

    // Land Type
    const landTypeSelect = document.getElementById('landType');
    data.landTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        landTypeSelect.appendChild(option);
    });
}

function setupSimpleSearch(data) {
    // Populate simple search dropdowns
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

    // Setup click handlers for search cards
    document.querySelectorAll('.search-card').forEach(card => {
        card.addEventListener('click', function() {
            // Show the input group when card is clicked
            const inputGroup = this.querySelector('.search-input-group');
            if (inputGroup) {
                document.querySelectorAll('.search-input-group').forEach(group => {
                    group.classList.remove('active');
                });
                inputGroup.classList.add('active');
            }
        });
    });

    // Setup search button handlers
    document.getElementById('searchByName').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simpleName').value.trim();
        const results = performSearch(data.records, { partyName: searchValue });
        displayResults(results);
    });

    document.getElementById('searchByAddress').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simpleLocation').value;
        const results = performSearch(data.records, { propertyLocation: searchValue });
        displayResults(results);
    });

    document.getElementById('searchByPlot').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simplePlotNo').value.trim().toLowerCase();
        const results = data.records.filter(record => 
            record.serialNo.toLowerCase().includes(searchValue) ||
            record.plotNo.toLowerCase().includes(searchValue)
        );
        displayResults(results);
    });

    document.getElementById('searchByDeed').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simpleDeedNo').value.trim();
        const results = performSearch(data.records, { deedNo: searchValue });
        displayResults(results);
    });

    document.getElementById('searchDisputed').addEventListener('click', function(e) {
        e.preventDefault();
        // For demo purposes, we'll just search by property details
        const searchValue = document.getElementById('simpleDisputed').value.trim().toLowerCase();
        const results = data.records.filter(record => 
            record.partyName.toLowerCase().includes(searchValue) ||
            record.propertyLocation.toLowerCase().includes(searchValue)
        );
        displayResults(results);
    });

    document.getElementById('searchRegistry').addEventListener('click', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('simpleRegistryOffice').value;
        const results = performSearch(data.records, { registrationOffice: searchValue });
        displayResults(results);
    });

    document.getElementById('generateReport').addEventListener('click', function(e) {
        e.preventDefault();
        const reportType = document.getElementById('reportType').value;
        if (reportType === 'Select report type') {
            alert('Please select a report type');
            return;
        }
        
        // For demo, we'll just show all records as a "report"
        displayResults(data.records);
        alert(`Generating ${reportType} report...`);
    });
}

function setupEventListeners(data) {
    const searchForm = document.getElementById('searchForm');
    const resultsContainer = document.getElementById('searchResults');

    // Advanced search form submit handler
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading animation
        const submitBtn = this.querySelector('[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        submitBtn.disabled = true;
        
        // Get form values
        const formData = {
            registrationOffice: document.getElementById('registrationOffice').value,
            dateFrom: document.getElementById('dateFrom').value,
            dateTo: document.getElementById('dateTo').value,
            areaFrom: document.getElementById('areaFrom').value,
            areaTo: document.getElementById('areaTo').value,
            propertyLocation: document.getElementById('propertyLocation').value,
            serialNo: document.getElementById('serialNo').value,
            khataNo: document.getElementById('khataNo').value,
            circle: document.getElementById('circle').value,
            deedNo: document.getElementById('deedNo').value,
            plotNo: document.getElementById('plotNo').value,
            mauja: document.getElementById('mauja').value,
            partyName: document.getElementById('partyName').value,
            landValueFrom: document.getElementById('landValueFrom').value,
            landValueTo: document.getElementById('landValueTo').value,
            fatherHusbandName: document.getElementById('fatherHusbandName').value,
            landType: document.getElementById('landType').value
        };

        // Simulate network delay for demo
        setTimeout(() => {
            // Perform search
            const results = performSearch(data.records, formData);
            
            // Display results
            displayResults(results);
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }, 800);
    });
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

function displayResults(results) {
    const resultsContainer = document.getElementById('searchResults');
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
        return;
    }

    // Create results header
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

    // Attach export functionality
    const exportBtn = resultsHeader.querySelector('.export-btn');
    exportBtn.addEventListener('click', () => exportToJsonFile(results));

    // Create a table for results
    const table = document.createElement('table');
    table.className = 'results-table';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Deed No', 'Registration Date', 'Party Name', 'Property Location', 'Area', 'Land Value', 'Actions'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    results.forEach(record => {
        const row = document.createElement('tr');
        ['deedNo', 'registrationDate', 'partyName', 'propertyLocation', 'area', 'landValue'].forEach(field => {
            const td = document.createElement('td');
            td.textContent = record[field];
            row.appendChild(td);
        });

        // Add "View More" button
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
}

function showPropertyDetails(record) {
    const propertyDetailsContainer = document.getElementById('propertyDetails');
    const propertyDetailsContent = document.getElementById('propertyDetailsContent');
    
    // Format the land value with commas
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
    
    // Show the details container
    propertyDetailsContainer.style.display = 'block';
    
    // Initialize map for this property
    initPropertyMap(record.propertyLocation);
    
    // Scroll to details
    propertyDetailsContainer.scrollIntoView({ behavior: 'smooth' });
}

function initMap(locations) {
    // This is just a placeholder - actual implementation would use Google Maps API
    console.log('Initializing map with locations:', locations);
}

function initPropertyMap(location) {
    // Sample coordinates for demonstration
    const locationCoords = {
        "Location A": { lat: 28.6139, lng: 77.2090 },
        "Location B": { lat: 28.6140, lng: 77.2150 },
        "Location C": { lat: 28.6200, lng: 77.2100 },
        "Location D": { lat: 28.6100, lng: 77.2000 }
    };
    
    
    const coords = locationCoords[location] || { lat: 28.6139, lng: 77.2090 };
    
    const mapElement = document.getElementById('propertyMap');
    mapElement.innerHTML = ''; // Clear previous map
    
    // In a real implementation, we would initialize Google Maps here
    // For this demo, we'll just show the coordinates
    mapElement.innerHTML = `
        <div class="map-placeholder">
            <i class="fas fa-map-marked-alt"></i>
            <p>Map would display here for ${location}</p>
            <p>Coordinates: ${coords.lat}, ${coords.lng}</p>
        </div>
    `;
}

function exportToJsonFile(data) {
    const dataStr = JSON.stringify(data, null, 4); // Convert data to JSON string
    const blob = new Blob([dataStr], { type: "application/json" }); // Create a Blob object
    const url = URL.createObjectURL(blob); // Create a URL for the Blob

    const a = document.createElement("a"); // Create an anchor element
    a.href = url;
    a.download = "property_records.json"; // Set the file name
    a.click(); // Trigger the download

    URL.revokeObjectURL(url); // Revoke the URL after download
}