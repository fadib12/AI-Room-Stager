
export interface GeneratedImage {
    id: string;
    base64: string;
}

// FIX: Added FurnitureItem and Product types to be used for the "Shop the Look" feature.
export interface FurnitureItem {
    id: string;
    name: string;
    description: string;
}

export interface Product {
    name: string;
    shop: string;
    price: string;
    url: string;
}
