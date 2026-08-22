// LocalStorage and Mock Data Handlers
// NOTE: Temporary frontend mock data architecture. Will be replaced with PHP + MySQL API integrations.

const INITIAL_DATA = {
  products: [
    { id: 101, name: "Meena Zari Saree", category: "Sarees", price: 8500, oldPrice: null, tag: "New", status: "Active", date: "2026-08-15", image: "saree1.jpg" },
    { id: 102, name: "Rani Sequin Lehenga", category: "Lehenga", price: 24500, oldPrice: 29000, tag: "Sale", status: "Active", date: "2026-08-10", image: "lehenga1.jpg" },
    { id: 103, name: "Noor Trail Gown", category: "Gowns", price: 16200, oldPrice: null, tag: null, status: "Active", date: "2026-08-01", image: "gown1.jpg" }
  ],
  categories: [
    { id: 1, name: "Sarees", count: 86, status: "Active", image: "cat-saree.jpg" },
    { id: 2, name: "Lehenga", count: 58, status: "Active", image: "cat-lehenga.jpg" },
    { id: 3, name: "Gowns", count: 37, status: "Active", image: "cat-gown.jpg" },
    { id: 4, name: "Salwar Kameez", count: 64, status: "Active", image: "cat-kameez.jpg" },
    { id: 5, name: "Bridal", count: 42, status: "Active", image: "cat-bridal.jpg" },
    { id: 6, name: "Accessories", count: 29, status: "Active", image: "cat-acc.jpg" }
  ],
  orders: [
    { id: "ORD-9921", customer: "Farzana R.", phone: "01711002233", products: "Suhana Bridal Lehenga", amount: 65000, payment: "Paid", status: "Delivered", date: "2026-08-20" },
    { id: "ORD-9922", customer: "Nusrat J.", phone: "01822334455", products: "Meena Zari Saree", amount: 8500, payment: "Pending", status: "Processing", date: "2026-08-21" }
  ],
  hero: [
    { id: 1, title: "Feel the joy of presenting yourself", subtitle: "Designer Wear", btnText: "Shop Now", btnLink: "#categories", status: "Active", order: 1 },
    { id: 2, title: "Grand Bridal Collection", subtitle: "Exclusive 2026", btnText: "Explore Bridal", btnLink: "#bridal", status: "Active", order: 2 }
  ],
  gallery: [
    { id: 1, url: "https://instagram.com/p/example1", status: "Active", order: 1 },
    { id: 2, url: "https://instagram.com/p/example2", status: "Active", order: 2 }
  ],
  customers: [
    { id: 1, name: "Farzana R.", phone: "01711002233", email: "farzana@gmail.com", orders: 4, spent: 120000, lastOrder: "2026-08-20", status: "Active" }
  ],
  reviews: [
    { id: 1, customer: "Farzana R.", rating: 5, review: "The detail work on my bridal lehenga was beyond anything I imagined.", product: "Suhana Bridal Lehenga", date: "2026-08-20", status: "Approved" }
  ],
  offers: [
    { id: 1, name: "Eid Exclusive", discount: "20%", startDate: "2026-08-01", endDate: "2026-08-30", category: "Lehenga", status: "Active" }
  ],
  coupons: [
    { id: 1, code: "BRIDAL2026", type: "Percentage", amount: "10%", minOrder: 50000, expiry: "2026-12-31", limit: 100, status: "Active" }
  ],
  imageHistory: [
    {
      productName: "Meena Zari Saree",
      current: "meena-zari-v3.jpg",
      history: [
        { file: "black-saree.jpg", date: "18 Aug 2026" },
        { file: "red-saree.jpg", date: "20 Aug 2026" },
        { file: "pink-saree.jpg", date: "22 Aug 2026" }
      ]
    }
  ]
};

function initStorage() {
  Object.keys(INITIAL_DATA).forEach(key => {
    if (!localStorage.getItem(`shosta_admin_${key}`)) {
      localStorage.setItem(`shosta_admin_${key}`, JSON.stringify(INITIAL_DATA[key]));
    }
  });
}

function getData(key) {
  initStorage();
  return JSON.parse(localStorage.getItem(`shosta_admin_${key}`));
}

function setData(key, data) {
  localStorage.setItem(`shosta_admin_${key}`, JSON.stringify(data));
}