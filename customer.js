let orderItems = [];
let orderSubmitted = false;
let tableNumber = '';
let tableStatus = {}; // To track the table status (vacant, taken, booked)
let bookingTimers = {}; // To track when booked tables will be available again

document.addEventListener("DOMContentLoaded", function() {
    // Initialize table statuses (vacant by default)
    for (let i = 1; i <= 35; i++) {
        tableStatus[i] = "vacant";  // Initially, all tables are vacant
    }

    const tableSelect = document.getElementById("tableSelect");
    populateTableDropdown(tableSelect);
});

// Function to populate the table dropdown with numbers and statuses
function populateTableDropdown(tableSelect) {
    tableSelect.innerHTML = '';  // Clear the dropdown options
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "Select Table";
    tableSelect.appendChild(defaultOption);

    for (let i = 1; i <= 35; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = `Table ${i} - ${tableStatus[i] === "vacant" ? "Vacant" : tableStatus[i] === "taken" ? "Taken" : "Booked"}`;
        if (tableStatus[i] === "booked" && bookingTimers[i] && bookingTimers[i] > Date.now()) {
            option.disabled = true;  // Disable table if it's still in the booked state for one hour
            option.textContent = `Table ${i} - Booked (Until ${new Date(bookingTimers[i]).toLocaleTimeString()})`;
        }
        tableSelect.appendChild(option);
    }
}

// Function to enable the table selection dropdown when the "Book Table" button is clicked
function focusOnTableSelect() {
    let tableSelect = document.getElementById("tableSelect");
    tableSelect.disabled = false;  // Enable the table selection dropdown
    tableSelect.focus();  // Move focus to the table select input
    showVacantTables();  // Show the available vacant tables
}

// Function to show vacant tables for booking
function showVacantTables() {
    let vacantTables = Object.keys(tableStatus).filter(table => tableStatus[table] === "vacant");
    if (vacantTables.length > 0) {
        let tableSelect = document.getElementById("tableSelect");
        tableSelect.innerHTML = '';  // Clear the current options
        let defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = "Select Table";
        tableSelect.appendChild(defaultOption);

        vacantTables.forEach(table => {
            let option = document.createElement("option");
            option.value = table;
            option.textContent = `Table ${table} - Vacant`;
            tableSelect.appendChild(option);
        });
    } else {
        alert("No tables are available for booking.");
    }
}

// Function to handle table selection and update status
function updateTableStatus() {
    let selectedTable = document.getElementById("tableSelect").value;
    if (selectedTable && tableStatus[selectedTable] === "vacant") {
        tableStatus[selectedTable] = "booked";  // Mark the selected table as booked
        bookingTimers[selectedTable] = Date.now() + 60 * 60 * 1000;  // Table will be unavailable for 1 hour
        tableNumber = selectedTable;  // Store the selected table number
        alert(`You have successfully booked Table ${selectedTable}. It will be available again after 1 hour.`);
        updateTableDropdown();  // Update the table dropdown to reflect status change
    } else if (selectedTable && tableStatus[selectedTable] !== "vacant") {
        alert(`Table ${selectedTable} is already booked or taken.`);
    }
}

// Update the table selection dropdown to reflect the current status of tables
function updateTableDropdown() {
    const tableSelect = document.getElementById("tableSelect");
    tableSelect.innerHTML = "";  // Clear existing options

    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "Select Table";
    tableSelect.appendChild(defaultOption);

    populateTableDropdown(tableSelect);  // Repopulate dropdown with updated table status
}

// Add item to order
function addToOrder() {
    let itemSelect = document.getElementById("itemSelect");
    let quantityInput = document.getElementById("quantity");
    let selectedItem = itemSelect.value;
    let selectedOption = itemSelect.options[itemSelect.selectedIndex];
    let itemPrice = parseInt(selectedOption.getAttribute("data-price"));
    let quantity = parseInt(quantityInput.value);

    if (selectedItem === "" || quantity < 1) {
        alert("Please select a valid item and quantity.");
        return;
    }

    let existingItem = orderItems.find(item => item.name === selectedItem);
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = itemPrice * existingItem.quantity;
    } else {
        orderItems.push({
            name: selectedItem,
            quantity: quantity,
            price: itemPrice * quantity
        });
    }

    updateTable();
}

