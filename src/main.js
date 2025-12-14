let categories = [];
let products = [];
let recentlyViewed = [];
let filteredProducts=[];

let cart=[];
let orders=[];
let currentOrderSteps=1;

let currentUser={
    name:'',
    email:'',
    phone:'',
    address:''
}

async function loadData() {
    try {
        const response = await fetch('/src/data.json');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        categories = data.categories;
        products = data.products;
        initializeApp();
        
    } catch (error) {
        console.error("Error loading data:",error);
        document.body.innerHTML='<div style="color: red; text-align: center; margin-top: 2rem;"><h1>Failed to load data. Please try again later.</h1></div>'
    }
    
}

function initializeApp() {
    renderCategories();
    showPage('home');
}
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    const targetPage = document.getElementById(pageId + 'page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    switch (pageId) {
        case "home":
            renderCategories();
            break;
        case "cart":
            renderCart();
            break;
        case "orders":
            renderOrders();
            break;
        case "account":
            renderUserAccount();
            break;
    
        default:
            break;
    }
}

function renderCategories() {
    const categoriesGrid = document.getElementById('categories-grid');
    categoriesGrid.innerHTML = '';
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.classList.add('category-card');
        categoryCard.onclick=()=>showCategory(category.id);
        let cardContent= `
            <img src="${category.image}" alt="${category.name}">
           <div class="category-card-content">$<h2>${category.name}</h2>
            <p>${category.description}</p>
            
        `;

        if (category.isRecentlyViewed) {
            if (recentlyViewed.length === 0) {
                cardContent += '<p class="recently-viewed">Recently Viewed</p>';
            }else{
                cardContent +=`<p class="recently-viewed">  you have ${recentlyViewed.length} recently viewed products</p>`
            }
        } 
        cardContent +=`<a href="#" class="category-card-btn">View Products</a></div>`;
        categoryCard.innerHTML = cardContent;

        categoriesGrid.appendChild(categoryCard);
    });
}

function showCategory(categoryId) {
    if (categoryId ==="recently-viewed") {
        filteredProducts = products.filter(product => recentlyViewed.includes(product.id));

        document.getElementById('category-title').textContent = "Recently Viewed Products";
    }else{
        filteredProducts = products.filter(product => product.category === categoryId);
        const category = categories.find(cat => cat.id === categoryId);
        document.getElementById('category-title').textContent = category.name;
    }

    populateFilters();
    renderProducts();
    showPage('category')

}

function populateFilters() {
    const brandFilter = document.getElementById("brand-filter");
    const brands=[...new Set(filteredProducts.map(product=>product.brand))];

    brandFilter.innerHTML=`<option>All Brands</option>`;
    brands.forEach(brand=>{
        const option=document.createElement("option");
        option.value=brand;
        option.textContent=brand;
        brandFilter.appendChild(option);
    })
}

function applyFilters() {
    const sortBy=document.getElementById('sort-by').value;
    const maxPrice=parseInt(document.getElementById('price-range').value);
    const selectedBrand=document.getElementById('brand-filter').value;

    document.getElementById('price-value').textContent= maxPrice;

    let filtered =filteredProducts.filter(product=>{
        if (product.price>maxPrice) {
            return false
        }
        if (selectedBrand && product.brand !==selectedBrand) {
            return false
        }
        return true;
    })

    switch (sortBy) {
        case "price-low":
            filtered.sort((a,b)=> a.price-b.price)
            break;
        case "price-high":
            filtered.sort((a,b)=>b.price-a.price)
            break;
        case "rating":
            filtered.sort((a,b)=>b.rating- a.rating)
            break;    
        default:
            break;
    }
    renderProducts(filtered);
};

