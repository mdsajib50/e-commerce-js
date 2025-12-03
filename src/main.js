let categories = [];
let products = [];
let recentlyViewed = [];

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

        document.getElementById('category-name').textContent = "Recently Viewed Products";
    }else{
        filteredProducts = products.filter(product => product.category === categoryId);
        const category = categories.find(cat => cat.id === categoryId);
        document.getElementById('category-name').textContent = category.name;
    }
}