function updateTable() {
    let orderTableBody = document.getElementById("orderTableBody");
    let totalPriceElement = document.getElementById("totalPrice");
    orderTableBody.innerHTML = "";
    let totalPrice = 0;

    orderItems.forEach((item, index) => {
        let row = orderTableBody.insertRow();
        row.insertCell(0).textContent = item.name;
        row.insertCell(1).textContent = item.quantity;
        row.insertCell(2).textContent = `Ksh ${item.price.toLocaleString()}`;

        let actionCell = row.insertCell(3);
        if (!orderSubmitted) {
            let removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.className = "remove-btn";
            removeBtn.onclick = () => removeItem(index);
            actionCell.appendChild(removeBtn);
        } else {
            let disabledBtn = document.createElement("button");
            disabledBtn.textContent = "Added";
            disabledBtn.className = "remove-btn disabled";
            actionCell.appendChild(disabledBtn);
        }

        totalPrice += item.price;
    });

    totalPriceElement.textContent = totalPrice.toLocaleString();
}

// Remove item from order
function removeItem(index) {
    orderItems.splice(index, 1);
    updateTable();
}

// Order Submission Upgrade
function submitOrder() {
    orderSubmitted = true; // Lock order modifications after submission
    document.querySelectorAll('.remove-item').forEach(button => {
        button.disabled = true; // Prevent item removal
       
    });
    alert("Order submitted! You can still add more items.");
     // Disable all remove buttons
     disableRemoveButtons();
}

function disableRemoveButtons() {
    const removeButtons = document.querySelectorAll(".remove-button");
    removeButtons.forEach(button => {
        button.disabled = true;
    });
}



// Add Order Functionality Still Allowed
function addItemToOrder(item) {
    if (!orderSubmitted) {
        orderList.push(item);
        updateOrderDisplay();
    } else {
        alert("You can still add more items to your order.");
    }
}


// Submit order confirmation
function showConfirmationPopup() {
    if (!tableNumber) {
        alert("Please select a table before submitting your order.");
        return;
    }
    document.getElementById("popupContainer").style.display = "block";
    document.getElementById("popupMessage").textContent = "Are you sure you want to submit your order?";
}

function confirmOrder() {
    orderSubmitted = true;
    document.getElementById("submitOrderBtn").disabled = true;
    document.getElementById("payButton").disabled = false;
    document.getElementById("popupContainer").style.display = "none";
    alert("Your order has been submitted. You can now proceed to payment.");
}

function cancelOrder() {
    document.getElementById("popupContainer").style.display = "none";
}

// Redirect to payment page
function redirectToPayment() {
    if (orderItems.length === 0) {
        alert("Please add items to your order.");
        return;
    }

    const totalPrice = document.getElementById("totalPrice").textContent;
    window.location.href = `Payment page.html?total=${encodeURIComponent(totalPrice)}`;
}

let ratingValue = 0;  // Tracks selected rating value
let feedbackReason = ''; // Tracks feedback reason for 3 stars or below
let positiveFeedback = []; // Tracks positive feedback reasons for 4 and 5 stars

// Handle star selection
function selectStar(star) {
    ratingValue = star;
    updateStarSelection();
    
    // Show feedback options based on the rating
    if (star <= 2) {
        document.getElementById("feedbackSection").style.display = "block";
        document.getElementById("FeedbackSection").style.display = "none";
    } else if (rating === 3) {
        document.getElementById("averageFeedbackSection").style.display = "block";
        document.getElementById("feedbackSection").style.display = "none";
    } else {
        document.getElementById("positiveFeedbackSection").style.display = "block";
        document.getElementById("feedbackSection").style.display = "none";
    }
}

