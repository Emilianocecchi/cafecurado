/**
 * Café Curado - E-commerce de café de especialidad
 * Código JavaScript para la interactividad del sitio
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const planButtons = document.querySelectorAll('.plan-button');
    const planModal = document.getElementById('plan-modal');
    const cartButton = document.querySelector('.cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    const notification = document.getElementById('notification');
    const notificationClose = document.querySelector('.notification-close');
    const notificationMessage = document.querySelector('.notification-message');
    const categoryTabs = document.querySelectorAll('.tab-button');
    const productCards = document.querySelectorAll('.product-card');
    const sliderPrev = document.querySelector('.slider-prev');
    const sliderNext = document.querySelector('.slider-next');
    const roasterCards = document.querySelectorAll('.roaster-card');
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    const ctaHeroButton = document.querySelector('.hero .cta-button');

    // Variables globales
    let cart = [];
    let currentSlide = 0;
    
    // =============== NAVEGACIÓN MÓVIL ===============
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Cerrar menú móvil al hacer clic en un enlace
    const navLinkElements = document.querySelectorAll('.nav-links a');
    navLinkElements.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
            }
        });
    });
    
    // =============== MODALES ===============
    // Abrir modal de plan
    if (planButtons.length > 0) {
        planButtons.forEach(button => {
            button.addEventListener('click', function() {
                const planId = this.closest('.plan-card').id;
                const planName = this.closest('.plan-card').querySelector('h3').textContent;
                
                // Actualizamos el título del modal con el nombre del plan
                planModal.querySelector('h3').textContent = `Personalizá tu plan: ${planName}`;
                
                // Guardamos el ID del plan seleccionado para usarlo al confirmar
                planModal.dataset.selectedPlan = planId;
                
                openModal(planModal);
            });
        });
    }
    
    // Abrir modal del carrito
    if (cartButton) {
        cartButton.addEventListener('click', function() {
            updateCartModal();
            openModal(cartModal);
        });
    }
    
    // Cerrar modales
    if (closeModalButtons.length > 0) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
    }
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    // Funciones para abrir y cerrar modales
    function openModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // =============== CARRITO DE COMPRAS ===============
    // Agregar productos al carrito
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.product-price').textContent;
                const productImageUrl = productCard.querySelector('.product-image').style.backgroundImage.slice(4, -1).replace(/"/g, "");
                
                // Extraer el precio como número
                const price = parseFloat(productPrice.replace('$', '').replace('.', '').trim());
                
                const product = {
                    id: generateProductId(productName),
                    name: productName,
                    price: price,
                    quantity: 1,
                    image: productImageUrl
                };
                
                addToCart(product);
                
                // Mostrar notificación
                showNotification(`${productName} agregado al carrito`);
            });
        });
    }
    
    // Generar ID único para productos
    function generateProductId(name) {
        return name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    // Agregar producto al carrito
    function addToCart(product) {
        // Verificar si el producto ya está en el carrito
        const existingProductIndex = cart.findIndex(item => item.name === product.name);
        
        if (existingProductIndex > -1) {
            // Si existe, aumentar cantidad
            cart[existingProductIndex].quantity += 1;
        } else {
            // Si no existe, agregarlo
            cart.push(product);
        }
        
        updateCartCount();
        saveCartToLocalStorage();
    }
    
    // Actualizar contador del carrito
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
    
    // Actualizar modal del carrito
    function updateCartModal() {
        const cartItems = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.total-amount');
        const emptyCart = document.querySelector('.empty-cart');
        const checkoutButton = document.querySelector('.checkout-button');
        
        if (cartItems) {
            // Limpiar contenido actual
            cartItems.innerHTML = '';
            
            if (cart.length === 0) {
                // Mostrar mensaje de carrito vacío
                cartItems.appendChild(emptyCart);
                cartTotal.textContent = '$0';
                checkoutButton.disabled = true;
                emptyCart.style.display = 'block';
            } else {
                // Ocultar mensaje de carrito vacío
                emptyCart.style.display = 'none';
                checkoutButton.disabled = false;
                
                // Crear elementos para cada producto
                let total = 0;
                
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    
                    cartItem.innerHTML = `
                        <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-item" data-id="${item.id}">&times;</button>
                    `;
                    
                    cartItems.appendChild(cartItem);
                });
                
                // Actualizar total
                cartTotal.textContent = `$${total.toLocaleString()}`;
                
                // Agregar event listeners para los botones de cantidad y eliminar
                const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
                const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
                const removeButtons = document.querySelectorAll('.remove-item');
                
                decreaseButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        decreaseQuantity(this.dataset.id);
                    });
                });
                
                increaseButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        increaseQuantity(this.dataset.id);
                    });
                });
                
                removeButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        removeItem(this.dataset.id);
                    });
                });
            }
        }
    }
    
    // Aumentar cantidad de un producto
    function increaseQuantity(id) {
        const itemIndex = cart.findIndex(item => item.id === id);
        
        if (itemIndex > -1) {
            cart[itemIndex].quantity += 1;
            updateCartCount();
            updateCartModal();
            saveCartToLocalStorage();
        }
    }
    
    // Disminuir cantidad de un producto
    function decreaseQuantity(id) {
        const itemIndex = cart.findIndex(item => item.id === id);
        
        if (itemIndex > -1) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }
            
            updateCartCount();
            updateCartModal();
            saveCartToLocalStorage();
        }
    }
    
    // Eliminar un producto del carrito
    function removeItem(id) {
        const itemIndex = cart.findIndex(item => item.id === id);
        
        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
            updateCartCount();
            updateCartModal();
            saveCartToLocalStorage();
            
            // Si el carrito queda vacío, mostrar mensaje
            if (cart.length === 0) {
                document.querySelector('.empty-cart').style.display = 'block';
            }
        }
    }
    
    // Guardar carrito en localStorage
    function saveCartToLocalStorage() {
        localStorage.setItem('cafeCuradoCart', JSON.stringify(cart));
    }
    
    // Cargar carrito desde localStorage
    function loadCartFromLocalStorage() {
        const storedCart = localStorage.getItem('cafeCuradoCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            updateCartCount();
        }
    }
    
    // =============== NOTIFICACIONES ===============
    // Mostrar notificación
    function showNotification(message) {
        if (notification && notificationMessage) {
            notificationMessage.textContent = message;
            notification.classList.add('show');
            
            // Ocultar después de 3 segundos
            setTimeout(() => {
                hideNotification();
            }, 3000);
        }
    }
    
    // Ocultar notificación
    function hideNotification() {
        if (notification) {
            notification.classList.remove('show');
        }
    }
    
    // Cerrar notificación al hacer clic en el botón de cerrar
    if (notificationClose) {
        notificationClose.addEventListener('click', hideNotification);
    }
    
    // =============== FILTRO DE PRODUCTOS ===============
    // Cambiar categoría de productos
    if (categoryTabs.length > 0) {
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Quitar clase active de todas las pestañas
                categoryTabs.forEach(t => t.classList.remove('active'));
                
                // Agregar clase active a la pestaña actual
                this.classList.add('active');
                
                // Filtrar productos
                const category = this.dataset.category;
                filterProducts(category);
            });
        });
    }
    
    // Filtrar productos por categoría
    function filterProducts(category) {
        if (productCards.length > 0) {
            productCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
    
    // =============== SLIDER DE TOSTADORES ===============
    // Inicializar slider
    function initSlider() {
        if (roasterCards.length > 0) {
            // Esconder todas las tarjetas excepto las primeras 3 (o menos si hay menos)
            const visibleCount = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
            showSlides(currentSlide, visibleCount);
            
            // Event listeners para las flechas
            if (sliderPrev) {
                sliderPrev.addEventListener('click', function() {
                    prevSlide(visibleCount);
                });
            }
            
            if (sliderNext) {
                sliderNext.addEventListener('click', function() {
                    nextSlide(visibleCount);
                });
            }
        }
    }
    
    // Mostrar slides
    function showSlides(startIndex, visibleCount) {
        if (roasterCards.length > 0) {
            // Ocultar todas las tarjetas
            roasterCards.forEach(card => {
                card.style.display = 'none';
            });
            
            // Mostrar solo las tarjetas del rango actual
            for (let i = startIndex; i < startIndex + visibleCount; i++) {
                if (i < roasterCards.length) {
                    roasterCards[i].style.display = 'block';
                }
            }
            
            // Actualizar estado de las flechas
            updateArrowState(visibleCount);
        }
    }
    
    // Actualizar estado de las flechas (deshabilitarlas si no hay más slides)
    function updateArrowState(visibleCount) {
        if (sliderPrev && sliderNext) {
            sliderPrev.disabled = currentSlide === 0;
            sliderNext.disabled = currentSlide + visibleCount >= roasterCards.length;
            
            sliderPrev.style.opacity = currentSlide === 0 ? '0.5' : '1';
            sliderNext.style.opacity = currentSlide + visibleCount >= roasterCards.length ? '0.5' : '1';
        }
    }
    
    // Slide anterior
    function prevSlide(visibleCount) {
        if (currentSlide > 0) {
            currentSlide--;
            showSlides(currentSlide, visibleCount);
        }
    }
    
    // Slide siguiente
    function nextSlide(visibleCount) {
        if (currentSlide + visibleCount < roasterCards.length) {
            currentSlide++;
            showSlides(currentSlide, visibleCount);
        }
    }
    
    // Reiniciar slider al cambiar tamaño de ventana
    window.addEventListener('resize', function() {
        const visibleCount = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
        currentSlide = 0; // Reiniciar a la primera slide
        showSlides(currentSlide, visibleCount);
    });
    
    // =============== DESPLAZAMIENTO SUAVE ===============
    // Scroll suave para enlaces internos
    if (scrollLinks.length > 0) {
        scrollLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Prevenir comportamiento predeterminado
                e.preventDefault();
                
                // Obtener el id del elemento de destino
                const targetId = this.getAttribute('href');
                
                // Verificar si el id existe
                if (targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        // Calcular posición del elemento
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = targetPosition - 100; // Ajustar por el header fijo
                        
                        // Hacer scroll
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
    
    // =============== CTA DEL HERO ===============
    // Enlazar botón CTA del hero a la sección de planes
    if (ctaHeroButton) {
        ctaHeroButton.addEventListener('click', function() {
            const plansSection = document.getElementById('plans');
            
            if (plansSection) {
                const targetPosition = plansSection.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - 100; // Ajustar por el header fijo
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // =============== FORMULARIO DEL MODAL DE PLAN ===============
    // Manejar envío del formulario de plan
    const planForm = document.querySelector('.plan-form');
    if (planForm) {
        planForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const planId = planModal.dataset.selectedPlan;
            const planName = planModal.querySelector('h3').textContent.replace('Personalizá tu plan: ', '');
            const grindType = document.querySelector('input[name="grind"]:checked').value;
            const frequency = document.querySelector('input[name="frequency"]:checked').value;
            
            // Obtener precio del plan seleccionado
            const planCard = document.getElementById(planId);
            let planPrice = 0;
            
            if (planCard) {
                const priceText = planCard.querySelector('.plan-price').textContent;
                planPrice = parseFloat(priceText.replace('$', '').replace('.', '').replace(' /mes', '').trim());
            }
            
            // Crear objeto con los datos del plan
            const planData = {
                id: planId,
                name: planName,
                price: planPrice,
                grindType: grindType,
                frequency: frequency
            };
            
            // Aquí se podría enviar los datos a un servidor o almacenarlos
            console.log('Plan seleccionado:', planData);
            
            // Mostrar notificación de éxito
            showNotification(`Plan ${planName} agregado correctamente`);
            
            // Cerrar modal
            closeModal(planModal);
        });
    }
    
    // =============== INICIALIZACIÓN ===============
    // Cargar carrito desde localStorage
    loadCartFromLocalStorage();
    
    // Inicializar slider
    initSlider();
    
    // Mostrar todos los productos al inicio
    filterProducts('all');
    
    console.log('Café Curado - Sitio inicializado correctamente');
});