function renderProducts(products=filteredProducts) {
    const productGrid=document.getElementById('product-grid');
    productGrid.innerHTML="";
    if (products.length === 0) {
        productGrid.innerHTML='<p>No Product Found Matching Your Criteria</p>';
        return
    }
    products.forEach(product=>{
        const productCard=document.createElement("div");
        productCard.className="product-card";
        productCard.onclick=()=>showProduct(product.id);

        productCard.innerHTML=`
            <img src="${product.image}" alt="${product.name}"/>
            <div class="product-card-content">
            <div class="product-brand">${product.brand}</div>
            <h3>${product.name}</h3>
            <div class="product-rating">
                ${"*".repeat(Math.floor(product.rating))}${"*".repeat(5-Math.floor(product.rating))}
                ${product.rating}
            </div>
                <div class="product-price">
                    <span class="current-price">${product.price}</span>
                    <span class="original-price">${product.originalPrice}</span>
                    <span class="discount-price">${product.discount}% OFF</span>
                </div>
            </div>
        `
        productGrid.appendChild(productCard)
    })
};

function showProduct(productId) {
    const product=products.find(item=>item.id===productId);
    if (!product) return;

    if (!recentlyViewed.includes(productId)) {
        recentlyViewed.unshift(productId);
        if (recentlyViewed.length>10) {
            recentlyViewed.pop()
        }
        saveRecentlyViewed();
    }

    const productDetail=document.getElementById('product-details');
    const deliveryDate=new Date();
    
    deliveryDate.setDate(deliveryDate.getDate()+7);

    productDetail.innerHTML=`
        <div>
      <img src="${product.image}" alt="${product.name}" srcset="" class="product-image">
    </div>
    <div class="product-info">
      <h1>${product.name}</h1>
      <div class="brand">${product.brand}</div>
      <div class="product-rating">
            ${"*".repeat(Math.floor(product.rating))}${"*".repeat(5-Math.floor(product.rating))}
                ${product.rating}/5
      </div>
        <div class="product-price">
                    <span class="current-price">${product.price}</span>
                    <span class="original-price">${product.originalPrice}</span>
                    <span class="discount-price">${product.discount}% OFF</span>
        </div>
        <div class="description">${product.description}</div>
        <div>
            ${product.colors.length>0 ?`
                <div class="option-group">
                <label>Color:</label>
                <select id="selected-color">
                    ${product.colors.map(color=>`<option value="${color}>${color}</option>`).join("")}
                </select>
                </div>
                `:""}

                ${product.sizes.length>0 ?`
                <div class="option-group">
                <label>Sizes:</label>
                <select id="selected-sizes">
                    ${product.sizes.map(size=>`<option value="${size}>${size}</option>`).join("")}
                </select>
                </div>
                `:""}
        </div>
        <div class="address-section">
        <h3>Delivery-Address</h3>
        ${currentUser.address ? `
            <p>${currentUser.address}</p>
            <button class="btn-secondary" onclick="showPage("account")">Change Address</button>`:`
            <p>No address added</p>
            <button class="btn-secondary" onclick="showPage("account")">Add Address</button>
            `}
        </div>
        <div class="delivery-info">
            <h4>Delivery Information</h4>
            <p>Delivery by ${deliveryDate.toLocaleDateString()}</p>
            <p>10 days return policy</p>
            <p>Cash on delivery available</p>
        </div>
        <div class="product-actions">
            <button class="btn-primary" onclick="addToCart(${product.id})">Add to cart</button>
            <button class="btn-secondary" onclick="buyNow(${product.id})">Buy Now</button>
        </div>
    </div>
    `;

    showPage('product')
};

function buyNow(productId) {
    addToCart(productId);

    showPage('order');
};

function addToCart(productId) {
    const product=products.find(product=>product.id === productId);
    if(!product) return;

    const selectedColor= document.getElementById('selected-color')?.value || '';
    const selectedSize= document.getElementById('selected-size')?.value || '';

    const existingItem = cart.find(item=>
        item.id === productId &&
        item.color === selectedColor &&
        item.size === selectedSize
    )
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id:productId,
            name:product.name,
            brand:product.brand,
            price:product.price,
            originalPrice:product.originalPrice,
            discount:product.discount,
            image:product.image,
            color:selectedColor,
            size:selectedSize,
            quantity: 1
        })
    }
    updateCartCount();
    saveCartData();
    alert('Product added to cart');
    renderCart();
}

