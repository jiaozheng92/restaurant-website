// Restaurant Website JavaScript
// Core functionality for the restaurant website

class RestaurantApp {
    constructor() {
        this.initializeApp();
        this.setupEventListeners();
        this.loadSavedData();
    }

    initializeApp() {
        // Initialize navigation
        this.setupNavigation();
        
        // Initialize scroll effects
        this.setupScrollEffects();
        
        // Initialize current page functionality
        this.initCurrentPage();
    }

    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // Set active navigation item
        this.setActiveNavItem();
    }

    setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage || 
                (currentPage === '' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    setupScrollEffects() {
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
        });

        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.card, .section').forEach(el => {
            observer.observe(el);
        });
    }

    initCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        switch (currentPage) {
            case 'index.html':
            case '':
                this.initHomePage();
                break;
            case 'menu.html':
                this.initMenuPage();
                break;
            case 'cart.html':
                this.initCartPage();
                break;
            case 'login.html':
                this.initLoginPage();
                break;
            case 'register.html':
                this.initRegisterPage();
                break;
            case 'orders.html':
                this.initOrdersPage();
                break;
        }
    }

    initHomePage() {
        // Home page specific functionality
        this.displayFeaturedItems();
    }

    initMenuPage() {
        // Menu page specific functionality
        this.loadMenuItems();
        this.setupMenuFilters();
        this.setupMenuSearch();
    }

    initCartPage() {
        // Cart page specific functionality
        this.displayCartItems();
        this.updateCartTotal();
    }

    initLoginPage() {
        // Login page specific functionality
        this.setupLoginForm();
    }

    initRegisterPage() {
        // Register page specific functionality
        this.setupRegisterForm();
    }

    initOrdersPage() {
        // Orders page specific functionality
        this.displayUserOrders();
    }

    setupEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                this.addToCart(e.target.dataset.itemId);
            }
            
            if (e.target.classList.contains('remove-from-cart')) {
                this.removeFromCart(e.target.dataset.itemId);
            }
        });

        // Cart icon update
        this.updateCartIcon();
    }

    // Cart Management
    addToCart(itemId) {
        const item = this.getMenuItem(itemId);
        if (!item) return;

        let cart = this.getCart();
        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...item,
                quantity: 1
            });
        }
        
        this.saveCart(cart);
        this.updateCartIcon();
        this.showNotification('商品已添加到购物车', 'success');
    }

    removeFromCart(itemId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== itemId);
        this.saveCart(cart);
        this.updateCartIcon();
        this.displayCartItems();
        this.updateCartTotal();
    }

    getCart() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }

    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    updateCartIcon() {
        const cart = this.getCart();
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartIcon = document.querySelector('.cart-count');
        
        if (cartIcon) {
            cartIcon.textContent = cartCount;
            cartIcon.style.display = cartCount > 0 ? 'block' : 'none';
        }
    }

    displayCartItems() {
        const cartContainer = document.querySelector('.cart-items');
        if (!cartContainer) return;

        const cart = this.getCart();
        
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h3>购物车为空</h3>
                    <p>快去菜单页面选择您喜爱的美食吧！</p>
                    <a href="menu.html" class="btn">立即点餐</a>
                </div>
            `;
            return;
        }

        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 80 80\\"><rect fill=\\"%23f0f0f0\\" width=\\"80\\" height=\\"80\\"/><text x=\\"50%\\" y=\\"50%\\" font-size=\\"12\\" text-anchor=\\"middle\\" dy=\\".3em\\" fill=\\"%23999\\">${item.name}</text></svg>'">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="price">¥${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" onclick="app.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" onclick="app.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-from-cart" data-item-id="${item.id}">删除</button>
            </div>
        `).join('');
    }

    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(itemId);
            return;
        }

        let cart = this.getCart();
        const item = cart.find(cartItem => cartItem.id === itemId);
        
        if (item) {
            item.quantity = newQuantity;
            this.saveCart(cart);
            this.displayCartItems();
            this.updateCartTotal();
            this.updateCartIcon();
        }
    }

    updateCartTotal() {
        const cart = this.getCart();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const totalElement = document.querySelector('.cart-total');
        if (totalElement) {
            totalElement.textContent = `总计: ¥${total.toFixed(2)}`;
        }
    }

    // Menu Management
    getMenuItems() {
        // Sample menu data - in a real app, this would come from an API
        return [
            { id: '1', name: '红烧肉', price: 28, category: 'main', image: 'images/dish1.jpg', description: '经典红烧肉，肥瘦相间，口感丰富' },
            { id: '2', name: '宫保鸡丁', price: 22, category: 'main', image: 'images/dish2.jpg', description: '川菜经典，酸甜适中，香辣可口' },
            { id: '3', name: '麻婆豆腐', price: 18, category: 'main', image: 'images/dish3.jpg', description: '四川传统名菜，麻辣鲜香' },
            { id: '4', name: '酸辣土豆丝', price: 12, category: 'side', image: 'images/dish4.jpg', description: '爽脆酸辣，开胃下饭' },
            { id: '5', name: '可乐', price: 5, category: 'drink', image: 'images/drink1.jpg', description: '冰镇可乐，清爽解腻' },
            { id: '6', name: '绿茶', price: 8, category: 'drink', image: 'images/drink2.jpg', description: '清香绿茶，健康之选' },
            { id: '7', name: '提拉米苏', price: 25, category: 'dessert', image: 'images/dessert1.jpg', description: '意式经典甜品，浓郁香甜' },
            { id: '8', name: '芒果布丁', price: 15, category: 'dessert', image: 'images/dessert2.jpg', description: '新鲜芒果制作，口感顺滑' }
        ];
    }

    getMenuItem(id) {
        return this.getMenuItems().find(item => item.id === id);
    }

    loadMenuItems() {
        const menuContainer = document.querySelector('.menu-items');
        if (!menuContainer) return;

        const menuItems = this.getMenuItems();
        this.displayMenuItems(menuItems);
    }

    displayMenuItems(items) {
        const menuContainer = document.querySelector('.menu-items');
        if (!menuContainer) return;

        menuContainer.innerHTML = items.map(item => `
            <div class="menu-item card" data-category="${item.category}">
                <img src="${item.image}" alt="${item.name}" class="menu-item-image" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 200 150\\"><rect fill=\\"%23f0f0f0\\" width=\\"200\\" height=\\"150\\"/><text x=\\"50%\\" y=\\"50%\\" font-size=\\"14\\" text-anchor=\\"middle\\" dy=\\".3em\\" fill=\\"%23999\\">${item.name}</text></svg>'">
                <div class="menu-item-content">
                    <h3>${item.name}</h3>
                    <p class="description">${item.description}</p>
                    <div class="menu-item-footer">
                        <span class="price">¥${item.price}</span>
                        <button class="btn add-to-cart" data-item-id="${item.id}">加入购物车</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupMenuFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter menu items
                const category = button.dataset.category;
                this.filterMenuItems(category);
            });
        });
    }

    filterMenuItems(category) {
        const menuItems = this.getMenuItems();
        const filteredItems = category === 'all' 
            ? menuItems 
            : menuItems.filter(item => item.category === category);
        
        this.displayMenuItems(filteredItems);
    }

    setupMenuSearch() {
        const searchInput = document.querySelector('.menu-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMenuItems(e.target.value);
            });
        }
    }

    searchMenuItems(searchTerm) {
        const menuItems = this.getMenuItems();
        const filteredItems = menuItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.displayMenuItems(filteredItems);
    }

    displayFeaturedItems() {
        const featuredContainer = document.querySelector('.featured-items');
        if (!featuredContainer) return;

        const menuItems = this.getMenuItems();
        const featuredItems = menuItems.slice(0, 3); // Show first 3 items as featured

        featuredContainer.innerHTML = featuredItems.map(item => `
            <div class="featured-item card">
                <img src="${item.image}" alt="${item.name}" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 200 150\\"><rect fill=\\"%23f0f0f0\\" width=\\"200\\" height=\\"150\\"/><text x=\\"50%\\" y=\\"50%\\" font-size=\\"14\\" text-anchor=\\"middle\\" dy=\\".3em\\" fill=\\"%23999\\">${item.name}</text></svg>'">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="featured-item-footer">
                    <span class="price">¥${item.price}</span>
                    <a href="menu.html" class="btn">查看菜单</a>
                </div>
            </div>
        `).join('');
    }

    // User Management
    setupLoginForm() {
        const loginForm = document.querySelector('.login-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }
    }

    setupRegisterForm() {
        const registerForm = document.querySelector('.register-form');
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(registerForm);
            });
        }
    }

    handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Simple validation (in a real app, this would be server-side)
        if (email && password) {
            const user = { email, loggedIn: true, loginTime: new Date().toISOString() };
            localStorage.setItem('user', JSON.stringify(user));
            this.showNotification('登录成功！', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showNotification('请填写所有字段', 'error');
        }
    }

    handleRegister(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (password !== confirmPassword) {
            this.showNotification('密码不匹配', 'error');
            return;
        }
        
        if (email && password) {
            const user = { email, loggedIn: true, loginTime: new Date().toISOString() };
            localStorage.setItem('user', JSON.stringify(user));
            this.showNotification('注册成功！', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showNotification('请填写所有字段', 'error');
        }
    }

    displayUserOrders() {
        const ordersContainer = document.querySelector('.orders-container');
        if (!ordersContainer) return;

        const orders = this.getUserOrders();
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="text-center">暂无订单</p>';
            return;
        }

        ordersContainer.innerHTML = orders.map(order => `
            <div class="order-item card">
                <h3>订单 #${order.id}</h3>
                <p>日期: ${new Date(order.date).toLocaleDateString()}</p>
                <p>状态: ${order.status}</p>
                <p>总金额: ¥${order.total}</p>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            ${item.name} x${item.quantity} - ¥${item.price * item.quantity}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getUserOrders() {
        return JSON.parse(localStorage.getItem('orders') || '[]');
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    loadSavedData() {
        // Load any saved user data, cart items, etc.
        this.updateCartIcon();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RestaurantApp();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RestaurantApp;
}