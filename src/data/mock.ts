export interface User {
  id: string
  name: string
  role: 'farmer' | 'merchant' | 'admin'
  email: string
  avatar: string
}

export const users: Record<string, User> = {
  farmer: {
    id: "f1",
    name: "Alex Johnson",
    role: "farmer",
    email: "alex@farm.com",
    avatar: "https://i.pravatar.cc/150?u=f1",
  },
  merchant: {
    id: "m1",
    name: "Sarah Chen",
    role: "merchant",
    email: "sarah@trade.com",
    avatar: "https://i.pravatar.cc/150?u=m1",
  },
  admin: {
    id: "a1",
    name: "System Admin",
    role: "admin",
    email: "admin@cropdeck.com",
    avatar: "https://i.pravatar.cc/150?u=a1",
  }
}

export const marketplaceListings = [
  {
    id: "l1",
    cropName: "Organic Wheat",
    farmerName: "Alex Johnson",
    quantity: "500 kg",
    price: "$2.50 / kg",
    location: "California, USA",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400",
    status: "available",
  },
  {
    id: "l2",
    cropName: "Fresh Tomatoes",
    farmerName: "Maria Garcia",
    quantity: "200 kg",
    price: "$3.00 / kg",
    location: "Texas, USA",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400",
    status: "available",
  },
  {
    id: "l3",
    cropName: "Soybeans",
    farmerName: "John Doe",
    quantity: "1000 kg",
    price: "$1.20 / kg",
    location: "Iowa, USA",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=400",
    status: "available",
  },
  {
    id: "l4",
    cropName: "Premium Coffee Beans",
    farmerName: "Luis Silva",
    quantity: "150 kg",
    price: "$15.00 / kg",
    location: "Minas Gerais, Brazil",
    image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=400",
    status: "available",
  }
]

export const stats = {
  farmersOnboarded: "12,450",
  merchantConnections: "4,200",
  cropTransactions: "$8.5M+",
  aiInsightsGenerated: "450K+",
}

export const adminData = {
  totalFarmers: 12450,
  totalMerchants: 4200,
  activeListings: 845,
  revenue: "$1.2M",
  users: [
    { id: "1", name: "Alex Johnson", role: "Farmer", status: "Active", verified: true },
    { id: "2", name: "Sarah Chen", role: "Merchant", status: "Active", verified: true },
    { id: "3", name: "Michael Smith", role: "Farmer", status: "Suspended", verified: false },
    { id: "4", name: "Emma Wilson", role: "Merchant", status: "Active", verified: true },
  ]
}
