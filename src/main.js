let categories = [];
let products = [];

async function loadData() {
    try {
        const response = await fetch('/src/data.json');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        categories = data.categories;
        products = data.products;
        
    } catch (error) {
        console.error("Error loading data:",error);
        document.body.innerHTML='<div style="color: red; text-align: center; margin-top: 2rem;"><h1>Failed to load data. Please try again later.</h1></div>'
    }
    
}

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
