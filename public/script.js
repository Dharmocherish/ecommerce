document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCategories();
    loadCartFromLocalStorage();

    //variable for search button
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', searchProduct);

     // Variables for showing and hiding the cart
     const cartIcon = document.getElementById('cartIcon');
     const cartSidebar = document.getElementById('cartSidebar');
     const closeCart = document.getElementById('closeCart');
    //  Variables for showing and hiding menu on navbar
     const menuTog = document.getElementById('menuIcon')
     const navLinks = document.getElementById('navbarLinks')
    // Event listeners on showing and hiding menu options and carts
     cartIcon.addEventListener('click', function() {
         cartSidebar.classList.toggle('hidden');
     });
 
     closeCart.addEventListener('click', function() {
         cartSidebar.classList.add('hidden');
     });
     menuTog.addEventListener('click', function() {
        navLinks.classList.toggle('hidden')
     })
});


// Cart variable (global)
let cart = [];
//functionality for search product
function searchProduct() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    fetch('https://fakestoreapi.com/products')
        .then(response => response.json())
        .then(function(products) {
            const foundProducts = products.filter(product => product.title.toLowerCase().includes(searchInput));
            if (foundProducts.length > 0) {
                displayProducts(foundProducts);
            } else {
                alert('Product not found');
                displayProducts([]); // Clear product display if not found
            }
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Fetching of products
function loadProducts() {
    fetch('https://fakestoreapi.com/products')
        .then(response => response.json())
        .then(function(products) {
            displayProducts(products);
        });
}
// Displaying and styling of products
function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    
    // products.forEach(function(product) {
    //     const productItem = document.createElement('div');
    //     productItem.classList.add('product-item', 'border', 'p-4', 'rounded-lg', 'bg-white', 'shadow-md', 'w-64', 'my-4');
        
    //     productItem.innerHTML = `
    //         <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover rounded-lg mb-4">
    //         <h3 class="text-lg font-bold mb-2">${product.title}</h3>
    //         <p class="text-sm text-gray-600 mb-2">${product.description}</p>
    //         <p class="text-lg font-semibold mb-2">$${product.price}</p>
    //         <button class="bg-blue-500 text-white px-4 py-2 rounded-lg" onclick="viewProduct(${product.id})">View Details</button>
    //         <button class="bg-green-500 text-white px-4 py-2 rounded-lg mt-2" onclick="addToCart(${product.id})">Add to Cart</button>
    //     `;
        
    //     productList.appendChild(productItem);
    // });
    products.forEach(function(product) {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item', 'border', 'p-4', 'rounded-lg', 'bg-white', 'shadow-md', 'w-[20%]');
        
        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover rounded-lg mb-4">
            <h3 class="text-lg font-bold mb-2">${product.title}</h3>
            <p class="text-lg font-semibold mb-2">$${product.price}</p>
            <button id="addToCart-${product.id}" class="bg-green-500 text-white px-4 py-2 rounded-lg mt-2" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        
        productList.appendChild(productItem);
    });
}
//Fetching Product Categories

function loadCategories() {
    fetch('https://fakestoreapi.com/products/categories')
        .then(response => response.json())
        .then(function(categories) {
            const categoryFilter = document.getElementById('categoryFilter');
            
            categories.forEach(function(category) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        });
}
// product filter
function filterByCategory() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const url = selectedCategory === 'all' ? 'https://fakestoreapi.com/products' : `https://fakestoreapi.com/products/category/${selectedCategory}`;
    
    fetch(url)
        .then(response => response.json())
        .then(function(products) {
            displayProducts(products);
            calculateTotalPrice(products);
        });
}
// Fetching products details
function viewProduct(productId) {
    fetch(`https://fakestoreapi.com/products/${productId}`)
        .then(response => response.json())
        .then(function(product) {
            const productDetails = document.getElementById('productDetails');
            productDetails.innerHTML = `
                <img src="${product.image}" alt="${product.title}" class="w-full h-64 object-cover rounded-lg mb-4 ">
                <h2 class="text-2xl font-bold mb-2">${product.title}</h2>
                <p class="text-lg text-gray-600 mb-2">${product.description}</p>
                <p class="text-xl font-semibold mb-2">$${product.price}</p>
                <button class="bg-green-500 text-white px-4 py-2 rounded-lg mt-2" onclick="addToCart(${product.id})">Add to Cart</button>
                <button class="bg-red-500 text-white px-4 py-2 rounded-lg mt-2" onclick="closeDetails()">Close</button>
            `;
            productDetails.classList.remove('hidden');
        });
}
// closing product details

function closeDetails() {
    document.getElementById('productDetails').classList.add('hidden');
}

// adding to cart

function addToCart(productId) {
    fetch(`https://fakestoreapi.com/products/${productId}`)
        .then(response => response.json())
        .then(function(product) {
            const existingProduct = cart.find(item => item.id === product.id);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                product.quantity = 1; // Initialize quantity
                cart.push(product);
            }
            updateCart();
            // showCart();
            updateCartBadge()
            // hiding add to cart button whenever I add to cart
            const addToCartButton = document.getElementById(`addToCart-${product.id}`);
            if (addToCartButton) {
                addToCartButton.style.display = 'none';
            }
            // Save cart to localStorage
            saveCartToLocalStorage();
        });
}
// deleting from cart
function deleteFromCart(productId) {
    cart = cart.filter(function(product) {
        return product.id !== productId;
    });
    updateCart();
    updateCartBadge();
    // Show the "Add to Cart" button
    const addToCartButton = document.getElementById(`addToCart-${productId}`);
    if (addToCartButton) {
        addToCartButton.style.display = 'block';

        // Remove the increment/decrement buttons
        const quantityControls = document.getElementById(`quantityControls-${productId}`);
        if (quantityControls) {
            quantityControls.remove();
        }
    }

    // Save cart to localStorage
    saveCartToLocalStorage();

}
// Updating and styling of products in the carts
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    
    let totalPrice = 0;
    cart.forEach(function(product) {
        const cartItem = document.createElement('div');
        cartItem.innerHTML = `
            <div class="flex flex-col mb-2">
                <img src="${product.image}" class="h-[9.5rem] w-[9.5rem]" alt="${product.title}">
                <p>${product.title}</p>
                <p>$${(product.price * product.quantity).toFixed(2)}</p> <!-- Corrected price calculation -->
                <div id="quantityControls-${product.id}" class="flex justify-between items-center mt-2">
                    <button class="bg-gray-300 text-black px-3 py-1 rounded-lg" onclick="decrementQuantity(${product.id})">-</button>
                    <span id="quantity-${product.id}" class="mx-2">${product.quantity}</span>
                    <button class="bg-gray-300 text-black px-3 py-1 rounded-lg" onclick="incrementQuantity(${product.id})">+</button>
                </div>
            </div>
            <button class="bg-red-500 text-white px-2 py-1 rounded-lg" onclick="deleteFromCart(${product.id})">Remove</button>
        `;
        cartItems.appendChild(cartItem);

        totalPrice += product.price * product.quantity;
    });

    document.getElementById('cartTotal').textContent = totalPrice.toFixed(2);
    updateCartBadge();
}
// price calculation
function calculateTotalPrice(products) {
    const totalPrice = products.reduce(function(total, product) {
        return total + product.price;
    }, 0);
    
    alert(`Total price of products in this category: $${totalPrice.toFixed(2)}`);
}
// Function to show the cart automatically whenever a user add product to cart
// function showCart() {
//     const cartSidebar = document.getElementById('cartSidebar');
//     cartSidebar.classList.remove('hidden');
// }
function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    const cartItemCount = cart.length;

    if (cartItemCount > 0) {
        cartBadge.textContent = cartItemCount;
        cartBadge.classList.remove('hidden');
    } else {
        cartBadge.classList.add('hidden');
    }
    cartBadge.textContent = cart.length;
}
// Save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCart();
    }
}
// Increment quantity
function incrementQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += 1;
        updateCart();
        saveCartToLocalStorage();
    }
}

// Decrement quantity
function decrementQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem && cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        updateCart();
        saveCartToLocalStorage();
    } else {
        deleteFromCart(productId); // Remove from cart if quantity is less than 1
    }
}

