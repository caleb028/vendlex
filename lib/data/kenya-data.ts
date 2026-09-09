export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  county: string;
  town: string;
  physicalLocation: string;
  phone: string;
  email: string;
  whatsapp: string;
  website?: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  isOpenNow: boolean;
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  productCount: number;
  followerCount: number;
  joinedDate: string;
  badges: string[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  inStock: boolean;
  stockCount: number;
  lowStockThreshold: number;
  images: string[];
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessVerified: boolean;
  county: string;
  town: string;
  rating: number;
  reviewCount: number;
  isDeal?: boolean;
  dealEndsAt?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  deliveryInfo: string;
  specifications: Record<string, string>;
  tags: string[];
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  startingPrice: number;
  pricingType: "fixed" | "hourly" | "custom_quote";
  providerId: string;
  providerName: string;
  providerSlug: string;
  providerVerified: boolean;
  rating: number;
  reviewCount: number;
  county: string;
  town: string;
  image: string;
  duration: string;
  features: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  businessName: string;
  county: string;
  avatar: string;
  content: string;
  rating: number;
  growthMetric: string;
}

export const KENYAN_COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
];

export const KENYAN_TOWNS: Record<string, string[]> = {
  Nairobi: ["CBD", "Westlands", "Kilimani", "Eastleigh", "Karen", "Upperhill", "Industrial Area", "Ngong Road", "Kasarani", "South C", "Embakasi", "Roysambu"],
  Mombasa: ["Nyali", "CBD", "Mtwapa", "Bamburi", "Likoni", "Diani", "Changamwe", "Kisauni"],
  Kisumu: ["Milimani", "CBD", "Kondele", "Mega City Area", "Kisian", "Nyamasaria"],
  Nakuru: ["CBD", "Section 58", "Milimani", "Njoro", "Freehold", "Lanet", "Kiamunyi"],
  Kiambu: ["Thika", "Ruiru", "Kikuyu", "Kiambu Town", "Juja", "Limuru", "Githunguri", "Kabete"],
  "Uasin Gishu": ["Eldoret CBD", "Elgon View", "Pioneer", "Kapsoya", "Huruma", "Maili Nne", "Turbo"],
  Machakos: ["Machakos Town", "Syokimau", "Athi River", "Mlolongo", "Tala", "Kangundo"],
  Kajiado: ["Kitengela", "Ongata Rongai", "Ngong", "Kajiado Town", "Loitokitok", "Kiserian"],
  Kilifi: ["Malindi", "Kilifi Town", "Watamu", "Mtwapa", "Mariakani"],
  Nyeri: ["Nyeri CBD", "King'ong'o", "Skuta", "Naro Moru", "Karatina", "Othaya"],
  Meru: ["Meru CBD", "Makutano", "Nkubu", "Maua", "Timau"],
  Kakamega: ["Kakamega CBD", "Amalemba", "Milimani", "Mumias", "Lugari"],
  Kericho: ["Kericho CBD", "Litein", "Kipkelion", "Kapsoit"],
  "Trans Nzoia": ["Kitale Town", "Kiminini", "Endebess", "Saboti"],
  Embu: ["Embu Town", "Runyenjes", "Siakago", "Manyatta"],
  Garissa: ["Garissa Town", "Modogashe", "Dadaab", "Bura"],
  Laikipia: ["Nanyuki", "Nyahururu", "Rumuruti", "Doldol"],
  Kisii: ["Kisii CBD", "Suneka", "Ogembo", "Nyacheki"],
  Bomet: ["Bomet Town", "Sotik", "Longisa", "Silibwet"],
  Bungoma: ["Bungoma Town", "Webuye", "Kimilili", "Sirisia"],
  Busia: ["Busia Town", "Malaba", "Port Victoria", "Nambale"],
  "Homa Bay": ["Homa Bay Town", "Mbita", "Oyugis", "Kendu Bay"],
  Kitui: ["Kitui Town", "Mwingi", "Mutomo", "Kyuso"],
  Kwale: ["Diani", "Kwale Town", "Ukunda", "Msambweni", "Lungalunga"],
  Makueni: ["Wote", "Makindu", "Mtito Andei", "Emali", "Kibwezi"],
  Mandera: ["Mandera Town", "Elwak", "Rhamu", "Banissa"],
  Marsabit: ["Marsabit Town", "Moyale", "Laisamis", "North Horr"],
  Migori: ["Migori Town", "Rongo", "Isebania", "Kehancha", "Suna"],
  "Murang'a": ["Murang'a Town", "Kenol", "Kangema", "Maragua"],
  Nandi: ["Kapsabet", "Nandi Hills", "Mosoriot", "Kilibwoni"],
  Narok: ["Narok Town", "Kilgoris", "Ololulung'a", "Maasai Mara"],
  Nyamira: ["Nyamira Town", "Keroka", "Nyansiongo"],
  Nyandarua: ["Ol Kalou", "Engineer", "Ndaragwa", "Mairo Inya"],
  Kirinyaga: ["Kerugoya", "Kutus", "Sagana", "Mwea"],
  Samburu: ["Maralal", "Baragoi", "Wamba", "Archers Post"],
  Siaya: ["Siaya Town", "Bondo", "Ugunja", "Yala"],
  "Taita-Taveta": ["Voi", "Taveta", "Wundanyi", "Mwatate"],
  "Tana River": ["Hola", "Garsen", "Madogo", "Bura"],
  "Tharaka-Nithi": ["Chuka", "Marimanti", "Kathwana", "Chogoria"],
  Turkana: ["Lodwar", "Kakuma", "Lokichoggio", "Lokichar"],
  Vihiga: ["Mbale", "Chavakali", "Luanda", "Hamisi"],
  Wajir: ["Wajir Town", "Habaswein", "Tarbaj", "Griftu"],
  "West Pokot": ["Kapenguria", "Makutano", "Ortum", "Alale"],
  Baringo: ["Kabarnet", "Eldama Ravine", "Marigat", "Mogotio"],
  "Elgeyo-Marakwet": ["Iten", "Kapsowar", "Chepkorio", "Tot"],
  Isiolo: ["Isiolo Town", "Garbatulla", "Merti"],
  Lamu: ["Lamu Island", "Mpeketoni", "Shela", "Faza"],
};

