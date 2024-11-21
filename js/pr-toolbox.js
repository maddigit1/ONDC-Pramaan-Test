let filteredDataSetToolbox = null;
let dataSetToolbox = "";  // Dataset for Toolbox search
let dataSetOrgToolbox = dataSetToolbox;  // Original dataset for Toolbox

const displayItemsToolbox = (dataResSet) => {
    let categoryMap = {};
    let totalCategories = 0;
    let activeCategories = 0;
    let inactiveCategories = 0;

    // Group categories under their respective titles
    dataResSet.forEach(element => {
        if (!categoryMap[element.cat_title]) {
            categoryMap[element.cat_title] = [];
        }
        categoryMap[element.cat_title].push({
            category: element.category,
            status: element.status
        });

        // Increment counters based on status
        totalCategories++;
        if (element.status.toLowerCase() === "active") {
            activeCategories++;
        } else if (element.status.toLowerCase() === "inactive") {
            inactiveCategories++;
        }
    });

    let html = '';
    // Update the count in the specified class structure
    document.querySelector('.total-cat-count-div .active-cat').textContent = activeCategories;
    document.querySelector('.total-cat-count-div .total-cat').textContent = totalCategories;
    
    for (const [cat_title, categories] of Object.entries(categoryMap)) {
        if (categories.length > 0) {
            html += `<p class="dis-cat-title">${cat_title}</p>`;
            html += `<div class="dis-cat-items-div">`
            categories.forEach(category => {
                html += `<div class="cat-icon-div ${category.status}">
                            <span class="cat-icon"></span>
                            <p class="cat-cnt">${category.category}</p>
                        </div>`;
            });
            html += `</div>`;
        }
    }

    if (html === '') {
        html = `<p>No Records found</p>`;
    }

    document.querySelector('#display-cat-main-div').innerHTML = html;
}

function loadToolboxData() {
    fetch('json/pramaan_toolbox.json')
        .then(response => response.json())
        .then(data => {
            dataSetToolbox = data;
            dataSetOrgToolbox = dataSetToolbox;
            displayItemsToolbox(dataSetToolbox);
        });
}

// Search functionality for Toolbox section
const processSearchToolbox = () => {
    let dataSet = dataSetOrgToolbox;  // Original Toolbox dataset

    const searchCriteria = {
        search: txtSearch4.value.trim().toLowerCase() ? [txtSearch4.value.trim().toLowerCase()] : []
    };

    if (searchCriteria.search.length) {
        dataSet = filterConditionsToolbox(dataSet, searchCriteria);
    }

    displayItemsToolbox(dataSet);  // Display the filtered Toolbox results
}

const filterConditionsToolbox = (dataset, searchCriteria) => {
    return dataset.filter(d => {
        const matchesSearch = searchCriteria.search.length > 0 
            ? searchCriteria.search.some(term => 
                (d.category?.toLowerCase() || '').includes(term) || 
                (d.status?.toLowerCase() || '').includes(term)
            ) 
            : true;

        return matchesSearch;
    });
}

// Input field selectors for Toolbox search
var txtSearch4 = document.getElementById('cat-search');

// Handle Enter key press for Toolbox section
txtSearch4.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
        processSearchToolbox();
    }
});

loadToolboxData();  // Load Toolbox data on page load

function Clearbtn(){
    var searchInput = document.getElementById('cat-search');
    searchInput.value = "";
    loadToolboxData()
}

$('#toolbox-clear').click(function(){
    var searchInput = document.getElementById('cat-search');
    searchInput.value = "";
    loadToolboxData()
})

// Rating functionality
// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXmymlICJ7iLrXziLKn8I_4MC5aaYEd5U",
    authDomain: "star-rating-920b0.firebaseapp.com",
    projectId: "star-rating-920b0",
    storageBucket: "star-rating-920b0.appspot.com",
    messagingSenderId: "789068259439",
    appId: "1:789068259439:web:8771eadc485c9e73492d9a",
    measurementId: "G-J4EQJ9K82S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentItemId = null; // Track current item being rated
const avgDisplay = document.getElementById('avg'); // Modal average rating display
const ratingsRef = collection(db, 'ratings');

// Open modal and set current item ID when clicking `.ut-rate-btn`
document.querySelectorAll('.ut-rate-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        currentItemId = e.currentTarget.getAttribute('data-item-id'); // Get item ID
        updateAverageRating();  // Load the current average rating for this item
        clearAllStars();  // Clear star selection on modal open
    });
});

// Handle star click for submitting rating
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', async (e) => {
        if (!currentItemId) return; // Ensure an item ID is selected
        const rating = parseInt(e.target.getAttribute('data-value'));
        highlightStars(rating);
        await submitRating(rating, currentItemId);
        updateAverageRating();
    });
});

// Clear all star selections
function clearAllStars() {
    document.querySelectorAll('.star').forEach(star => star.classList.remove('selected'));
}

// Highlight stars up to the given rating
function highlightStars(rating) {
    clearAllStars();  // Clear previous selections first
    document.querySelectorAll('.star').forEach(star => {
        star.classList.toggle('selected', parseInt(star.getAttribute('data-value')) <= rating);
    });
}

// Submit rating to Firestore with item ID
async function submitRating(rating, itemId) {
    try {
        await addDoc(ratingsRef, { rating: rating, itemId: itemId });
    } catch (error) {
        console.error("Error adding rating: ", error);
    }
}

// Update average rating based on current item ID
async function updateAverageRating() {
    if (!currentItemId) return;

    const snapshot = await getDocs(ratingsRef);
    let total = 0;
    let count = 0;

    snapshot.forEach(doc => {
        if (doc.data().itemId === currentItemId) {
            total += doc.data().rating;
            count++;
        }
    });

    const average = count === 0 ? "0.0" : (total / count).toFixed(1);
    
    // Update the modal's display
    if (avgDisplay) avgDisplay.textContent = average;

    // Update specific item's display in the rating div
    const ratingDiv = document.querySelector(`.rating-div[data-item-id="${currentItemId}"] .item-rating`);
    if (ratingDiv) ratingDiv.textContent = `${average}/5`;
}

// Update average ratings for all items
async function updateAllAverageRatings() {
    const snapshot = await getDocs(ratingsRef);
    const ratingsByItem = {};

    // Calculate totals and counts for each item
    snapshot.forEach(doc => {
        const { itemId, rating } = doc.data();
        if (!ratingsByItem[itemId]) {
            ratingsByItem[itemId] = { total: 0, count: 0 };
        }
        ratingsByItem[itemId].total += rating;
        ratingsByItem[itemId].count++;
    });

    // Update all item ratings in the DOM
    Object.keys(ratingsByItem).forEach(itemId => {
        const { total, count } = ratingsByItem[itemId];
        const average = count === 0 ? "0.0" : (total / count).toFixed(1);

        // Update specific item's display in the rating div
        const ratingDiv = document.querySelector(`.rating-div[data-item-id="${itemId}"] .item-rating`);
        if (ratingDiv) ratingDiv.textContent = `${average}/5`;
    });
}

// Real-time listener to update rating on new submission
onSnapshot(ratingsRef, () => {
    updateAverageRating();
    updateAllAverageRatings();
});

// Initial load to display all average ratings on page load
updateAllAverageRatings();
