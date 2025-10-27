
export interface Location {
    lat: number;
    lng: number;
}

export interface Comment {
    _id: string;
    authorId: string;
    text: string;
    timestamp: string;
}

export interface Review {
    _id: string;
    authorId: string;
    listingId: string;
    transactionId: string;
    rating: number; // 1-5 stars
    text: string;
    timestamp: string;
}

export interface Address {
    state: string;
    district: string;
    municipality: string;
    ward: string;
}

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    photo: string;
    isVerified: boolean;
    kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
    walletBalance: number;
    location: Location;
    savedItems?: string[];
    dob?: string;
    occupation?: 'Student' | 'Employed' | 'Business Owner' | 'Unemployed' | 'Other' | '';
    reviews?: Review[];
    address?: Address;
    joinedAt?: string;
}

export type ListingCondition = 'new' | 'like-new' | 'used' | 'for-parts';

export interface Listing {
    _id: string;
    title: string;
    description: string;
    price: number;
    priceType: 'fixed' | 'negotiable';
    category: 'Electronics' | 'Furniture' | 'Vehicles' | 'Clothing' | 'Other';
    images: string[];
    sellerId: string;
    status: 'available' | 'sold' | 'pending';
    location: Location;
    createdAt: string;
    condition?: ListingCondition;
    comments?: Comment[];
    distance?: number;
}

export interface Message {
    _id: string;
    chatId: string;
    senderId: string;
    receiverId: string;
    message: string;
    timestamp: string;
    status?: 'sent' | 'delivered' | 'read';
    attachments?: { type: 'image'; url: string }[];
}

export interface Transaction {
    _id: string;
    buyerId: string;
    sellerId: string;
    itemId: string;
    amount: number;
    status: 'escrow_held' | 'released' | 'refunded' | 'cancelled';
    createdAt: string;
}

export interface Offer {
  _id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'message' | 'transaction' | 'system' | 'offer';
}