function renderCart() {
    const cartItems=document.getElementById('cart-item');
    const cartSummary=document.getElementById('cart-summary');
    if (cart.length === 0) {
        cartItems.innerHTML=`<p>Your cart is empty, <a href="#" onclick="showPage(\'home\')">Continue Shopping</a></p>`;
        cartSummary.innerHTML='';
        return;
    }

    cartItems.innerHTML='';
    let totalOriginal =0;
    let totalDiscounted =0;

    cart.forEach((item,index)=>{
        const itemTotal = item.price * item.quantity;
        const itemOriginalTotal = item.originalPrice * item.quantity;
        totalOriginal = itemOriginalTotal;
        totalDiscounted = itemTotal;

        const cartItemsCard=document.createElement('div');
        cartItemsCard.className='cart-item-card';

        cartItemsCard.innerHTML=`
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
            <h3>${item.name}</h3>
            <div class="brand">${item.brand}</div>
            ${item.color ? `<div>Color: ${item.color}</div>` :''}
            ${item.size ? `<div>Size: ${item.size}</div>` :''}
            <div class="product-price">
                <span class="current-price">${item.price}</span>
                <span class="original-price">${item.originalPrice}</span>
                <span class="discount-price">${item.discount}% OFF</span>
                </div>
            <div class="quantity-control">
                <button onclick="updateCartItemQuantity(${index}, ${item.quantity - 1})">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${index}, parseInt(this.value))">
                <button onclick="updateCartItemQuantity(${index}, ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">Total: ${itemTotal}</div>
            <button class="remove-item" onclick="removeCartItem(${index})">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItemsCard);
    });
    const deliveryFee= totalDiscounted > 500 ? 0 : 50;
    const grandTotal= totalDiscounted + deliveryFee;

    cartSummary.innerHTML=`
        <h3>Cart Summary</h3>
        <div class="summary-item">
        <span>Original Total:</span>
        <span>${totalOriginal}</span>
        </div>
        <div class="summary-item">
        <span>Discounted Total:</span>
        <span>${totalDiscounted}</span>
        </div>
        <div class="summary-item">
        <span>Delivery Fee:</span>
        <span>${deliveryFee === 0 ? 'Free' : deliveryFee}</span>
        </div>
        <div class="summary-item">
        <span>Total Amount:</span>
        <span>${grandTotal}</span>
        </div>
        <button class="btn-primary" onclick="proceedToCheckout()">Proceed to Checkout</button>
    `;

}

function updateCartItemQuantity(index, change,newValue=null) {
    if (newValue !== null) {
        cart[index].quantity = Math.max(1, parseInt(newValue) || 1);
    } else {
        cart[index].quantity = Math.max(1,cart[index].quantity + change);
    }
    saveCartData();
    renderCart();
    updateCartCount();
};

function renderOrderSteps() {
    const orderSteps=document.getElementById('order-steps');
    if (currentOrderSteps === 1) {
        if (!currentUser.name || !currentUser.phone || !currentUser.address) {
            orderSteps.innerHTML=`
            <div class="order-form">
            <h2>Step 1: Enter Your Details</h2>
            <div class="form-group">

            <label for="user-name">Name:</label>
            <input type="text" id="user-name" value="${currentUser.name}">
            <label for="user-email">Email:</label>
            <input type="email" id="user-email" value="${currentUser.email}">
            <label for="user-phone">Phone:</label>
            <input type="text" id="user-phone" value="${currentUser.phone}">
            <label for="user-address">Address:</label>
            <textarea id="user-address">${currentUser.address}</textarea>
            <button class="btn-primary" onclick="saveUserDetails()">Save and Continue</button>
            </div>

            </div>
            `;
        }else{
            currentOrderSteps=2;
            renderOrderSteps();
        }
    }else if (currentOrderSteps === 2) {
        const cartTotal= cart.reduce((total,item)=> total + (item.price * item.quantity),0);
        const deliveryFee= cartTotal > 500 ? 0 : 50;
        const grandTotal= cartTotal + deliveryFee;

        let cartItemsHTML='';
        cart.forEach(item=>{
            cartItemsHTML +=`
            <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">

                <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="product-brand">${item.brand} </div>
                ${item.color ? `<p>Color: ${item.color}</p>` :''}
                ${item.size ? `<p>Size: ${item.size}</p>` :''}
                <p>Quantity: ${item.quantity}</p>
                <p>Price: ${item.price * item.quantity}</p>
                </div>
            </div>
            `;
        });
        orderSteps.innerHTML=`
        <div class="order-form"> 
            <h2>Step 2: Order Summary</h2>
            <div class="address-section">
                <h3>Delivery Address</h3>
                <p>${currentUser.name}</p>
                <p>${currentUser.phone}</p>
                <p>${currentUser.address}</p>
            </div>
            <h3>Order Items</h3>
            ${cartItemsHTML}
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Items Total:</span>
                    <span>${cartTotal}</span>
                </div>
                <div class="summary-row">
                    <span>Delivery Fee:</span>
                    <span>${deliveryFee === 0 ? 'Free' : deliveryFee}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row summary-total">
                    <span>Total Amount:</span>
                    <span>${grandTotal}</span>
                </div>
            </div>
               
            <button class="btn-primary" onclick="proceedToPayment()">Proceed to Payment</button>
        </div>
        `;
    }else if (currentOrderSteps === 3) { 
        orderSteps.innerHTML=`
        <div class="order-form">
            <h2>Step 3: Payment</h2>
            <div class="payment-methods">
                <label>
                    <input type="radio" name="payment-method" value="cod" checked>
                    Cash on Delivery
                </label>
                <label>
                    <input type="radio" name="payment-method" value="card" disabled>
                    Credit/Debit Card (Coming Soon)
                </label>
                <label>
                    <input type="radio" name="payment-method" value="upi" disabled>
                    UPI (Coming Soon)
                </label>
            </div>
            <div class="payment-summary">
                <p>Total Amount to be Paid: ${
                    cart.reduce((total,item)=> total + (item.price * item.quantity),0) +
                    (cart.reduce((total,item)=> total + (item.price * item.quantity),0) > 500 ? 0 : 50)
                }</p>
                <button class="btn-primary" onclick="completeOrder()">Complete Order</button>
            </div>
        </div>
        `;  
    } 
}
function saveOrderDetails() {
    const name=document.getElementById('user-name').value.trim();
    const email=document.getElementById('user-email').value.trim();
    const phone=document.getElementById('user-phone').value.trim();
    const address=document.getElementById('user-address').value.trim();

    if (!name || !phone || !address) {
        alert('Please fill in all required fields.');
        return;
    }
    currentUser={
        name,
        email,
        phone,
        address
    };
    saveUserData();
    currentOrderSteps=2;
    renderOrderSteps();
}
function saveUserData() {
    try {
        window.userData = currentUser;
    } catch (error) {
        console.log("Storage not available");
    }
}

function removeCartItem(index) {
    cart.splice(index,1);
    saveCartData();
    renderCart();
    updateCartCount();
}

function proceedToCheckout() {
    currentOrderSteps = 1;
    renderCheckout();
    showPage('order');
}
function updateCartCount() {
    const cartCount= cart.reduce((total, item)=>total + item.quantity, 0);
    document.getElementById('cart-count').innerText = `(${cartCount})`;
}

function saveCartData() {
    try {
        window.cartData = cart;
    } catch (error) {
        console.log("Storage not available");
        
    }
}
function saveRecentlyViewed() {
    try {
        window.recentlyViewedData=recentlyViewed;
    } catch (error) {
        console.log("Storage not available.");
        
    }
}