export const CATEGORIES = [
  {
    id: "phones-accessories",
    name: "Phones & Accessories",
    icon: "Smartphone",
    productCount: 1420,
    businessCount: 88,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Samsung Galaxy", "iPhone 15", "Screen Protectors", "Fast Chargers"]
  },
  {
    id: "computers-accessories",
    name: "Computers & Tech",
    icon: "Laptop",
    productCount: 890,
    businessCount: 64,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop",
    popularItems: ["HP Laptops", "MacBook Pro", "Keyboards", "Monitors"]
  },
  {
    id: "fashion-clothing",
    name: "Fashion & Clothing",
    icon: "Shirt",
    productCount: 2310,
    businessCount: 145,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Kitenge / Ankara", "Official Suits", "Casual Wear", "Hoodies"]
  },
  {
    id: "shoes-footwear",
    name: "Shoes & Footwear",
    icon: "Footprints",
    productCount: 940,
    businessCount: 72,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Sneakers", "Leather Boots", "Official Loafers", "Sandals"]
  },
  {
    id: "home-kitchen",
    name: "Home & Kitchen",
    icon: "Home",
    productCount: 1680,
    businessCount: 95,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Air Fryers", "Cookware Sets", "Blenders", "Bedding"]
  },
  {
    id: "tv-audio",
    name: "TV, Audio & Video",
    icon: "Tv",
    productCount: 620,
    businessCount: 48,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Smart 4K TVs", "Soundbars", "Bluetooth Speakers", "Subwoofers"]
  },
  {
    id: "health-beauty",
    name: "Health & Beauty",
    icon: "Sparkles",
    productCount: 1850,
    businessCount: 110,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Shea Butter", "Organic Hair Oils", "Skincare Sets", "Perfumes"]
  },
  {
    id: "furniture-decor",
    name: "Furniture & Decor",
    icon: "Armchair",
    productCount: 740,
    businessCount: 52,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Mahogany Sofas", "Dining Tables", "Office Desks", "Wall Art"]
  },
  {
    id: "food-restaurants",
    name: "Food & Restaurants",
    icon: "Utensils",
    productCount: 1120,
    businessCount: 82,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Nyama Choma Platters", "Swahili Biryani", "Organic Honey", "Bakery Goods"]
  },
  {
    id: "property-repairs",
    name: "Repairs & Services",
    icon: "Wrench",
    productCount: 430,
    businessCount: 94,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Plumbing", "Electrical", "Phone Repair", "Carpentry"]
  },
  {
    id: "logistics-delivery",
    name: "Logistics & Courier",
    icon: "Truck",
    productCount: 210,
    businessCount: 36,
    image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Nairobi Same-Day", "Parcel Delivery", "Moving Services", "Cargo"]
  },
  {
    id: "creative-professional",
    name: "Professional & Creative",
    icon: "Briefcase",
    productCount: 350,
    businessCount: 58,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    popularItems: ["Photography", "Web Design", "Accounting & Tax", "Legal Advice"]
  }
];

export const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1800&auto=format&fit=crop",
    title: "Kenya's Premier Commerce & Growth Platform",
    subtitle: "Connecting 10,000+ local enterprises with high-visibility digital storefronts & unified commerce tools.",
    badge: "SHOP • GROW • PROSPER",
    tag: "Multi-vendor Marketplace"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1800&auto=format&fit=crop",
    title: "Discover Verified Kenyan Entrepreneurs",
    subtitle: "From Mombasa coastal artisans to Eldoret agribusinesses — shop directly with verified local businesses.",
    badge: "✓ 100% VERIFIED LOCAL SELLERS",
    tag: "Authentic Kenyan Products"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1800&auto=format&fit=crop",
    title: "Modern Retail Storefronts Built for Growth",
    subtitle: "Sellers manage orders, inventory, automated invoicing & M-Pesa payments in one unified SaaS portal.",
    badge: "💼 ENTERPRISE TOOLS FOR SMES",
    tag: "Business Management Suite"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1800&auto=format&fit=crop",
    title: "Instant M-Pesa STK Push & Escrow Protection",
    subtitle: "Frictionless checkout designed specifically for Kenyan shoppers with instant order confirmation.",
    badge: "🔒 ESCROW-PROTECTED COMMERCE",
    tag: "M-Pesa Ready Architecture"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1800&auto=format&fit=crop",
    title: "VendLex AI: Your Digital Growth Assistant",
    subtitle: "Generate high-converting social media ads, product copy & customer responses in English and Swahili.",
    badge: "🤖 POWERED BY NEXT-GEN AI",
    tag: "AI Business Assistant"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1800&auto=format&fit=crop",
    title: "Connecting Local Services with Instant Quotes",
    subtitle: "Book trusted plumbers, electricians, photographers, mechanics & caterers across all 47 counties.",
    badge: "⚡ FAST DISPATCH & APPOINTMENTS",
    tag: "Services Marketplace"
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1800&auto=format&fit=crop",
    title: "Vibrant Boutiques & African Fashion Houses",
    subtitle: "Explore handcrafted Kitenge apparel, Maasai jewelry, and contemporary African couture.",
    badge: "✨ AFRICAN COUTURE & FASHION",
    tag: "Local Designers & Craft"
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1800&auto=format&fit=crop",
    title: "Clean Solar PV Systems & Renewable Power",
    subtitle: "Off-grid solar panels, hybrid inverters, and lithium battery storage for homes and farms.",
    badge: "☀️ CLEAN ENERGY NETWORK",
    tag: "Solar PV Engineering"
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1800&auto=format&fit=crop",
    title: "Electronics, Smart Devices & Tech Gadgets",
    subtitle: "Source top-tier smartphones, laptops, audio systems, and gaming rigs with KEBS warranty.",
    badge: "📱 100% GENUINE TECH",
    tag: "Verified Tech Retailers"
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1800&auto=format&fit=crop",
    title: "Handcrafted Mahogany & Bespoke Furniture",
    subtitle: "Furnish your home and office with handcrafted solid wood furniture and modern decor.",
    badge: "🛋️ HOME & OFFICE INTERIORS",
    tag: "Kenyan Woodwork & Artisans"
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1800&auto=format&fit=crop",
    title: "Nationwide Logistics & 24hr Courier Dispatch",
    subtitle: "Integrated with Fargo Courier, G4S, Wells Fargo, and local city delivery riders.",
    badge: "🚚 ALL 47 COUNTIES COVERAGE",
    tag: "Nationwide Delivery Network"
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=1800&auto=format&fit=crop",
    title: "Fresh Agricultural Produce & Agribusiness",
    subtitle: "Direct-from-farm avocados, organic tea, macadamia, and irrigation supplies.",
    badge: "🌱 DIRECT FARM TO CONSUMER",
    tag: "Kenyan Agribusiness"
  }
];