// Enhanced Rating System
function handleRatingSelection(rating) {
    const feedbackSection = document.getElementById("feedback-options");
    feedbackSection.innerHTML = ""; // Clear previous options
    let options = [];
    
    if (rating <= 2) {
        options = ["Cold food", "Late delivery", "Poor service", "Wrong order", "Small portions", "Overpriced", "Unhygienic", "Unfriendly staff", "Bad taste"];
    } else if (rating === 3) {
        options = ["Average service", "Food was okay", "Mediocre taste", "Portions were fair", "Could be better", "Slow but polite", "Neutral experience", "Not memorable", "Could improve"];
    }
    
    if (options.length > 0) {
        let html = "<p>Please select your reasons:</p>";
        options.forEach(option => {
            html += `<label><input type='checkbox' value='${option}'> ${option}</label><br>`;
        });
        feedbackSection.innerHTML = html;
    }
}


// Update the star selection UI
function updateStarSelection() {
    let stars = document.querySelectorAll('.feedback-btn');
    stars.forEach((star, index) => {
        if (index < ratingValue) {
            star.style.backgroundColor = "#ffb900"; // Highlight selected stars
        } else {
            star.style.backgroundColor = "#f0f0f0"; // Reset unselected stars
        }
    });
}

// Handle feedback reason selection for negative or average feedback
function selectReason(reason) {
    feedbackReason = reason;
}

// Handle positive feedback option selection for 4 and 5 stars
function togglePositiveFeedback(reason) {
    if (positiveFeedback.includes(reason)) {
        positiveFeedback = positiveFeedback.filter(r => r !== reason);  // Remove reason
    } else {
        positiveFeedback.push(reason);  // Add reason
    }
}

// Submit feedback
function submitFeedback() {
    if (ratingValue === 0) {
        alert("Please rate our service before submitting feedback.");
        return;
    }

    if (ratingValue <= 3 && !feedbackReason) {
        alert("Please select a reason for your rating.");
        return;
    }

    if (ratingValue >= 4 && positiveFeedback.length === 0) {
        alert("Please select at least one reason for your rating.");
        return;
    }

    // Show a thank you message after submission
    alert(`Thank you for your feedback! You rated us ${ratingValue} stars.\nReason: ${feedbackReason}\nPositive feedback: ${positiveFeedback.join(", ")}`);

    // Show a "thank you" message on the page
    const thankYouMessage = document.createElement('div');
    thankYouMessage.classList.add('thank-you-message');
    thankYouMessage.textContent = 'Thank you for taking your time to rate our services!';
    document.body.appendChild(thankYouMessage);

    // Reset everything after submission
    resetFeedbackForm();
}

// Reset the feedback form after submission
function resetFeedbackForm() {
    ratingValue = 0;
    feedbackReason = '';
    positiveFeedback = [];
    updateStarSelection();
    document.getElementById("feedbackSection").style.display = "none";
    document.getElementById("positiveFeedbackSection").style.display = "none";
    let feedbackButtons = document.querySelectorAll(".feedback-btn");
    feedbackButtons.forEach(button => button.style.backgroundColor = "#f0f0f0");
    let checkboxes = document.querySelectorAll(".positive-feedback-checkbox");
    checkboxes.forEach(checkbox => checkbox.checked = false); // Uncheck all checkboxes
}


// Submit feedback
function submitFeedback() {
    if (ratingValue === 0) {
        alert("Please rate our service before submitting feedback.");
        return;
    }
    if (ratingValue <= 3 && !feedbackReason) {
        alert("Please select a reason for your rating.");
        return;
    }
    alert(`Thank you for your feedback! You rated us ${ratingValue} stars.\nReason: ${feedbackReason}`);
    // You can also send the feedback to your server here if needed
    // For now, just reset everything after submission
    resetFeedbackForm();
}

// Reset the feedback form after submission
function resetFeedbackForm() {
    ratingValue = 0;
    feedbackReason = '';
    updateStarSelection();
    document.getElementById("feedbackSection").style.display = "none";
    let feedbackButtons = document.querySelectorAll(".feedback-btn");
    feedbackButtons.forEach(button => button.style.backgroundColor = "#f0f0f0");
}

