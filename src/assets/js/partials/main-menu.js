class NavigationMenu extends HTMLElement {
    connectedCallback() {
        salla.onReady()
            .then(() => salla.lang.onLoaded())
            .then(() => {
                this.menus = [];
                this.displayAllText = salla.lang.get('blocks.home.display_all');

                return salla.api.component.getMenus()
                    .then(({ data }) => {
                        this.menus = data;
                        this.render();
                        this.addToggleEvents();
                    }).catch((error) => salla.logger.error('salla-menu::Error fetching menus', error));
            });
    }

    addToggleEvents() {
        const menuItems = this.querySelectorAll('.root-level');

        menuItems.forEach(item => {
            const link = item.querySelector('a');
            const subMenu = item.querySelector('.sub-menu');
            
            // Check if the menu item has children
            if (subMenu) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMenu(item);
                });
                
                // Close menu when clicking outside
                document.addEventListener('click', (e) => {
                    if (!item.contains(e.target)) {
                        item.classList.remove('open');
                    }
                });
            }
        });

        const mobileMenuButton = this.querySelector('.close-mobile-menu');
        mobileMenuButton.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
    }

    toggleMenu(item) {
        const allItems = this.querySelectorAll('.root-level');

        allItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('open');
            }
        });

        item.classList.toggle('open');
    }

    toggleMobileMenu() {
        const mobileMenu = this.querySelector('#mobile-menu');
        mobileMenu.classList.toggle('open');
    }

    hasChildren(menu) {
        return menu?.children?.length > 0;
    }

    hasProducts(menu) {
        return menu?.products?.length > 0;
    }

    getDesktopClasses(menu, isRootMenu) {
        return `${isRootMenu ? 'root-level' : 'relative'} ${menu.products ? 'mega-menu' : ''} ${this.hasChildren(menu) ? 'has-children' : ''}`;
    }

    getMobileMenu(menu, displayAllText) {
        const menuImage = menu.image ? `<img src="${menu.image}" class="rounded-full" width="48" height="48" alt="${menu.title}" />` : '';

        return `
        <li class="lg:hidden text-sm font-bold" ${menu.attrs}>
            ${!this.hasChildren(menu) ? `
                <a href="${menu.url}" aria-label="${menu.title || 'category'}" class="text-gray-500 ${menu.image ? '!py-3' : ''}" ${menu.link_attrs}>
                    ${menuImage}
                    <span>${menu.title || ''}</span>
                </a>` : `
                <span class="${menu.image ? '!py-3' : ''}">
                    ${menuImage}
                    ${menu.title}
                </span>
                <ul>
                    <li class="text-sm font-bold">
                        <a href="${menu.url}" class="text-gray-500">${displayAllText}</a>
                    </li>
                    ${menu.children.map((subMenu) => this.getMobileMenu(subMenu, displayAllText)).join('')}
                </ul>`}
        </li>`;
    }

    getDesktopMenu(menu, isRootMenu) {
        return `
        <li class="${this.getDesktopClasses(menu, isRootMenu)}" ${menu.attrs}>
            <a href="${menu.url}" aria-label="${menu.title || 'category'}" ${menu.link_attrs}>
                <span>${menu.title}</span>
                ${this.hasChildren(menu) ? '<span class="menu-arrow">▼</span>' : ''}
            </a>
            ${this.hasChildren(menu) ? `
                <div class="sub-menu ${this.hasProducts(menu) ? 'w-full left-0 flex' : 'w-56'}">
                    <ul class="${this.hasProducts(menu) ? 'w-56 shrink-0 m-8 rtl:ml-0 ltr:mr-0' : ''}">
                        ${menu.children.map((subMenu) => this.getDesktopMenu(subMenu, false)).join('\n')}
                    </ul>
                    ${this.hasProducts(menu) ? `
                    <salla-products-list source="selected" shadow-on-hover source-value="[${menu.products}]" />` : ''}
                </div>` : ''}
        </li>`;
    }

    getMenus() {
        return this.menus.map((menu) => `
            ${this.getMobileMenu(menu, this.displayAllText)}
            ${this.getDesktopMenu(menu, true)}
        `).join('\n');
    }

    render() {
        this.innerHTML = `
        <nav id="mobile-menu" class="mobile-menu">
            <ul class="main-menu">${this.getMenus()}</ul>
            <button class="btn--close close-mobile-menu sicon-cancel lg:hidden"></button>
        </nav>
        <button class="btn--close-sm close-mobile-menu sicon-cancel hidden"></button>`;
    }
}

customElements.define('custom-main-menu', NavigationMenu);
