import BasePage from '../base-page';

class ProductCard extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    // Parse product data
    this.product = this.product || JSON.parse(this.getAttribute('product')); 

    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady());
    }
  }

  onReady() {
    this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
    this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
    this.getProps();

    this.source = salla.config.get("page.slug");
    // If the card is in the landing page, hide the add button and show the quantity
    if (this.source == "landing-page") {
      this.hideAddBtn = true;
      this.showQuantity = window.showQuantity;
    }

    salla.lang.onLoaded(() => {
      // Language
      this.remained = salla.lang.get('pages.products.remained');
      this.donationAmount = salla.lang.get('pages.products.donation_amount');
      this.startingPrice = salla.lang.get('pages.products.starting_price');
      this.addToCart = salla.lang.get('pages.cart.add_to_cart');
      this.outOfStock = salla.lang.get('pages.products.out_of_stock');

      // Re-render to update translations
      this.render();
    });
    
    this.render();
  }

  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector('.s-product-card-content-pie-svg-bar'),
      strokeDashOffsetValue = 100 - roundPercent;
    bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  } 

  getProductBadge() {
    if (this.product.promotion_title) {
      return `<div class="absolute z-10 top-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-md animate-pulse">${this.product.promotion_title}</div>`;
    }
    if (this.showQuantity && this.product?.quantity) {
      return `<div class="s-product-card-quantity">${this.remained} ${salla.helpers.number(this.product?.quantity)}</div>`;
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="s-product-card-out-badge">${this.outOfStock}</div>`;
    }
    return '';
  }

  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get('store.settings.product.show_price_as_dash') ? '-' : '';
    }
    return salla.money(price);
  }

  getProductPrice() {
    let price = '';
    if (this.product.is_on_sale) {
      price = `<div class="flex justify-center items-center gap-2 mb-4 px-6">
                <span class="text-primary text-base font-bold">${this.getPriceFormat(this.product.sale_price)}</span>
                <span class="text-gray-400 text-sm line-through">${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    } else if (this.product.starting_price) {
      price = `<div class="s-product-card-starting-price px-6">
                  <p>${this.startingPrice}</p>
                  <h4>${this.getPriceFormat(this.product?.starting_price)}</h4>
                </div>`;
    } else {
      price = `<span class="text-primary text-base font-bold">${this.getPriceFormat(this.product?.price)}</span>`;
    }
    return price;
  }

  getAddButtonLabel() {
    if (this.product.status === 'sale' && this.product.type === 'booking') {
      return salla.lang.get('pages.cart.book_now'); 
    }
    if (this.product.status === 'sale') {
      return salla.lang.get('pages.cart.add_to_cart');
    }
    if (this.product.type !== 'donating') {
      return salla.lang.get('pages.products.out_of_stock');
    }
    // donating
    return salla.lang.get('pages.products.donation_exceed');
  }

  getProps() {
    this.horizontal = this.hasAttribute('horizontal');
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
    this.hideAddBtn = this.hasAttribute('hideAddBtn');
    this.fullImage = this.hasAttribute('fullImage');
    this.minimal = this.hasAttribute('minimal');
    this.isSpecial = this.hasAttribute('isSpecial');
    this.showQuantity = this.hasAttribute('showQuantity');
  }

  render() {
    // Basic loading state
    if (!this.product) {
      this.innerHTML = `<div class="loader">Loading...</div>`;
      return;
    }

    this.classList.add('product-card',   'max-w-[260px]','py-6',  'w-full', 'rounded-lg', 'bg-[#2C345E]', 'pb-2',"rounded" ,'relative', 'shadow-lg', 'hover:shadow-xl', 'transition-transform', 'duration-300', 'ease-in-out', 'transform', 'hover:-translate-y-1');
    this.setAttribute('id', this.product.id);
    this.isInWishlist = !salla.config.isGuest() && salla.storage.get('salla::wishlist', []).includes(this.product.id);
    
    this.innerHTML = `
      <a href="${this.product?.url}" class="block group bg-[#2C345E]" aria-label="${this.product?.name}">
        ${this.getProductBadge()}
        <div class="relative overflow-hidden rounded-md">
          <img class="w-full h-[260px] object-cover mb-3 transition-transform duration-300 transform  lazy"
               src="${this.placeholder}"
               alt="${this.product?.image?.alt || 'Product Image'}"
               data-src="${this.product?.image?.url || this.product?.thumbnail}" />
        </div>
        <div class="min-h-[3.2rem] px-2">
          <p class="text-white text-sm md:text-base text-center leading-tight mb-2 line-clamp-2">${this.product?.name}</p>
        </div>
        ${this.product?.subtitle ? `<div class="text-center text-gray-400 text-sm mb-2">${this.product?.subtitle}</div>` : ''}
        ${this.getProductPrice()}
      </a>
      <div class="flex mb-4 justify-between items-center px-2 z-10 bg-[#2C345E] rounded-b-md p-2">
        <salla-add-product-button product-id="${this.product.id}">
          <div class="flex items-center gap-2 text-white hover:text-teal-300 flex-1">
            <span>${this.product.add_to_cart_label || this.getAddButtonLabel()}</span>
            <svg class="w-4 h-4 transition-transform duration-300 transform hover:rotate-12 hover:scale-110" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h15l-1.5 9h-13L3 3H1"></path>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
            </svg>
          </div>
        </salla-add-product-button>
        <salla-button shape="icon" name="product-name-${this.product.id}" fill="outline" aria-label="Add or remove to wishlist" color="light" class="s-product-card-wishlist-btn hover:text-teal-300" onclick="salla.wishlist.toggle(${this.product.id})" data-id="${this.product.id}" size="medium" width="normal" type="button">
          <button shape="icon" class="like" data-id="${this.product.id}" type="button">
            <i class="sicon-heart" style="font-size: 1.5rem;"></i>
          </button>
        </salla-button>
      </div>
    `;

    this.attachEventListeners();
    document.lazyLoadInstance?.update(this.querySelectorAll('.lazy'));

    if (this.product?.quantity && this.isSpecial) {
      this.initCircleBar();
    }
  }
}

customElements.define('custom-salla-product-card', ProductCard);