// Submit feedback
function submitFeedback() {
    if (ratingValue === 0) {
        alert("Please rate our service before submitting feedback.");
        return;
    }
    if (ratingValue <= 3 && !feedbackReason) {
        alert("Please select a reason for your rating.");
        return;
    }

    // Show a thank you message after submission
    alert(`Thank you for your feedback! You rated us ${ratingValue} stars.\nReason: ${feedbackReason}`);

    // Show a "thank you" message on the page
    const thankYouMessage = document.createElement('div');
    thankYouMessage.classList.add('thank-you-message');
    thankYouMessage.textContent = 'Thank you for taking your time to rate our services!';
    document.body.appendChild(thankYouMessage);

    // Reset everything after submission
    resetFeedbackForm();
}

// Reset the feedback form after submission
function resetFeedbackForm() {
    ratingValue = 0;
    feedbackReason = '';
    updateStarSelection();
    document.getElementById("feedbackSection").style.display = "none";
    let feedbackButtons = document.querySelectorAll(".feedback-btn");
    feedbackButtons.forEach(button => button.style.backgroundColor = "#f0f0f0");
}

function goBack() {
    window.history.back();
}

document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll(".feedback-btn");
    const ratingText = document.getElementById("ratingText");
    const feedbackSection = document.getElementById("feedbackSection");
    const feedbackOptions = document.getElementById("feedbackOptions");
    const submitButton = document.getElementById("submitFeedback");

    // Define feedback categories
    const feedbackCategories = {
        poor: [
            "Food was cold",
            "Service was slow",
            "Price was too high",
            "Food was not fresh",
            "Unhygienic conditions",
            "Long waiting time",
            "Unfriendly staff",
            "Portions were too small",
            "Order was incorrect"
        ],
        average: [
            "Food was okay but not great",
            "Service was acceptable",
            "Price was reasonable",
            "Nothing special about the experience",
            "Ambiance was average"
        ],
        good: [
            "Food was tasty",
            "Service was friendly",
            "Good value for money",
            "Clean environment",
            "Quick service"
        ],
        excellent: [
            "Amazing food quality",
            "Exceptional service",
            "Great ambiance",
            "Highly professional staff",
            "Would definitely recommend",
            "Best dining experience"
        ]
    };

    stars.forEach(star => {
        star.addEventListener("click", function () {
            let rating = this.getAttribute("data-value");

            // Remove previous selections
            stars.forEach(s => s.classList.remove("selected"));

            // Highlight selected stars
            for (let i = 0; i < rating; i++) {
                stars[i].classList.add("selected");
            }

            // Display rating category
            if (rating <= 2) {
                ratingText.textContent = "Poor";
                displayFeedbackOptions(feedbackCategories.poor);
            } else if (rating == 3) {
                ratingText.textContent = "Average";
                displayFeedbackOptions(feedbackCategories.average);
            } else if (rating == 4) {
                ratingText.textContent = "Good";
                displayFeedbackOptions(feedbackCategories.good);
            } else {
                ratingText.textContent = "Excellent";
                displayFeedbackOptions(feedbackCategories.excellent);
            }
        });
    });

    function displayFeedbackOptions(options) {
        feedbackOptions.innerHTML = ""; // Clear previous options
        options.forEach(option => {
            let label = document.createElement("label");
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("feedback-checkbox");
            checkbox.value = option;

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + option));
            feedbackOptions.appendChild(label);
            feedbackOptions.appendChild(document.createElement("br"));
        });

        feedbackSection.style.display = "block";
        submitButton.style.display = "block";
    }

    submitButton.addEventListener("click", function () {
        let selectedFeedback = [];
        document.querySelectorAll(".feedback-checkbox:checked").forEach(checkbox => {
            selectedFeedback.push(checkbox.value);
        });

        if (selectedFeedback.length > 0) {
            alert("Thank you for your feedback: " + selectedFeedback.join(", "));
        } else {
            alert("Please select at least one feedback option.");
        }
    });
});

function showRatingPopup(level) {
    let popup = document.createElement("div");
    popup.className = "rating-popup";
    popup.innerHTML = `<div class='checkmark'>&#10004;</div><p>Thank you for rating us! You gave a ${level} rating.</p>`;
    document.body.appendChild(popup);
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.display = "none";
        document.body.removeChild(popup);
    }, 8000);
}




