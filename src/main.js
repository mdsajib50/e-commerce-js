let categories = [];
let products = [];
let recentlyViewed = [];
let filteredProducts=[];

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
    const product=product.find(item=>item.id===productId);
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
            <p>Delivery by ${deliveryDate.toLocalDateString()}</p>
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
}