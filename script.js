// ==========================
// Initialization & Helpers
// ==========================
let products = JSON.parse(localStorage.getItem('products')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

function saveData() {
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('history', JSON.stringify(history));
}

function formatDate() {
  return new Date().toLocaleString();
}

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// ==========================
// DOM Elements
// ==========================
const productForm = document.getElementById("productForm");
const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const quantityInput = document.getElementById("quantity");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
const productList = document.getElementById("productList");
const totalProducts = document.getElementById("totalProducts");
const totalQuantity = document.getElementById("totalQuantity");
const totalTiles = document.getElementById("totalTiles");
const totalGranite = document.getElementById("totalGranite");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterDate = document.getElementById("filterDate");

// ==========================
// Theme Toggle
// ==========================
document.getElementById("toggleTheme").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
});

// ==========================
// Add Product
// ==========================
productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const reader = new FileReader();
  const file = photoInput.files[0];

  reader.onloadend = () => {
    const product = {
      id: generateId(),
      name: nameInput.value,
      category: categoryInput.value,
      quantity: parseInt(quantityInput.value),
      image: file ? reader.result : "",
      createdAt: formatDate(),
    };

    products.push(product);
    history.push({ ...product, type: "IN", date: product.createdAt });
    saveData();
    renderProducts();
    productForm.reset();
    photoPreview.innerHTML = "";
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    reader.onloadend(); // Trigger manually if no photo
  }
});

// ==========================
// Render Products
// ==========================
function renderProducts() {
  productList.innerHTML = "";
  const query = searchInput.value.toLowerCase();
  const sortBy = sortSelect.value;

  let filtered = [...products];

  if (query) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  }

  if (filterDate.value) {
    filtered = filtered.filter(p => p.createdAt.startsWith(filterDate.value));
  }

  switch (sortBy) {
    case "name": filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "quantity": filtered.sort((a, b) => b.quantity - a.quantity); break;
    case "category": filtered.sort((a, b) => a.category.localeCompare(b.category)); break;
    default: filtered.reverse(); break; // latest first
  }

  filtered.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image || 'placeholder.png'}" onclick="openImageModal('${product.image}')"/>
      <h3>${product.name}</h3>
      <p>Category: ${product.category}</p>
      <p>Qty: ${product.quantity}</p>
      <div class="actions">
        <button onclick="editProduct('${product.id}')">✏️</button>
        <button onclick="deleteProduct('${product.id}')">🗑️</button>
        <button onclick="adjustStock('${product.id}', 'out')">Stock Out</button>
        <button onclick="showHistory('${product.id}')">📜</button>
      </div>
    `;
    productList.appendChild(card);
  });

  updateDashboard();
}

function updateDashboard() {
  totalProducts.textContent = products.length;
  totalQuantity.textContent = products.reduce((acc, p) => acc + p.quantity, 0);
  totalTiles.textContent = products.filter(p => p.category === "Tile").reduce((acc, p) => acc + p.quantity, 0);
  totalGranite.textContent = products.filter(p => p.category === "Granite").reduce((acc, p) => acc + p.quantity, 0);
}

// ==========================
// Actions
// ==========================
function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    products = products.filter(p => p.id !== id);
    saveData();
    renderProducts();
  }
}

function editProduct(id) {
  const p = products.find(p => p.id === id);
  document.getElementById("editId").value = p.id;
  document.getElementById("editName").value = p.name;
  document.getElementById("editCategory").value = p.category;
  document.getElementById("editQuantity").value = p.quantity;
  openModal("editModal");
}

document.getElementById("editForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const p = products.find(p => p.id === id);
  p.name = document.getElementById("editName").value;
  p.category = document.getElementById("editCategory").value;
  p.quantity = parseInt(document.getElementById("editQuantity").value);
  saveData();
  closeModal("editModal");
  renderProducts();
});

function adjustStock(id, type) {
  const product = products.find(p => p.id === id);
  const qty = parseInt(prompt("Enter quantity to stock " + type + ":"));
  if (!isNaN(qty) && qty > 0) {
    if (type === "out" && product.quantity < qty) {
      return alert("Not enough stock!");
    }
    product.quantity += type === "in" ? qty : -qty;
    history.push({ ...product, type: type.toUpperCase(), date: formatDate(), change: qty });
    saveData();
    renderProducts();
  }
}

function showHistory(id) {
  const logs = history.filter(h => h.id === id);
  const historyContent = document.getElementById("historyContent");
  historyContent.innerHTML = logs.map(log => `
    <div><strong>${log.type}</strong> — ${log.change || log.quantity} units on ${log.date}</div>
  `).join("");
  openModal("historyModal");
}

// ==========================
// Modals & Preview
// ==========================
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}
function openImageModal(src) {
  if (!src) return;
  document.getElementById("modalImage").src = src;
  openModal("imageModal");
}
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      photoPreview.innerHTML = `<img src="${reader.result}" alt="Preview"/>`;
    };
    reader.readAsDataURL(file);
  }
});

// ==========================
// Search / Sort / Filter
// ==========================
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
filterDate.addEventListener("change", renderProducts);

// ==========================
// CSV / JSON Export
// ==========================
document.getElementById("exportJson").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(products)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "stock-data.json";
  link.click();
});

document.getElementById("exportCSV").addEventListener("click", () => {
  const rows = [
    ["Name", "Category", "Quantity", "CreatedAt"],
    ...products.map(p => [p.name, p.category, p.quantity, p.createdAt])
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "stock-data.csv";
  link.click();
});

document.getElementById("importFile").addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const imported = JSON.parse(reader.result);
      if (Array.isArray(imported)) {
        products = imported;
        saveData();
        renderProducts();
      }
    } catch {
      alert("Invalid file");
    }
  };
  if (file) reader.readAsText(file);
});

// ==========================
// Initial Render
// ==========================
renderProducts();