export const MOCK_BUSINESSES: Business[] = [
  {
    id: "biz-1",
    slug: "nairobi-tech-hub",
    name: "Nairobi Tech Hub",
    tagline: "Your Premier Source for Genuine Gadgets & Laptops",
    description: "Nairobi Tech Hub is a trusted retailer of high-performance laptops, smartphones, gaming rigs, and genuine accessories based in the heart of Nairobi CBD.",
    category: "Computers & Tech",
    county: "Nairobi",
    town: "CBD",
    physicalLocation: "Bazaar Plaza, 4th Floor, Suite 412, Moi Avenue",
    phone: "+254 712 345 678",
    email: "info@nairobihub.co.ke",
    whatsapp: "+254 712 345 678",
    website: "https://nairobihub.co.ke",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 248,
    isVerified: true,
    isFeatured: true,
    isOpenNow: true,
    openingHours: {
      weekdays: "8:00 AM - 7:00 PM",
      saturday: "8:30 AM - 6:00 PM",
      sunday: "Closed"
    },
    productCount: 46,
    followerCount: 3820,
    joinedDate: "2024-01-15",
    badges: ["✓ Verified Seller", "⭐ Top Rated", "⚡ Same Day Dispatch"]
  },
  {
    id: "biz-2",
    slug: "savanna-fashion-house",
    name: "Savanna Fashion House",
    tagline: "Authentic African Prints, Modern Haute Couture & Custom Fit",
    description: "Savanna Fashion House creates bespoke African attire, modern Kitenge dresses, tailored suits, and authentic handcrafted beaded fashion accessories for men and women.",
    category: "Fashion & Clothing",
    county: "Nairobi",
    town: "Kilimani",
    physicalLocation: "Yaya Court, Suite 12, Argwings Kodhek Road",
    phone: "+254 722 890 123",
    email: "sales@savannafashion.ke",
    whatsapp: "+254 722 890 123",
    logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    rating: 4.8,
    reviewCount: 189,
    isVerified: true,
    isFeatured: true,
    isOpenNow: true,
    openingHours: {
      weekdays: "9:00 AM - 6:30 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "12:00 PM - 4:00 PM"
    },
    productCount: 68,
    followerCount: 5120,
    joinedDate: "2024-03-10",
    badges: ["✓ Verified Seller", "🏆 Handcrafted Kenya", "🌿 Sustainable"]
  },
  {
    id: "biz-3",
    slug: "mtaa-electronics",
    name: "Mtaa Electronics",
    tagline: "Affordable Home Appliances, Audio Systems & Smart Screens",
    description: "Specializing in energy-saving kitchen appliances, smart 4K TVs, home theater audio systems, and backup power solutions with countrywide warranty.",
    category: "TV, Audio & Video",
    county: "Kiambu",
    town: "Thika",
    physicalLocation: "Ananas Mall Ground Floor, Commercial Street, Thika",
    phone: "+254 733 456 789",
    email: "support@mtaaelectronics.ke",
    whatsapp: "+254 733 456 789",
    logo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=200&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1200&auto=format&fit=crop",
    rating: 4.7,
    reviewCount: 132,
    isVerified: true,
    isFeatured: true,
    isOpenNow: true,
    openingHours: {
      weekdays: "8:30 AM - 8:00 PM",
      saturday: "9:00 AM - 8:00 PM",
      sunday: "10:00 AM - 6:00 PM"
    },
    productCount: 32,
    followerCount: 2190,
    joinedDate: "2024-02-20",
    badges: ["✓ Verified Seller", "🛡️ 2-Year Warranty"]
  },
  {
    id: "biz-4",
    slug: "afribeauty-organics",
    name: "AfriBeauty Organics",
    tagline: "Pure Cold-Pressed Kenyan Botanical Hair & Skincare",
    description: "100% pure organic Shea butter, cold-pressed Avocado and Macadamia oils, Moringa soaps, and natural hair treatments formulated for melanin-rich skin and afro-textured hair.",
    category: "Health & Beauty",
    county: "Mombasa",
    town: "Nyali",
    physicalLocation: "City Mall Nyali, 1st Floor Shop 24",
    phone: "+254 701 234 567",
    email: "hello@afribeauty.co.ke",
    whatsapp: "+254 701 234 567",
    logo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=200&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1608248597359-4679720d4f6a?q=80&w=1200&auto=format&fit=crop",
    rating: 4.95,
    reviewCount: 310,
    isVerified: true,
    isFeatured: true,
    isOpenNow: true,
    openingHours: {
      weekdays: "9:00 AM - 7:00 PM",
      saturday: "9:00 AM - 7:00 PM",
      sunday: "11:00 AM - 5:00 PM"
    },
    productCount: 42,
    followerCount: 6840,
    joinedDate: "2023-11-05",
    badges: ["✓ Verified Seller", "⭐ Customer Favorite", "🌱 100% Organic KEBS Certified"]
  },
  {
    id: "biz-5",
    slug: "kenya-home-styles",
    name: "Kenya Home Styles",
    tagline: "Solid Mahogany Furniture & Custom Living Room Sets",
    description: "Crafted by master Kenyan carpenters using sustainable hardwood. We build durable dining tables, sectional sofas, orthopedic bed frames, and ergonomic home office desks.",
    category: "Furniture & Decor",
    county: "Nakuru",
    town: "CBD",
    physicalLocation: "Section 58, Along Nairobi-Nakuru Highway",
    phone: "+254 798 112 233",
    email: "nakuru@kenyahomestyles.ke",
    whatsapp: "+254 798 112 233",
    logo: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=200&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop",
    rating: 4.85,
    reviewCount: 96,
    isVerified: true,
    isFeatured: false,
    isOpenNow: true,
    openingHours: {
      weekdays: "8:00 AM - 6:00 PM",
      saturday: "8:30 AM - 5:00 PM",
      sunday: "Closed"
    },
    productCount: 28,
    followerCount: 1750,
    joinedDate: "2024-04-01",
    badges: ["✓ Verified Seller", "🪵 Hardwood Guarantee"]
  },
  {
    id: "biz-6",
    slug: "urban-bites-kenya",
    name: "Urban Bites Kenya",
    tagline: "Authentic Coastal Delicacies, Biryani & Gourmet Catering",
    description: "Serving authentic Swahili pilau, chicken biryani, mahamri, samosas, and catering for corporate workshops and private events across Nairobi and Kiambu.",
    category: "Food & Restaurants",
    county: "Nairobi",
    town: "Westlands",
    physicalLocation: "Mpaka Road, The Pavilion Ground Floor",
    phone: "+254 745 678 901",
    email: "orders@urbanbites.co.ke",
    whatsapp: "+254 745 678 901",
    logo: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=200&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 420,
    isVerified: true,
    isFeatured: true,
    isOpenNow: true,
    openingHours: {
      weekdays: "7:30 AM - 9:30 PM",
      saturday: "8:00 AM - 10:00 PM",
      sunday: "9:00 AM - 8:00 PM"
    },
    productCount: 22,
    followerCount: 4390,
    joinedDate: "2023-09-15",
    badges: ["✓ Verified Kitchen", "🔥 Fast Food Prep"]
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "samsung-galaxy-s24-ultra-512gb",
    title: "Samsung Galaxy S24 Ultra (512GB / 12GB RAM) Titanium Black - Dual SIM",
    sku: "SAM-S24U-512-TB",
    description: "Brand new Samsung Galaxy S24 Ultra with Galaxy AI built-in, Titanium frame, 200MP camera system, Snapdragon 8 Gen 3 processor, and integrated S-Pen stylus. Includes 24 months official Samsung East Africa warranty.",
    category: "Phones & Accessories",
    price: 154999,
    originalPrice: 179999,
    discountPercentage: 14,
    inStock: true,
    stockCount: 8,
    lowStockThreshold: 3,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-1",
    businessName: "Nairobi Tech Hub",
    businessSlug: "nairobi-tech-hub",
    businessVerified: true,
    county: "Nairobi",
    town: "CBD",
    rating: 4.9,
    reviewCount: 38,
    isFeatured: true,
    isTrending: true,
    isDeal: true,
    dealEndsAt: "2026-09-03T23:59:59Z",
    deliveryInfo: "Same-day delivery in Nairobi (KSh 250), 24-hour countrywide courier via Fargo/G4S (KSh 500).",
    specifications: {
      "Display": "6.8 inch Dynamic AMOLED 2X 120Hz",
      "Processor": "Qualcomm Snapdragon 8 Gen 3",
      "Camera": "200MP + 50MP + 12MP + 10MP",
      "Battery": "5000 mAh with 45W Fast Charging",
      "Warranty": "24 Months Official Samsung EA"
    },
    tags: ["smartphone", "samsung", "5g", "flagship"]
  },
  {
    id: "prod-2",
    slug: "apple-macbook-pro-14-m3-pro",
    title: "Apple MacBook Pro 14-inch (M3 Pro Chip, 18GB Unified Memory, 512GB SSD) Space Black",
    sku: "APL-MBP14-M3P-SB",
    description: "Liquid Retina XDR display with ProMotion 120Hz, up to 18 hours battery life, 11-core CPU and 14-core GPU. The ultimate workhorse for Kenyan developers, designers, and video editors.",
    category: "Computers & Tech",
    price: 279999,
    originalPrice: 310000,
    discountPercentage: 10,
    inStock: true,
    stockCount: 5,
    lowStockThreshold: 2,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-1",
    businessName: "Nairobi Tech Hub",
    businessSlug: "nairobi-tech-hub",
    businessVerified: true,
    county: "Nairobi",
    town: "CBD",
    rating: 5.0,
    reviewCount: 19,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Free insured delivery within Nairobi. Countrywide dispatch with real-time tracking.",
    specifications: {
      "Chip": "Apple M3 Pro (11-Core CPU, 14-Core GPU)",
      "Memory": "18GB Unified RAM",
      "Storage": "512GB Superfast NVMe SSD",
      "Display": "14.2-inch Liquid Retina XDR",
      "Battery": "Up to 18 Hours"
    },
    tags: ["apple", "macbook", "laptop", "developer"]
  },
  {
    id: "prod-3",
    slug: "modern-kitenge-peplum-dress",
    title: "Handmade Savannah Kitenge Peplum Dress & Matching Headwrap - Custom Tailored",
    sku: "SAV-KTP-001",
    description: "Authentic wax print Kitenge fabric with tailored peplum waist, lined interior, and matching handcrafted headwrap. Breathable 100% premium cotton suitable for official ceremonies, weddings, and executive wear.",
    category: "Fashion & Clothing",
    price: 4850,
    originalPrice: 6500,
    discountPercentage: 25,
    inStock: true,
    stockCount: 15,
    lowStockThreshold: 4,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-2",
    businessName: "Savanna Fashion House",
    businessSlug: "savanna-fashion-house",
    businessVerified: true,
    county: "Nairobi",
    town: "Kilimani",
    rating: 4.9,
    reviewCount: 64,
    isFeatured: true,
    isTrending: true,
    isDeal: true,
    dealEndsAt: "2026-09-02T18:00:00Z",
    deliveryInfo: "Delivery within Nairobi in 2-4 hours. Upcountry delivery via Wells Fargo within 24 hours.",
    specifications: {
      "Material": "100% Cotton African Wax Print",
      "Available Sizes": "S, M, L, XL, XXL & Custom Measurement",
      "Care": "Cold machine wash or hand wash with mild detergent",
      "Origin": "Handmade in Kenya"
    },
    tags: ["fashion", "kitenge", "african", "dress"]
  },
  {
    id: "prod-4",
    slug: "sony-bravia-55-inch-4k-google-tv",
    title: "Sony Bravia 55-inch 4K HDR Smart Google TV (X77L Series) with Dolby Audio",
    sku: "SNY-55X77L-4K",
    description: "Experience 4K X-Reality PRO image upscaling, Live Color technology, built-in Google Assistant, Chromecast built-in, and immersive X-Balanced speakers.",
    category: "TV, Audio & Video",
    price: 68999,
    originalPrice: 84999,
    discountPercentage: 19,
    inStock: true,
    stockCount: 6,
    lowStockThreshold: 2,
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-3",
    businessName: "Mtaa Electronics",
    businessSlug: "mtaa-electronics",
    businessVerified: true,
    county: "Kiambu",
    town: "Thika",
    rating: 4.8,
    reviewCount: 42,
    isFeatured: false,
    isDeal: true,
    dealEndsAt: "2026-09-04T12:00:00Z",
    deliveryInfo: "Safe wooden crate delivery across Kenya. Free wall mounting bracket included.",
    specifications: {
      "Screen Size": "55 Inch 4K Ultra HD (3840 x 2160)",
      "OS": "Google TV with Play Store",
      "Connectivity": "3x HDMI, 2x USB, Wi-Fi, Bluetooth 5.0",
      "Audio": "20W Dolby Atmos X-Balanced"
    },
    tags: ["tv", "sony", "4k", "smart tv"]
  },
  {
    id: "prod-5",
    slug: "pure-shea-butter-hair-scalp-elixir",
    title: "AfriBeauty Raw Nilotica Shea Butter & Rosemary Scalp Elixir Bundle (500ml + 100ml)",
    sku: "AFB-SB-ELX-BDL",
    description: "East African raw unrefined Nilotica Shea Butter paired with stimulating organic Rosemary and Tea Tree scalp oil. Clinically tested to promote thick edge regrowth, stop dandruff, and seal moisture in natural hair.",
    category: "Health & Beauty",
    price: 2450,
    originalPrice: 3200,
    discountPercentage: 23,
    inStock: true,
    stockCount: 35,
    lowStockThreshold: 10,
    images: [
      "https://images.unsplash.com/photo-1608248597359-4679720d4f6a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-4",
    businessName: "AfriBeauty Organics",
    businessSlug: "afribeauty-organics",
    businessVerified: true,
    county: "Mombasa",
    town: "Nyali",
    rating: 4.96,
    reviewCount: 145,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Dispatched from Mombasa hub. Nairobi & Coast next-day delivery (KSh 200).",
    specifications: {
      "Volume": "500ml Shea Cream + 100ml Dropper Oil",
      "Ingredients": "Raw Nilotica Shea, Organic Rosemary, Castor Oil, Vitamin E",
      "Certification": "KEBS Standard Approved"
    },
    tags: ["beauty", "organic", "haircare", "sheabutter"]
  },
  {
    id: "prod-6",
    slug: "solid-mahogany-6-seater-dining-set",
    title: "Handcrafted 6-Seater Solid Mahogany Dining Table Set with Cushioned Chairs",
    sku: "KHS-DT6-MAH",
    description: "Built from seasoned Kenyan mahogany with rich walnut stain and weather-resistant lacquer. Comes with 6 high-density foam upholstered chairs in stain-resistant charcoal velvet.",
    category: "Furniture & Decor",
    price: 78500,
    originalPrice: 95000,
    discountPercentage: 17,
    inStock: true,
    stockCount: 3,
    lowStockThreshold: 1,
    images: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-5",
    businessName: "Kenya Home Styles",
    businessSlug: "kenya-home-styles",
    businessVerified: true,
    county: "Nakuru",
    town: "CBD",
    rating: 4.9,
    reviewCount: 22,
    isFeatured: false,
    deliveryInfo: "Dedicated flatbed transport with in-room assembly across Nakuru, Nairobi, Kiambu, and Eldoret.",
    specifications: {
      "Wood Type": "100% Solid Seasoned Mahogany",
      "Table Dimensions": "180cm (L) x 90cm (W) x 76cm (H)",
      "Warranty": "5-Year Structural Frame Warranty"
    },
    tags: ["furniture", "dining", "mahogany", "home"]
  },
  {
    id: "prod-7",
    slug: "authentic-swahili-catering-platter-party",
    title: "Executive Swahili Feast Platter (Serves 8-10): Biryani, Pilau, Samosas & Mahamri",
    sku: "UBK-PLT-SWF-10",
    description: "Freshly prepared feast platter containing aromatic coastal goat pilau, chicken biryani, 10 beef samosas, spicy kachumbari, coconut mahamri, and house tamarind dip. Prepared hot upon order confirmation.",
    category: "Food & Restaurants",
    price: 7900,
    originalPrice: 9200,
    discountPercentage: 14,
    inStock: true,
    stockCount: 20,
    lowStockThreshold: 5,
    images: [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-6",
    businessName: "Urban Bites Kenya",
    businessSlug: "urban-bites-kenya",
    businessVerified: true,
    county: "Nairobi",
    town: "Westlands",
    rating: 5.0,
    reviewCount: 94,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Hot thermal box dispatch within Nairobi (delivered in 45-60 minutes).",
    specifications: {
      "Servings": "8 - 10 Persons",
      "Includes": "Goat Pilau, Chicken Biryani, Samosas, Mahamri, Kachumbari, Sauce",
      "Notice Time": "Order at least 2 hours in advance"
    },
    tags: ["food", "catering", "swahili", "biryani"]
  },
  {
    id: "prod-8",
    slug: "air-fryer-digital-xl-8l",
    title: "NutriCook 8.5L Dual-Basket Digital Air Fryer with Smart Sync Finish",
    sku: "NCK-AF85-DB",
    description: "Cook two dishes at two different temperatures simultaneously and finish at the same time. 8 preset cooking programs, non-stick dishwasher-safe crisper plates, and 85% less oil usage.",
    category: "Home & Kitchen",
    price: 16499,
    originalPrice: 21000,
    discountPercentage: 21,
    inStock: true,
    stockCount: 12,
    lowStockThreshold: 3,
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-3",
    businessName: "Mtaa Electronics",
    businessSlug: "mtaa-electronics",
    businessVerified: true,
    county: "Kiambu",
    town: "Thika",
    rating: 4.85,
    reviewCount: 57,
    isFeatured: false,
    isDeal: true,
    dealEndsAt: "2026-09-05T20:00:00Z",
    deliveryInfo: "Same-day Nairobi/Thika dispatch, 24-hr courier countrywide.",
    specifications: {
      "Capacity": "8.5 Liters (Dual 4.25L Baskets)",
      "Power": "2400W High Efficiency",
      "Warranty": "1-Year Full Replacement Warranty"
    },
    tags: ["airfryer", "kitchen", "appliance"]
  },
  {
    id: "prod-9",
    slug: "apple-iphone-15-pro-max-256gb",
    title: "Apple iPhone 15 Pro Max (256GB) Natural Titanium - Dual eSIM & Nano SIM",
    sku: "APL-IP15PM-256-NT",
    description: "Features aerospace-grade titanium design, A17 Pro chip with 6-core GPU, customizable Action button, 48MP main camera with 5x Telephoto zoom, and USB-C speed connectivity. Includes 1-year official Apple East Africa warranty.",
    category: "Phones & Accessories",
    price: 185000,
    originalPrice: 210000,
    discountPercentage: 12,
    inStock: true,
    stockCount: 9,
    lowStockThreshold: 2,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-1",
    businessName: "Nairobi Tech Hub",
    businessSlug: "nairobi-tech-hub",
    businessVerified: true,
    county: "Nairobi",
    town: "CBD",
    rating: 4.95,
    reviewCount: 52,
    isFeatured: true,
    isTrending: true,
    isDeal: true,
    dealEndsAt: "2026-09-06T23:59:59Z",
    deliveryInfo: "Insured same-day dispatch in Nairobi CBD & environs. 24-hr G4S tracking nationwide.",
    specifications: {
      "Display": "6.7-inch Super Retina XDR OLED 120Hz ProMotion",
      "Chipset": "Apple A17 Pro (3nm)",
      "Camera": "48MP + 12MP Periscope 5x + 12MP Ultrawide",
      "Battery": "Up to 29 hours video playback",
      "Warranty": "12 Months Apple Official Warranty"
    },
    tags: ["iphone", "apple", "smartphone", "5g"]
  },
  {
    id: "prod-10",
    slug: "starlink-mini-portable-satellite-internet-kit",
    title: "Starlink Mini Portable Satellite Internet Kit with Integrated Wi-Fi Router",
    sku: "STL-MINI-PORT-KE",
    description: "High-speed, low-latency satellite internet designed for remote homes, safari camps, farms, and mobile professionals across Kenya. Compact fold-out dish powered via USB-C PD or 12V DC input.",
    category: "Computers & Tech",
    price: 45000,
    originalPrice: 52000,
    discountPercentage: 13,
    inStock: true,
    stockCount: 14,
    lowStockThreshold: 4,
    images: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-1",
    businessName: "Nairobi Tech Hub",
    businessSlug: "nairobi-tech-hub",
    businessVerified: true,
    county: "Nairobi",
    town: "CBD",
    rating: 4.92,
    reviewCount: 41,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Countrywide priority delivery via Wells Fargo within 24 hours.",
    specifications: {
      "Speed": "Up to 150 Mbps download",
      "Power Draw": "25-40 Watts Average",
      "Weight": "1.1 kg Dish",
      "Coverage": "100% Kenya Satellite Coverage"
    },
    tags: ["starlink", "internet", "satellite", "wifi"]
  },
  {
    id: "prod-11",
    slug: "sunking-home-500x-solar-system-tv",
    title: "SunKing Home 500X Complete Solar System with 32-inch Solar HD TV & 4 Bright Bulbs",
    sku: "SK-H500X-TV32",
    description: "Off-grid pay-as-you-go & outright solar energy system featuring a 50W solar panel, 32-inch LED HD TV, 4 bright overhead LED lamps, USB phone charger ports, and FM radio.",
    category: "Home & Kitchen",
    price: 38500,
    originalPrice: 44000,
    discountPercentage: 12,
    inStock: true,
    stockCount: 10,
    lowStockThreshold: 3,
    images: [
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-3",
    businessName: "Mtaa Electronics",
    businessSlug: "mtaa-electronics",
    businessVerified: true,
    county: "Kiambu",
    town: "Thika",
    rating: 4.88,
    reviewCount: 68,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Direct transport & installation guidance across Kiambu, Murang'a, Machakos & Nakuru.",
    specifications: {
      "TV Size": "32-inch HD LED (12V DC Direct)",
      "Solar Panel": "50 Watt Poly-crystalline Panel",
      "Battery": "LiFePO4 15.4Ah Long Life Battery",
      "Warranty": "2-Year Manufacturer Replacement Warranty"
    },
    tags: ["solar", "sunking", "tv", "offgrid"]
  },
  {
    id: "prod-12",
    slug: "maasai-beaded-leather-sandals-handmade",
    title: "Authentic Maasai Beaded Genuine Leather Sandals - Artisan Handcrafted",
    sku: "MSI-SND-BD-01",
    description: "Handcrafted in Kajiado using vegetable-tanned genuine leather and intricate glass bead embroidery. Durable recycled rubber sole designed for high comfort and long wear.",
    category: "Fashion & Clothing",
    price: 2800,
    originalPrice: 3500,
    discountPercentage: 20,
    inStock: true,
    stockCount: 25,
    lowStockThreshold: 5,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-2",
    businessName: "Savanna Fashion House",
    businessSlug: "savanna-fashion-house",
    businessVerified: true,
    county: "Nairobi",
    town: "Kilimani",
    rating: 4.91,
    reviewCount: 37,
    isFeatured: false,
    isTrending: true,
    deliveryInfo: "Fast courier delivery within Kenya in 24 hours.",
    specifications: {
      "Material": "100% Genuine Leather & Glass Beads",
      "Sole": "Recycled Anti-Slip Rubber",
      "Origin": "Kajiado & Kilimani Artisans"
    },
    tags: ["sandals", "maasai", "leather", "handmade"]
  },
  {
    id: "prod-13",
    slug: "handwoven-kiondo-tote-bag-leather-handles",
    title: "Handwoven Sisal Kiondo Tote Bag with Genuine Leather Straps & Zipper Closure",
    sku: "SAV-KND-TT-05",
    description: "Traditional Kenyan sisal basket weave dyed with natural plant extracts. Features reinforced genuine leather handles, lined interior with phone pocket, and top zipper.",
    category: "Fashion & Clothing",
    price: 3500,
    originalPrice: 4500,
    discountPercentage: 22,
    inStock: true,
    stockCount: 18,
    lowStockThreshold: 4,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-2",
    businessName: "Savanna Fashion House",
    businessSlug: "savanna-fashion-house",
    businessVerified: true,
    county: "Nairobi",
    town: "Kilimani",
    rating: 4.94,
    reviewCount: 46,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Same day Nairobi delivery available.",
    specifications: {
      "Material": "Natural Sisal Fiber & Genuine Kenyan Leather",
      "Closure": "Top Metal Zipper & Lined Interior",
      "Crafting Time": "Handwoven over 14 days"
    },
    tags: ["kiondo", "handbag", "sisal", "craft"]
  },
  {
    id: "prod-14",
    slug: "lg-65-inch-oled-4k-smart-tv-c3",
    title: "LG 65-inch OLED 4K Smart TV (C3 Series) evo Processor with Dolby Vision & Atmos",
    sku: "LG-65C3-OLED-4K",
    description: "Self-lit OLED pixels delivering infinite contrast, 100% color volume, a9 AI Processor Gen6, 120Hz native refresh rate for gaming, and webOS 23 Smart TV interface.",
    category: "TV, Audio & Video",
    price: 245000,
    originalPrice: 289000,
    discountPercentage: 15,
    inStock: true,
    stockCount: 4,
    lowStockThreshold: 1,
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-3",
    businessName: "Mtaa Electronics",
    businessSlug: "mtaa-electronics",
    businessVerified: true,
    county: "Kiambu",
    town: "Thika",
    rating: 4.98,
    reviewCount: 28,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Insured crate transport & free professional wall mounting across Nairobi & Kiambu.",
    specifications: {
      "Display": "65-inch OLED evo (3840 x 2160)",
      "Refresh Rate": "120Hz Native with G-Sync & FreeSync",
      "Audio": "40W 4.2 Channel Surround Sound",
      "Warranty": "2-Year Official LG EA Warranty"
    },
    tags: ["lg", "oled", "tv", "4k"]
  },
  {
    id: "prod-15",
    slug: "anker-737-power-bank-24000mah-140w",
    title: "Anker 737 Power Bank 24,000mAh 3-Port 140W Fast Charging with Smart Digital Display",
    sku: "ANK-737-24K-140W",
    description: "Ultra-powerful multi-device power bank capable of charging a 16-inch MacBook Pro or smartphone at full speed. Smart digital display shows real-time input/output power and remaining charge time.",
    category: "Phones & Accessories",
    price: 14500,
    originalPrice: 18000,
    discountPercentage: 19,
    inStock: true,
    stockCount: 16,
    lowStockThreshold: 4,
    images: [
      "https://images.unsplash.com/photo-1609592424074-129676646875?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-1",
    businessName: "Nairobi Tech Hub",
    businessSlug: "nairobi-tech-hub",
    businessVerified: true,
    county: "Nairobi",
    town: "CBD",
    rating: 4.93,
    reviewCount: 71,
    isFeatured: false,
    isTrending: true,
    deliveryInfo: "Fast 2-hour Nairobi delivery.",
    specifications: {
      "Capacity": "24,000 mAh (86.4Wh)",
      "Output": "140W Max Output (2x USB-C, 1x USB-A)",
      "Warranty": "18 Months Replacement Warranty"
    },
    tags: ["powerbank", "anker", "charger", "tech"]
  },
  {
    id: "prod-16",
    slug: "honda-3-inch-gasoline-water-pump-irrigation",
    title: "Honda WB30XT 3-Inch High Flow Gasoline Water Pump for Farm Irrigation",
    sku: "HND-WB30XT-PUMP",
    description: "Heavy-duty 4-stroke commercial water pump delivering 1,100 liters per minute. Ideal for crop irrigation, water transfer, construction dewatering, and livestock watering across Kenya.",
    category: "Home & Kitchen",
    price: 38000,
    originalPrice: 43500,
    discountPercentage: 12,
    inStock: true,
    stockCount: 7,
    lowStockThreshold: 2,
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-5",
    businessName: "Kenya Home Styles",
    businessSlug: "kenya-home-styles",
    businessVerified: true,
    county: "Nakuru",
    town: "CBD",
    rating: 4.87,
    reviewCount: 33,
    isFeatured: false,
    isTrending: true,
    deliveryInfo: "Countrywide transport to farm gates across Nakuru, Narok, Uasin Gishu, Nyeri & Machakos.",
    specifications: {
      "Engine": "Honda GX160 4-Stroke OHV Commercial Engine",
      "Flow Rate": "1,100 Liters / Minute (66 m3/hr)",
      "Suction / Discharge": "3 Inch (80mm)",
      "Warranty": "1-Year Commercial Warranty"
    },
    tags: ["waterpump", "honda", "farm", "irrigation"]
  },
  {
    id: "prod-17",
    slug: "ergonomic-high-back-executive-office-chair",
    title: "Ergonomic High-Back Executive Mesh Office Chair with Lumbar Support & Adjustable Headrest",
    sku: "KHS-CHR-ERG-EXC",
    description: "Breathable Korean mesh backrest, 3D adjustable armrests, heavy-duty pneumatic gas lift cylinder, and synchronized tilt mechanism designed for 12+ hour comfortable workdays.",
    category: "Furniture & Decor",
    price: 18999,
    originalPrice: 24000,
    discountPercentage: 20,
    inStock: true,
    stockCount: 11,
    lowStockThreshold: 3,
    images: [
      "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-5",
    businessName: "Kenya Home Styles",
    businessSlug: "kenya-home-styles",
    businessVerified: true,
    county: "Nakuru",
    town: "CBD",
    rating: 4.89,
    reviewCount: 54,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Flat-pack or pre-assembled delivery within 24 hours.",
    specifications: {
      "Material": "High-Density Breathable Mesh & Nylon Base",
      "Max Weight Capacity": "150 kg",
      "Warranty": "3-Year Gas Lift & Base Warranty"
    },
    tags: ["chair", "office", "ergonomic", "furniture"]
  },
  {
    id: "prod-18",
    slug: "sheth-naturals-baobab-avocado-hair-oil",
    title: "Sheth Naturals 100% Organic Baobab & Cold-Pressed Avocado Scalp Nourishing Oil (250ml)",
    sku: "SHN-BBA-OIL-250",
    description: "Rich in Essential Fatty Acids, Vitamin E, and antioxidants. Deeply penetrates low-porosity natural hair strands to stop breakage, soothe dry scalp, and promote natural curl retention.",
    category: "Health & Beauty",
    price: 1650,
    originalPrice: 2100,
    discountPercentage: 21,
    inStock: true,
    stockCount: 40,
    lowStockThreshold: 8,
    images: [
      "https://images.unsplash.com/photo-1608248597359-4679720d4f6a?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-4",
    businessName: "AfriBeauty Organics",
    businessSlug: "afribeauty-organics",
    businessVerified: true,
    county: "Mombasa",
    town: "Nyali",
    rating: 4.97,
    reviewCount: 112,
    isFeatured: false,
    isTrending: true,
    deliveryInfo: "Same day dispatch from Mombasa & Nairobi distribution hubs.",
    specifications: {
      "Volume": "250ml Glass Bottle with Pump",
      "Extraction": "100% Cold-Pressed Unrefined Oils",
      "Certification": "KEBS Approved & Cruelty-Free"
    },
    tags: ["hair oil", "organic", "sheth", "beauty"]
  },
  {
    id: "prod-19",
    slug: "ramtons-3-burner-gas-1-electric-plate-cooker",
    title: "Ramtons 3-Burner Gas + 1 Electric Hotplate Standing Cooker with Electric Oven",
    sku: "RMT-CKR-3G1E-SLV",
    description: "Versatile standing cooker featuring auto-ignition gas burners, 1 electric hotplate, spacious electric oven with grill, rotisserie turnspit, and glass top lid cover.",
    category: "Home & Kitchen",
    price: 42999,
    originalPrice: 48500,
    discountPercentage: 11,
    inStock: true,
    stockCount: 8,
    lowStockThreshold: 2,
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-3",
    businessName: "Mtaa Electronics",
    businessSlug: "mtaa-electronics",
    businessVerified: true,
    county: "Kiambu",
    town: "Thika",
    rating: 4.86,
    reviewCount: 39,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Free delivery within Thika & Nairobi. Upcountry delivery in protective packaging.",
    specifications: {
      "Burners": "3x Gas Burners + 1x Electric Plate (1500W)",
      "Oven Capacity": "58 Liters Electric Oven with Grill",
      "Warranty": "1-Year Manufacturer Warranty"
    },
    tags: ["cooker", "ramtons", "kitchen", "oven"]
  },
  {
    id: "prod-20",
    slug: "hp-spectre-x360-14-intel-core-ultra-7",
    title: "HP Spectre x360 14-inch 2-in-1 Convertible Laptop (Intel Core Ultra 7, 16GB RAM, 1TB SSD) OLED Touch",
    sku: "HP-SPC-X360-U7-1TB",
    description: "2.8K OLED 120Hz touch display, Intel Arc graphics, AI-enhanced 9MP webcam, quad Bang & Olufsen speakers, and bundled HP Rechargeable MP2.0 Tilt Pen.",
    category: "Computers & Tech",
    price: 210000,
    originalPrice: 235000,
    discountPercentage: 10,
    inStock: true,
    stockCount: 5,
    lowStockThreshold: 2,
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop"
    ],
    businessId: "biz-1",
    businessName: "Nairobi Tech Hub",
    businessSlug: "nairobi-tech-hub",
    businessVerified: true,
    county: "Nairobi",
    town: "CBD",
    rating: 4.96,
    reviewCount: 23,
    isFeatured: true,
    isTrending: true,
    deliveryInfo: "Free insured delivery within Kenya with real-time GPS tracking.",
    specifications: {
      "Processor": "Intel Core Ultra 7 155H (16 Cores, 22 Threads)",
      "Display": "14.0-inch 2.8K OLED (2880 x 1800) 120Hz Touch",
      "Memory": "16GB LPDDR5x RAM",
      "Storage": "1TB PCIe Gen4 NVMe M.2 SSD",
      "Warranty": "12 Months Official Warranty"
    },
    tags: ["hp", "spectre", "laptop", "oled"]
  }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: "srv-1",
    slug: "certified-plumbing-leak-detection-repairs",
    title: "Master Plumbing, Leak Detection & Water Heater Installation",
    category: "Repairs & Services",
    description: "Licensed plumbing technicians providing emergency leak repairs, borehole pump servicing, solar water heater installations, and modern bathroom fixture fitting with a 90-day workmanship guarantee.",
    startingPrice: 2500,
    pricingType: "custom_quote",
    providerId: "biz-p1",
    providerName: "Nairobi Flow Masters Plumbers",
    providerSlug: "nairobi-flow-masters",
    providerVerified: true,
    rating: 4.9,
    reviewCount: 88,
    county: "Nairobi",
    town: "Kilimani",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    duration: "1 - 3 Hours",
    features: ["Emergency 24/7 Callout", "90-Day Guarantee", "Borehole & Solar Specialist", "KEBS-Certified Materials"]
  },
  {
    id: "srv-2",
    slug: "commercial-photography-product-events",
    title: "High-End E-Commerce Product Photography & Brand Video Production",
    category: "Professional & Creative",
    description: "Studio-grade product photography, 360-degree interactive spins, Amazon/VendLex optimized white-background stills, and cinematic short-form promotional reels for Kenyan businesses.",
    startingPrice: 7500,
    pricingType: "fixed",
    providerId: "biz-p2",
    providerName: "Savanna Lens Studios",
    providerSlug: "savanna-lens-studios",
    providerVerified: true,
    rating: 5.0,
    reviewCount: 114,
    county: "Nairobi",
    town: "Westlands",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop",
    duration: "24 - 48 Hour Turnaround",
    features: ["High-Res RAW & WebP Files", "White Background & Lifestyle", "Includes Color Grading", "Commercial Usage Rights"]
  },
  {
    id: "srv-3",
    slug: "solar-system-installation-backup-power",
    title: "Residential & Commercial Solar Inverter Installation & Battery Backup",
    category: "Repairs & Services",
    description: "Cut KPLC power bills by up to 80% with customized hybrid solar PV systems, Lithium LiFePO4 batteries, EPRA certified engineering, and automated grid-switching.",
    startingPrice: 3500,
    pricingType: "custom_quote",
    providerId: "biz-p3",
    providerName: "Rift Solar & Power KE",
    providerSlug: "rift-solar-power",
    providerVerified: true,
    rating: 4.95,
    reviewCount: 76,
    county: "Nakuru",
    town: "CBD",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
    duration: "1 - 2 Days",
    features: ["EPRA Certified Engineers", "Tier-1 Solar Panels", "10-Year Inverter Warranty", "Mobile App Energy Monitoring"]
  },
  {
    id: "srv-4",
    slug: "professional-deep-cleaning-fumigation",
    title: "Eco-Friendly Deep House Cleaning, Sofa Steaming & Fumigation",
    category: "Repairs & Services",
    description: "Complete move-in/move-out deep cleaning, high-temperature steam upholstery sanitation, rug washing, and odorless child-safe pest control fumigation.",
    startingPrice: 3500,
    pricingType: "fixed",
    providerId: "biz-p4",
    providerName: "BriteClean Solutions KE",
    providerSlug: "briteclean-ke",
    providerVerified: true,
    rating: 4.85,
    reviewCount: 152,
    county: "Kiambu",
    town: "Ruiru",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    duration: "3 - 5 Hours",
    features: ["Non-toxic Eco Chemicals", "High-temp Steam Extractors", "Vetted Background-Checked Staff", "Satisfaction Guaranteed"]
  }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Kevin Mwangi",
    role: "Founder & Lead Tech",
    businessName: "Nairobi Tech Hub",
    county: "Nairobi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    content: "VendLex transformed our electronics business. Before, we relied solely on foot traffic in Nairobi CBD. Now we receive orders from Kisumu, Mombasa, and Eldoret every single morning with M-Pesa payments settled straight to our store.",
    rating: 5,
    growthMetric: "+320% Revenue in 6 Months"
  },
  {
    id: "test-2",
    name: "Amina Hassan",
    role: "Creative Director",
    businessName: "Savanna Fashion House",
    county: "Nairobi / Mombasa",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop",
    content: "The VendLex AI Assistant is a game-changer for solo entrepreneurs. It drafts all my Instagram captions and product descriptions in seconds. The automated PDF invoice generator also makes us look exceptionally professional.",
    rating: 5,
    growthMetric: "Saved 15+ Hours/Week on Admin"
  },
  {
    id: "test-3",
    name: "Brian Kipchumba",
    role: "Managing Partner",
    businessName: "Rift Solar & Power KE",
    county: "Nakuru",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    content: "The Verified Business badge gave our solar engineering firm instant trust. Clients know we are vetted, which boosted our conversion rate on service quote requests significantly.",
    rating: 5,
    growthMetric: "85 Verified Installations Completed"
  }
];

export const PRICING_PLANS = [
  {
    id: "basic",
    name: "BASIC LISTING",
    badge: "Lowest Starter Tier",
    monthlyPrice: 199,
    yearlyPrice: 1910, // 20% off
    description: "Essential listing presence for emerging Kenyan sellers & service technicians stepping into digital commerce.",
    features: [
      "Public business & service directory profile",
      "Up to 15 verified product/service listings",
      "Direct customer WhatsApp & phone inquiries",
      "Lipa na M-Pesa STK push checkout support",
      "Official VendLex Seller Accreditation Certificate",
      "Standard marketplace search discovery",
      "Basic sales & visitor analytics"
    ],
    ctaText: "Start Basic (KSh 199/mo)",
    popular: false
  },
  {
    id: "starter",
    name: "STARTER",
    badge: "Growing Hustle",
    monthlyPrice: 299,
    yearlyPrice: 2870, // 20% off
    description: "Complete store tools for active sellers processing weekly orders.",
    features: [
      "Custom branded storefront page",
      "Up to 50 product/service listings",
      "Order management & status pipeline",
      "Inventory & low-stock alerts",
      "Professional PDF invoice generator",
      "Customer contact CRM",
      "Standard M-Pesa checkout support"
    ],
    ctaText: "Start Starter Plan",
    popular: false
  },
  {
    id: "business",
    name: "BUSINESS",
    badge: "MOST POPULAR",
    monthlyPrice: 799,
    yearlyPrice: 7670, // 20% off
    description: "The complete commerce engine for established businesses scaling nationwide.",
    features: [
      "Unlimited product & service listings",
      "Verified Business blue badge",
      "Advanced sales & county analytics",
      "VendLex AI Assistant (500 credits/mo)",
      "Coupons, flash deals & promotions manager",
      "Priority customer search ranking",
      "Custom storefront colors & domain alias",
      "Priority 24/7 WhatsApp & Phone Support"
    ],
    ctaText: "Launch Business Plan",
    popular: true
  },
  {
    id: "pro",
    name: "PRO ENTERPRISE",
    badge: "Maximum Visibility",
    monthlyPrice: 1499,
    yearlyPrice: 14390, // 20% off
    description: "Uncapped power with homepage featured placements and unlimited AI generation.",
    features: [
      "Everything in Business Plan",
      "Featured placement on Homepage & Categories",
      "Unlimited VendLex AI Assistant credits",
      "Dedicated account manager",
      "Bulk CSV inventory import/export",
      "Multi-staff accounts & permissions",
      "Custom domain connection (yourbrand.co.ke)",
      "Zero marketplace processing fee"
    ],
    ctaText: "Upgrade to Pro",
    popular: false
  }
];
