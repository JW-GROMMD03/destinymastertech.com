document.addEventListener("DOMContentLoaded", function () {
    const orderList = document.getElementById("order-list");
    const totalPriceElement = document.getElementById("total-price");
    let order = {};

    document.querySelectorAll(".add-btn").forEach(button => {
        button.addEventListener("click", function () {
            const itemName = this.getAttribute("data-name");
            const itemPrice = parseFloat(this.getAttribute("data-price"));
            
            if (order[itemName]) {
                order[itemName].quantity += 1;
                order[itemName].totalPrice += itemPrice;
            } else {
                order[itemName] = {
                    quantity: 1,
                    totalPrice: itemPrice
                };
            }
            
            updateOrderList();
        });
    });

    function updateOrderList() {
        orderList.innerHTML = "";
        let total = 0;
        
        Object.keys(order).forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item} x${order[item].quantity} - KSH ${order[item].totalPrice.toFixed(2)}`;
            
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.style.marginLeft = "10px";
            removeBtn.addEventListener("click", function () {
                if (order[item].quantity > 1) {
                    order[item].quantity -= 1;
                    order[item].totalPrice -= order[item].totalPrice / (order[item].quantity + 1);
                } else {
                    delete order[item];
                }
                updateOrderList();
            });
            
            li.appendChild(removeBtn);
            orderList.appendChild(li);
            total += order[item].totalPrice;
        });

        totalPriceElement.textContent = total.toFixed(2);
    }

    window.placeOrder = function () {
        document.getElementById("confirmation-modal").style.display = "flex";
    };

    window.confirmOrder = function () {
        document.getElementById("confirmation-modal").style.display = "none";
        document.getElementById("order-confirmation-modal").style.display = "block";
    };

    window.closeModal = function () {
        document.getElementById("confirmation-modal").style.display = "none";
    };

    // Proceed to payment
    window.proceedToPayment = function () {
        alert("Redirecting to payment page...");
        window.location.href = "Payment page.html";
    };

    // Login as customer (placeholder function)
    window.loginCustomer = function () {
        alert("Redirecting to customer login...");
        window.location.href = "Login Customer.html";
    };
});

 // Function to go back to the previous page
 function goBack() {
    window.history.back();
}