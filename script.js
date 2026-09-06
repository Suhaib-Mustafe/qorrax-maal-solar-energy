// System Configuration
const CONFIG = {
    DEFAULT_USERNAME: 'suhaib',
    DEFAULT_PASSWORD: '1122',
    LOCAL_STORAGE_KEY: 'qorraxmaal_solar_system',
    TABLES: ['customers', 'employees', 'products', 'orders', 'payments', 'salaries', 'suppliers']
};

// System State
let systemState = {
    currentSection: 'dashboard',
    editingMode: {
        customers: false,
        employees: false,
        products: false,
        orders: false,
        payments: false,
        salaries: false,
        suppliers: false
    },
    currentReportType: ''
};

// Initialize LocalStorage Data Structure
function initializeData() {
    if (!localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) {
        const initialData = {
            customers: [],
            employees: [],
            products: [],
            orders: [],
            payments: [],
            salaries: [],
            suppliers: [],
            systemSettings: {
                lastCustomerId: 0,
                lastEmployeeId: 0,
                lastProductId: 0,
                lastOrderId: 0,
                lastPaymentId: 0,
                lastSalaryId: 0,
                lastSupplierId: 0
            }
        };
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(initialData));
    }
    return JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY));
}

// Get Data
function getData() {
    return JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY));
}

// Save Data
function saveData(data) {
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(data));
}

// Update Settings
function updateSettings(key, value) {
    const data = getData();
    data.systemSettings[key] = value;
    saveData(data);
}

// Generate New ID
function generateNewId(type) {
    const data = getData();
    const key = `last${type.charAt(0).toUpperCase() + type.slice(1)}Id`;
    const newId = data.systemSettings[key] + 1;
    updateSettings(key, newId);
    return newId;
}

// Login System
function setupLogin() {
    const loginBtn = document.getElementById('loginBtn');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.className = type === 'password' ? 'fas fa-eye toggle-password' : 'fas fa-eye-slash toggle-password';
    });
    
    // Login function
    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            alert('Please enter both username and password!');
            return;
        }
        
        if (username === CONFIG.DEFAULT_USERNAME && password === CONFIG.DEFAULT_PASSWORD) {
            // Successful login
            document.getElementById('loginScreen').classList.remove('active');
            document.getElementById('mainSystem').classList.add('active');
            
            // Initialize system
            initializeData();
            updateDashboardStats();
            loadDashboardChart();
            updateDateTime();
            
            // Start clock
            setInterval(updateDateTime, 1000);
        } else {
            alert('Invalid username or password!');
        }
    });
    
    // Enter key login
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Navigation System
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const logoutBtn = document.getElementById('logoutBtn');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            
            // Update active menu
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show target section
            showSection(target);
        });
    });
    
    // Logout function
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            document.getElementById('mainSystem').classList.remove('active');
            document.getElementById('loginScreen').classList.add('active');
            
            // Clear login form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        }
    });
    
    // Show initial section
    showSection('dashboard');
}

// Show Section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(sectionId).classList.add('active');
    systemState.currentSection = sectionId;
    
    // Initialize section
    switch(sectionId) {
        case 'dashboard':
            updateDashboardStats();
            loadDashboardChart();
            break;
        case 'customer':
            initializeCustomerSection();
            break;
        case 'employee':
            initializeEmployeeSection();
            break;
        case 'products':
            initializeProductsSection();
            break;
        case 'orders':
            initializeOrdersSection();
            break;
        case 'payment':
            initializePaymentSection();
            break;
        case 'salaries':
            initializeSalariesSection();
            break;
        case 'supplier':
            initializeSupplierSection();
            break;
    }
}

// Dashboard Functions
function updateDashboardStats() {
    const data = getData();
    
    document.getElementById('customerCount').textContent = data.customers.length;
    document.getElementById('employeeCount').textContent = data.employees.length;
    document.getElementById('productCount').textContent = data.products.length;
    document.getElementById('orderCount').textContent = data.orders.length;
    document.getElementById('paymentCount').textContent = data.payments.length;
    document.getElementById('salaryCount').textContent = data.salaries.length;
}

function loadDashboardChart() {
    const data = getData();
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.dashboardChart instanceof Chart) {
        window.dashboardChart.destroy();
    }
    
    const chartData = {
        labels: ['Customers', 'Employees', 'Products', 'Orders', 'Payments', 'Salaries'],
        datasets: [{
            label: 'Count',
            data: [
                data.customers.length,
                data.employees.length,
                data.products.length,
                data.orders.length,
                data.payments.length,
                data.salaries.length
            ],
            backgroundColor: [
                '#3498db', '#2ecc71', '#9b59b6',
                '#f39c12', '#1abc9c', '#e74c3c'
            ],
            borderColor: [
                '#2980b9', '#27ae60', '#8e44ad',
                '#d35400', '#16a085', '#c0392b'
            ],
            borderWidth: 1
        }]
    };
    
    window.dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'System Statistics'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Customer Management
function initializeCustomerSection() {
    const data = getData();
    const customerIdField = document.getElementById('customerId');
    
    // Generate new ID
    const newId = generateNewId('customer');
    customerIdField.value = newId;
    
    // Load customer table
    loadCustomerTable();
    
    // Setup event listeners
    setupCustomerEvents();
}

function setupCustomerEvents() {
    const saveBtn = document.getElementById('customerSave');
    const updateBtn = document.getElementById('customerUpdate');
    const deleteBtn = document.getElementById('customerDelete');
    const clearBtn = document.getElementById('customerClear');
    const searchBtn = document.getElementById('customerSearch');
    const refreshBtn = document.getElementById('customerRefresh');
    const reportBtn = document.getElementById('customerReport');
    
    // Save Customer
    saveBtn.addEventListener('click', saveCustomer);
    
    // Update Customer
    updateBtn.addEventListener('click', () => {
        if (!systemState.editingMode.customers) {
            editCustomer();
        } else {
            updateCustomer();
        }
    });
    
    // Delete Customer
    deleteBtn.addEventListener('click', deleteCustomer);
    
    // Clear Form
    clearBtn.addEventListener('click', () => {
        clearCustomerForm();
        const newId = generateNewId('customer');
        document.getElementById('customerId').value = newId;
    });
    
    // Search Customers
    searchBtn.addEventListener('click', searchCustomers);
    
    // Refresh Table
    refreshBtn.addEventListener('click', () => {
        loadCustomerTable();
        clearCustomerForm();
        const newId = generateNewId('customer');
        document.getElementById('customerId').value = newId;
    });
    
    // Generate Report
    reportBtn.addEventListener('click', () => {
        showReportModal('customers');
    });
}

function saveCustomer() {
    const id = parseInt(document.getElementById('customerId').value);
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    
    // Validation
    if (!name || !phone || !address) {
        alert('Please fill all required fields!');
        return;
    }
    
    // Validate phone number
    if (!/^\d+$/.test(phone)) {
        alert('Phone must contain only numbers!');
        return;
    }
    
    const data = getData();
    
    // Check if ID already exists
    if (data.customers.some(c => c.id === id)) {
        alert('Customer ID already exists!');
        return;
    }
    
    // Add new customer
    const customer = {
        id: id,
        name: name,
        phone: phone,
        address: address,
        createdDate: new Date().toISOString()
    };
    
    data.customers.push(customer);
    saveData(data);
    
    alert('Customer saved successfully!');
    clearCustomerForm();
    loadCustomerTable();
    updateDashboardStats();
    
    // Generate new ID
    const newId = generateNewId('customer');
    document.getElementById('customerId').value = newId;
}

function editCustomer() {
    const id = parseInt(document.getElementById('customerId').value);
    
    if (!id) {
        alert('Please enter Customer ID to edit!');
        return;
    }
    
    const data = getData();
    const customer = data.customers.find(c => c.id === id);
    
    if (!customer) {
        alert('Customer ID not found!');
        return;
    }
    
    if (confirm(`Do you want to edit Customer ID = ${id}?`)) {
        // Fill form with customer data
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerAddress').value = customer.address;
        
        // Change to edit mode
        systemState.editingMode.customers = true;
        document.getElementById('customerUpdate').innerHTML = '<i class="fas fa-save"></i> Save Edit';
    }
}

function updateCustomer() {
    const id = parseInt(document.getElementById('customerId').value);
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    
    // Validation
    if (!name || !phone || !address) {
        alert('Please fill all required fields!');
        return;
    }
    
    const data = getData();
    const index = data.customers.findIndex(c => c.id === id);
    
    if (index === -1) {
        alert('Customer not found!');
        return;
    }
    
    // Update customer
    data.customers[index] = {
        ...data.customers[index],
        name: name,
        phone: phone,
        address: address
    };
    
    saveData(data);
    
    alert('Customer updated successfully!');
    clearCustomerForm();
    loadCustomerTable();
    updateDashboardStats();
    
    // Reset edit mode
    systemState.editingMode.customers = false;
    document.getElementById('customerUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
    
    // Generate new ID
    const newId = generateNewId('customer');
    document.getElementById('customerId').value = newId;
}

function deleteCustomer() {
    const id = parseInt(document.getElementById('customerId').value);
    
    if (!id) {
        alert('Please enter Customer ID to delete!');
        return;
    }
    
    if (confirm(`Do you want to delete Customer ID = ${id}?`)) {
        const data = getData();
        const index = data.customers.findIndex(c => c.id === id);
        
        if (index === -1) {
            alert('Customer ID not found!');
            return;
        }
        
        // Check if customer has orders
        const hasOrders = data.orders.some(o => o.customerId === id);
        if (hasOrders) {
            alert('Cannot delete customer with existing orders!');
            return;
        }
        
        data.customers.splice(index, 1);
        saveData(data);
        
        alert('Customer deleted successfully!');
        clearCustomerForm();
        loadCustomerTable();
        updateDashboardStats();
        
        // Generate new ID
        const newId = generateNewId('customer');
        document.getElementById('customerId').value = newId;
    }
}

function searchCustomers() {
    const name = document.getElementById('searchCustomerName').value.trim();
    const phone = document.getElementById('searchCustomerPhone').value.trim();
    const data = getData();
    
    let filtered = data.customers;
    
    if (name) {
        filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    if (phone) {
        filtered = filtered.filter(c => c.phone.includes(phone));
    }
    
    displayCustomerTable(filtered);
}

function loadCustomerTable() {
    const data = getData();
    displayCustomerTable(data.customers);
}

function displayCustomerTable(customers) {
    const tbody = document.querySelector('#customerTable tbody');
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.address}</td>
            <td>
                <button class="action-btn select" onclick="selectCustomer(${customer.id})">
                    <i class="fas fa-check"></i> Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function selectCustomer(id) {
    const data = getData();
    const customer = data.customers.find(c => c.id === id);
    
    if (customer) {
        document.getElementById('customerId').value = customer.id;
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerAddress').value = customer.address;
        
        // Reset edit mode if active
        if (systemState.editingMode.customers) {
            systemState.editingMode.customers = false;
            document.getElementById('customerUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
    }
}

function clearCustomerForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
}

// Employee Management (similar structure)
function initializeEmployeeSection() {
    const newId = generateNewId('employee');
    document.getElementById('employeeId').value = newId;
    
    loadEmployeeTable();
    setupEmployeeEvents();
}

function setupEmployeeEvents() {
    // Similar to customer events setup
    document.getElementById('employeeSave').addEventListener('click', saveEmployee);
    document.getElementById('employeeUpdate').addEventListener('click', () => {
        if (!systemState.editingMode.employees) {
            editEmployee();
        } else {
            updateEmployee();
        }
    });
    document.getElementById('employeeDelete').addEventListener('click', deleteEmployee);
    document.getElementById('employeeClear').addEventListener('click', () => {
        clearEmployeeForm();
        const newId = generateNewId('employee');
        document.getElementById('employeeId').value = newId;
    });
    document.getElementById('employeeSearch').addEventListener('click', searchEmployees);
    document.getElementById('employeeRefresh').addEventListener('click', () => {
        loadEmployeeTable();
        clearEmployeeForm();
        const newId = generateNewId('employee');
        document.getElementById('employeeId').value = newId;
    });
    document.getElementById('employeeReport').addEventListener('click', () => {
        showReportModal('employees');
    });
}

function saveEmployee() {
    const id = parseInt(document.getElementById('employeeId').value);
    const name = document.getElementById('employeeName').value.trim();
    const salary = parseFloat(document.getElementById('employeeSalary').value);
    const shift = document.getElementById('employeeShift').value;
    const phone = document.getElementById('employeePhone').value.trim();
    const address = document.getElementById('employeeAddress').value.trim();
    
    // Validation
    if (!name || !salary || !shift || !phone || !address) {
        alert('Please fill all required fields!');
        return;
    }
    
    if (isNaN(salary) || salary <= 0) {
        alert('Please enter a valid salary amount!');
        return;
    }
    
    if (!/^\d+$/.test(phone)) {
        alert('Phone must contain only numbers!');
        return;
    }
    
    const data = getData();
    
    // Check if ID already exists
    if (data.employees.some(e => e.id === id)) {
        alert('Employee ID already exists!');
        return;
    }
    
    // Add new employee
    const employee = {
        id: id,
        name: name,
        salary: salary,
        shift: shift,
        phone: phone,
        address: address,
        createdDate: new Date().toISOString()
    };
    
    data.employees.push(employee);
    saveData(data);
    
    alert('Employee saved successfully!');
    clearEmployeeForm();
    loadEmployeeTable();
    updateDashboardStats();
    
    const newId = generateNewId('employee');
    document.getElementById('employeeId').value = newId;
}

function editEmployee() {
    const id = parseInt(document.getElementById('employeeId').value);
    
    if (!id) {
        alert('Please enter Employee ID to edit!');
        return;
    }
    
    const data = getData();
    const employee = data.employees.find(e => e.id === id);
    
    if (!employee) {
        alert('Employee ID not found!');
        return;
    }
    
    if (confirm(`Do you want to edit Employee ID = ${id}?`)) {
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeeSalary').value = employee.salary;
        document.getElementById('employeeShift').value = employee.shift;
        document.getElementById('employeePhone').value = employee.phone;
        document.getElementById('employeeAddress').value = employee.address;
        
        systemState.editingMode.employees = true;
        document.getElementById('employeeUpdate').innerHTML = '<i class="fas fa-save"></i> Save Edit';
    }
}

function updateEmployee() {
    const id = parseInt(document.getElementById('employeeId').value);
    const name = document.getElementById('employeeName').value.trim();
    const salary = parseFloat(document.getElementById('employeeSalary').value);
    const shift = document.getElementById('employeeShift').value;
    const phone = document.getElementById('employeePhone').value.trim();
    const address = document.getElementById('employeeAddress').value.trim();
    
    // Validation
    if (!name || !salary || !shift || !phone || !address) {
        alert('Please fill all required fields!');
        return;
    }
    
    const data = getData();
    const index = data.employees.findIndex(e => e.id === id);
    
    if (index === -1) {
        alert('Employee not found!');
        return;
    }
    
    // Update employee
    data.employees[index] = {
        ...data.employees[index],
        name: name,
        salary: salary,
        shift: shift,
        phone: phone,
        address: address
    };
    
    saveData(data);
    
    alert('Employee updated successfully!');
    clearEmployeeForm();
    loadEmployeeTable();
    updateDashboardStats();
    
    systemState.editingMode.employees = false;
    document.getElementById('employeeUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
    
    const newId = generateNewId('employee');
    document.getElementById('employeeId').value = newId;
}

function deleteEmployee() {
    const id = parseInt(document.getElementById('employeeId').value);
    
    if (!id) {
        alert('Please enter Employee ID to delete!');
        return;
    }
    
    if (confirm(`Do you want to delete Employee ID = ${id}?`)) {
        const data = getData();
        const index = data.employees.findIndex(e => e.id === id);
        
        if (index === -1) {
            alert('Employee ID not found!');
            return;
        }
        
        // Check if employee has salaries
        const hasSalaries = data.salaries.some(s => s.employeeId === id);
        if (hasSalaries) {
            alert('Cannot delete employee with salary records!');
            return;
        }
        
        data.employees.splice(index, 1);
        saveData(data);
        
        alert('Employee deleted successfully!');
        clearEmployeeForm();
        loadEmployeeTable();
        updateDashboardStats();
        
        const newId = generateNewId('employee');
        document.getElementById('employeeId').value = newId;
    }
}

function searchEmployees() {
    const name = document.getElementById('searchEmployeeName').value.trim();
    const phone = document.getElementById('searchEmployeePhone').value.trim();
    const data = getData();
    
    let filtered = data.employees;
    
    if (name) {
        filtered = filtered.filter(e => 
            e.name.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    if (phone) {
        filtered = filtered.filter(e => e.phone.includes(phone));
    }
    
    displayEmployeeTable(filtered);
}

function loadEmployeeTable() {
    const data = getData();
    displayEmployeeTable(data.employees);
}

function displayEmployeeTable(employees) {
    const tbody = document.querySelector('#employeeTable tbody');
    tbody.innerHTML = '';
    
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>$${employee.salary.toFixed(2)}</td>
            <td>${employee.shift}</td>
            <td>${employee.phone}</td>
            <td>${employee.address}</td>
            <td>
                <button class="action-btn select" onclick="selectEmployee(${employee.id})">
                    <i class="fas fa-check"></i> Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function selectEmployee(id) {
    const data = getData();
    const employee = data.employees.find(e => e.id === id);
    
    if (employee) {
        document.getElementById('employeeId').value = employee.id;
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeeSalary').value = employee.salary;
        document.getElementById('employeeShift').value = employee.shift;
        document.getElementById('employeePhone').value = employee.phone;
        document.getElementById('employeeAddress').value = employee.address;
        
        if (systemState.editingMode.employees) {
            systemState.editingMode.employees = false;
            document.getElementById('employeeUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
    }
}

function clearEmployeeForm() {
    document.getElementById('employeeName').value = '';
    document.getElementById('employeeSalary').value = '';
    document.getElementById('employeeShift').value = '';
    document.getElementById('employeePhone').value = '';
    document.getElementById('employeeAddress').value = '';
}

// Product Management
function initializeProductsSection() {
    const newId = generateNewId('product');
    document.getElementById('productId').value = newId;
    
    loadProductTable();
    setupProductEvents();
}

function setupProductEvents() {
    document.getElementById('productSave').addEventListener('click', saveProduct);
    document.getElementById('productUpdate').addEventListener('click', () => {
        if (!systemState.editingMode.products) {
            editProduct();
        } else {
            updateProduct();
        }
    });
    document.getElementById('productDelete').addEventListener('click', deleteProduct);
    document.getElementById('productClear').addEventListener('click', () => {
        clearProductForm();
        const newId = generateNewId('product');
        document.getElementById('productId').value = newId;
    });
    document.getElementById('productSearch').addEventListener('click', searchProducts);
    document.getElementById('productRefresh').addEventListener('click', () => {
        loadProductTable();
        clearProductForm();
        const newId = generateNewId('product');
        document.getElementById('productId').value = newId;
    });
    document.getElementById('productReport').addEventListener('click', () => {
        showReportModal('products');
    });
}

function saveProduct() {
    const id = parseInt(document.getElementById('productId').value);
    const supplierId = parseInt(document.getElementById('productSupplierId').value);
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    
    // Validation
    if (!supplierId || !name || !price || !quantity) {
        alert('Please fill all required fields!');
        return;
    }
    
    if (isNaN(supplierId) || supplierId <= 0) {
        alert('Please enter a valid Supplier ID!');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price!');
        return;
    }
    
    if (isNaN(quantity) || quantity < 0) {
        alert('Please enter a valid quantity!');
        return;
    }
    
    const data = getData();
    
    // Check if product ID already exists
    if (data.products.some(p => p.id === id)) {
        alert('Product ID already exists!');
        return;
    }
    
    // Add new product
    const product = {
        id: id,
        supplierId: supplierId,
        name: name,
        price: price,
        quantity: quantity,
        createdDate: new Date().toISOString()
    };
    
    data.products.push(product);
    saveData(data);
    
    alert('Product saved successfully!');
    clearProductForm();
    loadProductTable();
    updateDashboardStats();
    
    const newId = generateNewId('product');
    document.getElementById('productId').value = newId;
}

function editProduct() {
    const id = parseInt(document.getElementById('productId').value);
    
    if (!id) {
        alert('Please enter Product ID to edit!');
        return;
    }
    
    const data = getData();
    const product = data.products.find(p => p.id === id);
    
    if (!product) {
        alert('Product ID not found!');
        return;
    }
    
    if (confirm(`Do you want to edit Product ID = ${id}?`)) {
        document.getElementById('productSupplierId').value = product.supplierId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        
        systemState.editingMode.products = true;
        document.getElementById('productUpdate').innerHTML = '<i class="fas fa-save"></i> Save Edit';
    }
}

function updateProduct() {
    const id = parseInt(document.getElementById('productId').value);
    const supplierId = parseInt(document.getElementById('productSupplierId').value);
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    
    // Validation
    if (!supplierId || !name || !price || !quantity) {
        alert('Please fill all required fields!');
        return;
    }
    
    const data = getData();
    const index = data.products.findIndex(p => p.id === id);
    
    if (index === -1) {
        alert('Product not found!');
        return;
    }
    
    // Update product
    data.products[index] = {
        ...data.products[index],
        supplierId: supplierId,
        name: name,
        price: price,
        quantity: quantity
    };
    
    saveData(data);
    
    alert('Product updated successfully!');
    clearProductForm();
    loadProductTable();
    updateDashboardStats();
    
    systemState.editingMode.products = false;
    document.getElementById('productUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
    
    const newId = generateNewId('product');
    document.getElementById('productId').value = newId;
}

function deleteProduct() {
    const id = parseInt(document.getElementById('productId').value);
    
    if (!id) {
        alert('Please enter Product ID to delete!');
        return;
    }
    
    if (confirm(`Do you want to delete Product ID = ${id}?`)) {
        const data = getData();
        const index = data.products.findIndex(p => p.id === id);
        
        if (index === -1) {
            alert('Product ID not found!');
            return;
        }
        
        // Check if product has orders
        const hasOrders = data.orders.some(o => o.productId === id);
        if (hasOrders) {
            alert('Cannot delete product with existing orders!');
            return;
        }
        
        data.products.splice(index, 1);
        saveData(data);
        
        alert('Product deleted successfully!');
        clearProductForm();
        loadProductTable();
        updateDashboardStats();
        
        const newId = generateNewId('product');
        document.getElementById('productId').value = newId;
    }
}

function searchProducts() {
    const id = document.getElementById('searchProductId').value.trim();
    const name = document.getElementById('searchProductName').value.trim();
    const data = getData();
    
    let filtered = data.products;
    
    if (id) {
        const searchId = parseInt(id);
        if (!isNaN(searchId)) {
            filtered = filtered.filter(p => p.id === searchId);
        }
    }
    
    if (name) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    displayProductTable(filtered);
}

function loadProductTable() {
    const data = getData();
    displayProductTable(data.products);
}

function displayProductTable(products) {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.supplierId}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>
                <button class="action-btn select" onclick="selectProduct(${product.id})">
                    <i class="fas fa-check"></i> Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function selectProduct(id) {
    const data = getData();
    const product = data.products.find(p => p.id === id);
    
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productSupplierId').value = product.supplierId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        
        if (systemState.editingMode.products) {
            systemState.editingMode.products = false;
            document.getElementById('productUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
    }
}

function clearProductForm() {
    document.getElementById('productSupplierId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
}

// Order Management
function initializeOrdersSection() {
    const newId = generateNewId('order');
    document.getElementById('orderId').value = newId;
    document.getElementById('orderDate').valueAsDate = new Date();
    
    loadOrderTable();
    setupOrderEvents();
    
    // Setup auto-fill for product and customer
    document.getElementById('orderProductId').addEventListener('input', updateProductInfo);
    document.getElementById('orderCustomerId').addEventListener('input', updateCustomerInfo);
    document.getElementById('orderQuantity').addEventListener('input', calculateOrderTotal);
    document.getElementById('orderUnitPrice').addEventListener('input', calculateOrderTotal);
}

function setupOrderEvents() {
    document.getElementById('orderSave').addEventListener('click', saveOrder);
    document.getElementById('orderUpdate').addEventListener('click', () => {
        if (!systemState.editingMode.orders) {
            editOrder();
        } else {
            updateOrder();
        }
    });
    document.getElementById('orderDelete').addEventListener('click', deleteOrder);
    document.getElementById('orderClear').addEventListener('click', () => {
        clearOrderForm();
        const newId = generateNewId('order');
        document.getElementById('orderId').value = newId;
    });
    document.getElementById('orderSearch').addEventListener('click', searchOrders);
    document.getElementById('orderRefresh').addEventListener('click', () => {
        loadOrderTable();
        clearOrderForm();
        const newId = generateNewId('order');
        document.getElementById('orderId').value = newId;
    });
    document.getElementById('orderReport').addEventListener('click', () => {
        showReportModal('orders');
    });
}

function updateProductInfo() {
    const productId = parseInt(document.getElementById('orderProductId').value);
    
    if (!productId || isNaN(productId)) {
        document.getElementById('orderProductName').value = '';
        document.getElementById('orderUnitPrice').value = '';
        document.getElementById('availableStock').textContent = '0';
        document.getElementById('remainingStock').textContent = '0';
        return;
    }
    
    const data = getData();
    const product = data.products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('orderProductName').value = product.name;
        document.getElementById('orderUnitPrice').value = product.price;
        document.getElementById('availableStock').textContent = product.quantity;
        
        // Calculate remaining stock
        const quantity = parseInt(document.getElementById('orderQuantity').value) || 0;
        document.getElementById('remainingStock').textContent = product.quantity - quantity;
    } else {
        document.getElementById('orderProductName').value = '';
        document.getElementById('orderUnitPrice').value = '';
        document.getElementById('availableStock').textContent = '0';
        document.getElementById('remainingStock').textContent = '0';
    }
}

function updateCustomerInfo() {
    const customerId = parseInt(document.getElementById('orderCustomerId').value);
    
    if (!customerId || isNaN(customerId)) {
        document.getElementById('orderCustomerName').value = '';
        return;
    }
    
    const data = getData();
    const customer = data.customers.find(c => c.id === customerId);
    
    if (customer) {
        document.getElementById('orderCustomerName').value = customer.name;
    } else {
        document.getElementById('orderCustomerName').value = '';
    }
}

function calculateOrderTotal() {
    const quantity = parseInt(document.getElementById('orderQuantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('orderUnitPrice').value) || 0;
    const total = quantity * unitPrice;
    
    document.getElementById('orderTotalAmount').value = total.toFixed(2);
    
    // Update remaining stock
    const available = parseInt(document.getElementById('availableStock').textContent) || 0;
    const remaining = available - quantity;
    document.getElementById('remainingStock').textContent = remaining >= 0 ? remaining : '0';
}

function saveOrder() {
    const id = parseInt(document.getElementById('orderId').value);
    const productId = parseInt(document.getElementById('orderProductId').value);
    const customerId = parseInt(document.getElementById('orderCustomerId').value);
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const unitPrice = parseFloat(document.getElementById('orderUnitPrice').value);
    const orderDate = document.getElementById('orderDate').value;
    
    // Validation
    if (!productId || !customerId || !quantity || !unitPrice || !orderDate) {
        alert('Please fill all required fields!');
        return;
    }
    
    if (quantity <= 0) {
        alert('Quantity must be greater than 0!');
        return;
    }
    
    if (unitPrice <= 0) {
        alert('Unit price must be greater than 0!');
        return;
    }
    
    const data = getData();
    
    // Check if order ID already exists
    if (data.orders.some(o => o.id === id)) {
        alert('Order ID already exists!');
        return;
    }
    
    // Check if product exists
    const product = data.products.find(p => p.id === productId);
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    // Check if customer exists
    const customer = data.customers.find(c => c.id === customerId);
    if (!customer) {
        alert('Customer not found!');
        return;
    }
    
    // Check stock availability
    if (product.quantity < quantity) {
        alert('Not enough stock available!');
        return;
    }
    
    // Calculate total
    const totalAmount = quantity * unitPrice;
    
    // Create order
    const order = {
        id: id,
        productId: productId,
        productName: product.name,
        customerId: customerId,
        customerName: customer.name,
        quantity: quantity,
        unitPrice: unitPrice,
        totalAmount: totalAmount,
        orderDate: orderDate,
        createdDate: new Date().toISOString()
    };
    
    // Update product quantity
    const productIndex = data.products.findIndex(p => p.id === productId);
    data.products[productIndex].quantity -= quantity;
    
    // Save order and update product
    data.orders.push(order);
    saveData(data);
    
    alert('Order saved successfully!');
    clearOrderForm();
    loadOrderTable();
    updateDashboardStats();
    
    const newId = generateNewId('order');
    document.getElementById('orderId').value = newId;
}

function editOrder() {
    const id = parseInt(document.getElementById('orderId').value);
    
    if (!id) {
        alert('Please enter Order ID to edit!');
        return;
    }
    
    const data = getData();
    const order = data.orders.find(o => o.id === id);
    
    if (!order) {
        alert('Order ID not found!');
        return;
    }
    
    if (confirm(`Do you want to edit Order ID = ${id}?`)) {
        document.getElementById('orderProductId').value = order.productId;
        document.getElementById('orderProductName').value = order.productName;
        document.getElementById('orderCustomerId').value = order.customerId;
        document.getElementById('orderCustomerName').value = order.customerName;
        document.getElementById('orderQuantity').value = order.quantity;
        document.getElementById('orderUnitPrice').value = order.unitPrice;
        document.getElementById('orderTotalAmount').value = order.totalAmount;
        document.getElementById('orderDate').value = order.orderDate;
        
        // Update stock info
        const product = data.products.find(p => p.id === order.productId);
        if (product) {
            document.getElementById('availableStock').textContent = product.quantity + order.quantity;
            document.getElementById('remainingStock').textContent = product.quantity;
        }
        
        systemState.editingMode.orders = true;
        document.getElementById('orderUpdate').innerHTML = '<i class="fas fa-save"></i> Save Edit';
    }
}

function updateOrder() {
    const id = parseInt(document.getElementById('orderId').value);
    const productId = parseInt(document.getElementById('orderProductId').value);
    const customerId = parseInt(document.getElementById('orderCustomerId').value);
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const unitPrice = parseFloat(document.getElementById('orderUnitPrice').value);
    const orderDate = document.getElementById('orderDate').value;
    
    // Validation
    if (!productId || !customerId || !quantity || !unitPrice || !orderDate) {
        alert('Please fill all required fields!');
        return;
    }
    
    const data = getData();
    const orderIndex = data.orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
        alert('Order not found!');
        return;
    }
    
    const oldOrder = data.orders[orderIndex];
    const totalAmount = quantity * unitPrice;
    
    // Get product
    const product = data.products.find(p => p.id === productId);
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    // Get customer
    const customer = data.customers.find(c => c.id === customerId);
    if (!customer) {
        alert('Customer not found!');
        return;
    }
    
    // Calculate stock adjustment
    const quantityDifference = quantity - oldOrder.quantity;
    
    // Check if enough stock available
    if (product.quantity < quantityDifference) {
        alert('Not enough stock available for this change!');
        return;
    }
    
    // Update order
    data.orders[orderIndex] = {
        ...oldOrder,
        productId: productId,
        productName: product.name,
        customerId: customerId,
        customerName: customer.name,
        quantity: quantity,
        unitPrice: unitPrice,
        totalAmount: totalAmount,
        orderDate: orderDate
    };
    
    // Update product quantity
    const productIndex = data.products.findIndex(p => p.id === productId);
    data.products[productIndex].quantity -= quantityDifference;
    
    saveData(data);
    
    alert('Order updated successfully!');
    clearOrderForm();
    loadOrderTable();
    updateDashboardStats();
    
    systemState.editingMode.orders = false;
    document.getElementById('orderUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
    
    const newId = generateNewId('order');
    document.getElementById('orderId').value = newId;
}

function deleteOrder() {
    const id = parseInt(document.getElementById('orderId').value);
    
    if (!id) {
        alert('Please enter Order ID to delete!');
        return;
    }
    
    if (confirm(`Do you want to delete Order ID = ${id}?`)) {
        const data = getData();
        const orderIndex = data.orders.findIndex(o => o.id === id);
        
        if (orderIndex === -1) {
            alert('Order ID not found!');
            return;
        }
        
        const order = data.orders[orderIndex];
        
        // Check if order has payment
        const hasPayment = data.payments.some(p => p.orderId === id);
        if (hasPayment) {
            alert('Cannot delete order with existing payment!');
            return;
        }
        
        // Restore product quantity
        const productIndex = data.products.findIndex(p => p.id === order.productId);
        if (productIndex !== -1) {
            data.products[productIndex].quantity += order.quantity;
        }
        
        // Delete order
        data.orders.splice(orderIndex, 1);
        saveData(data);
        
        alert('Order deleted successfully!');
        clearOrderForm();
        loadOrderTable();
        updateDashboardStats();
        
        const newId = generateNewId('order');
        document.getElementById('orderId').value = newId;
    }
}

function searchOrders() {
    const id = document.getElementById('searchOrderId').value.trim();
    const customerName = document.getElementById('searchOrderCustomerName').value.trim();
    const data = getData();
    
    let filtered = data.orders;
    
    if (id) {
        const searchId = parseInt(id);
        if (!isNaN(searchId)) {
            filtered = filtered.filter(o => o.id === searchId);
        }
    }
    
    if (customerName) {
        filtered = filtered.filter(o => 
            o.customerName.toLowerCase().includes(customerName.toLowerCase())
        );
    }
    
    displayOrderTable(filtered);
}

function loadOrderTable() {
    const data = getData();
    displayOrderTable(data.orders);
}

function displayOrderTable(orders) {
    const tbody = document.querySelector('#orderTable tbody');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.productName}</td>
            <td>${order.customerName}</td>
            <td>${order.quantity}</td>
            <td>$${order.unitPrice.toFixed(2)}</td>
            <td>$${order.totalAmount.toFixed(2)}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td>
                <button class="action-btn select" onclick="selectOrder(${order.id})">
                    <i class="fas fa-check"></i> Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function selectOrder(id) {
    const data = getData();
    const order = data.orders.find(o => o.id === id);
    
    if (order) {
        document.getElementById('orderId').value = order.id;
        document.getElementById('orderProductId').value = order.productId;
        document.getElementById('orderProductName').value = order.productName;
        document.getElementById('orderCustomerId').value = order.customerId;
        document.getElementById('orderCustomerName').value = order.customerName;
        document.getElementById('orderQuantity').value = order.quantity;
        document.getElementById('orderUnitPrice').value = order.unitPrice;
        document.getElementById('orderTotalAmount').value = order.totalAmount;
        document.getElementById('orderDate').value = order.orderDate;
        
        // Update stock info
        const product = data.products.find(p => p.id === order.productId);
        if (product) {
            document.getElementById('availableStock').textContent = product.quantity + order.quantity;
            document.getElementById('remainingStock').textContent = product.quantity;
        }
        
        if (systemState.editingMode.orders) {
            systemState.editingMode.orders = false;
            document.getElementById('orderUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
    }
}

function clearOrderForm() {
    document.getElementById('orderProductId').value = '';
    document.getElementById('orderProductName').value = '';
    document.getElementById('orderCustomerId').value = '';
    document.getElementById('orderCustomerName').value = '';
    document.getElementById('orderQuantity').value = '';
    document.getElementById('orderUnitPrice').value = '';
    document.getElementById('orderTotalAmount').value = '';
    document.getElementById('availableStock').textContent = '0';
    document.getElementById('remainingStock').textContent = '0';
    document.getElementById('orderDate').valueAsDate = new Date();
}

// Payment Management
function initializePaymentSection() {
    const newId = generateNewId('payment');
    document.getElementById('paymentId').value = newId;
    document.getElementById('paymentDate').valueAsDate = new Date();
    
    loadPaymentTable();
    setupPaymentEvents();
    
    // Setup auto-fill for order
    document.getElementById('paymentOrderId').addEventListener('input', updatePaymentOrderInfo);
    document.getElementById('paymentDiscount').addEventListener('input', calculateNetAmount);
}

function setupPaymentEvents() {
    document.getElementById('paymentSave').addEventListener('click', savePayment);
    document.getElementById('paymentUpdate').addEventListener('click', () => {
        if (!systemState.editingMode.payments) {
            editPayment();
        } else {
            updatePayment();
        }
    });
    document.getElementById('paymentDelete').addEventListener('click', deletePayment);
    document.getElementById('paymentClear').addEventListener('click', () => {
        clearPaymentForm();
        const newId = generateNewId('payment');
        document.getElementById('paymentId').value = newId;
    });
    document.getElementById('paymentSearch').addEventListener('click', searchPayments);
    document.getElementById('paymentRefresh').addEventListener('click', () => {
        loadPaymentTable();
        clearPaymentForm();
        const newId = generateNewId('payment');
        document.getElementById('paymentId').value = newId;
    });
    document.getElementById('paymentReport').addEventListener('click', () => {
        showReportModal('payments');
    });
}

function updatePaymentOrderInfo() {
    const orderId = parseInt(document.getElementById('paymentOrderId').value);
    
    if (!orderId || isNaN(orderId)) {
        document.getElementById('paymentCustomerName').value = '';
        document.getElementById('paymentProductName').value = '';
        document.getElementById('paymentTotal').value = '';
        return;
    }
    
    const data = getData();
    const order = data.orders.find(o => o.id === orderId);
    
    if (order) {
        document.getElementById('paymentCustomerName').value = order.customerName;
        document.getElementById('paymentProductName').value = order.productName;
        document.getElementById('paymentTotal').value = order.totalAmount;
        
        // Calculate net amount
        calculateNetAmount();
    } else {
        document.getElementById('paymentCustomerName').value = '';
        document.getElementById('paymentProductName').value = '';
        document.getElementById('paymentTotal').value = '';
    }
}

function calculateNetAmount() {
    const total = parseFloat(document.getElementById('paymentTotal').value) || 0;
    const discount = parseFloat(document.getElementById('paymentDiscount').value) || 0;
    const netAmount = total - discount;
    
    document.getElementById('paymentNetAmount').value = netAmount.toFixed(2);
}

function savePayment() {
    const id = parseInt(document.getElementById('paymentId').value);
    const orderId = parseInt(document.getElementById('paymentOrderId').value);
    const total = parseFloat(document.getElementById('paymentTotal').value);
    const discount = parseFloat(document.getElementById('paymentDiscount').value) || 0;
    const method = document.getElementById('paymentMethod').value;
    const paymentDate = document.getElementById('paymentDate').value;
    
    // Validation
    if (!orderId || !method || !paymentDate) {
        alert('Please fill all required fields!');
        return;
    }
    
    if (total <= 0) {
        alert('Total amount must be greater than 0!');
        return;
    }
    
    if (discount < 0) {
        alert('Discount cannot be negative!');
        return;
    }
    
    if (discount > total) {
        alert('Discount cannot be greater than total amount!');
        return;
    }
    
    const data = getData();
    
    // Check if payment ID already exists
    if (data.payments.some(p => p.id === id)) {
        alert('Payment ID already exists!');
        return;
    }
    
    // Check if order exists
    const order = data.orders.find(o => o.id === orderId);
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    // Check if payment already exists for this order
    const existingPayment = data.payments.find(p => p.orderId === orderId);
    if (existingPayment) {
        alert('Payment already exists for this order!');
        return;
    }
    
    const netAmount = total - discount;
    
    // Create payment
    const payment = {
        id: id,
        orderId: orderId,
        customerName: order.customerName,
        productName: order.productName,
        total: total,
        discount: discount,
        netAmount: netAmount,
        method: method,
        paymentDate: paymentDate,
        createdDate: new Date().toISOString()
    };
    
    data.payments.push(payment);
    saveData(data);
    
    alert('Payment saved successfully!');
    clearPaymentForm();
    loadPaymentTable();
    updateDashboardStats();
    
    const newId = generateNewId('payment');
    document.getElementById('paymentId').value = newId;
}

function editPayment() {
    const id = parseInt(document.getElementById('paymentId').value);
    
    if (!id) {
        alert('Please enter Payment ID to edit!');
        return;
    }
    
    const data = getData();
    const payment = data.payments.find(p => p.id === id);
    
    if (!payment) {
        alert('Payment ID not found!');
        return;
    }
    
    if (confirm(`Do you want to edit Payment ID = ${id}?`)) {
        document.getElementById('paymentOrderId').value = payment.orderId;
        document.getElementById('paymentCustomerName').value = payment.customerName;
        document.getElementById('paymentProductName').value = payment.productName;
        document.getElementById('paymentTotal').value = payment.total;
        document.getElementById('paymentDiscount').value = payment.discount;
        document.getElementById('paymentNetAmount').value = payment.netAmount;
        document.getElementById('paymentMethod').value = payment.method;
        document.getElementById('paymentDate').value = payment.paymentDate;
        
        systemState.editingMode.payments = true;
        document.getElementById('paymentUpdate').innerHTML = '<i class="fas fa-save"></i> Save Edit';
    }
}

function updatePayment() {
    const id = parseInt(document.getElementById('paymentId').value);
    const orderId = parseInt(document.getElementById('paymentOrderId').value);
    const total = parseFloat(document.getElementById('paymentTotal').value);
    const discount = parseFloat(document.getElementById('paymentDiscount').value) || 0;
    const method = document.getElementById('paymentMethod').value;
    const paymentDate = document.getElementById('paymentDate').value;
    
    // Validation
    if (!orderId || !method || !paymentDate) {
        alert('Please fill all required fields!');
        return;
    }
    
    const data = getData();
    const paymentIndex = data.payments.findIndex(p => p.id === id);
    
    if (paymentIndex === -1) {
        alert('Payment not found!');
        return;
    }
    
    // Check if order exists
    const order = data.orders.find(o => o.id === orderId);
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    const netAmount = total - discount;
    
    // Update payment
    data.payments[paymentIndex] = {
        ...data.payments[paymentIndex],
        orderId: orderId,
        customerName: order.customerName,
        productName: order.productName,
        total: total,
        discount: discount,
        netAmount: netAmount,
        method: method,
        paymentDate: paymentDate
    };
    
    saveData(data);
    
    alert('Payment updated successfully!');
    clearPaymentForm();
    loadPaymentTable();
    updateDashboardStats();
    
    systemState.editingMode.payments = false;
    document.getElementById('paymentUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
    
    const newId = generateNewId('payment');
    document.getElementById('paymentId').value = newId;
}

function deletePayment() {
    const id = parseInt(document.getElementById('paymentId').value);
    
    if (!id) {
        alert('Please enter Payment ID to delete!');
        return;
    }
    
    if (confirm(`Do you want to delete Payment ID = ${id}?`)) {
        const data = getData();
        const paymentIndex = data.payments.findIndex(p => p.id === id);
        
        if (paymentIndex === -1) {
            alert('Payment ID not found!');
            return;
        }
        
        data.payments.splice(paymentIndex, 1);
        saveData(data);
        
        alert('Payment deleted successfully!');
        clearPaymentForm();
        loadPaymentTable();
        updateDashboardStats();
        
        const newId = generateNewId('payment');
        document.getElementById('paymentId').value = newId;
    }
}

function searchPayments() {
    const customerName = document.getElementById('searchPaymentCustomerName').value.trim();
    const data = getData();
    
    let filtered = data.payments;
    
    if (customerName) {
        filtered = filtered.filter(p => 
            p.customerName.toLowerCase().includes(customerName.toLowerCase())
        );
    }
    
    displayPaymentTable(filtered);
}

function loadPaymentTable() {
    const data = getData();
    displayPaymentTable(data.payments);
}

function displayPaymentTable(payments) {
    const tbody = document.querySelector('#paymentTable tbody');
    tbody.innerHTML = '';
    
    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.id}</td>
            <td>${payment.orderId}</td>
            <td>${payment.customerName}</td>
            <td>$${payment.total.toFixed(2)}</td>
            <td>$${payment.discount.toFixed(2)}</td>
            <td>$${payment.netAmount.toFixed(2)}</td>
            <td>${payment.method}</td>
            <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
            <td>
                <button class="action-btn select" onclick="selectPayment(${payment.id})">
                    <i class="fas fa-check"></i> Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function selectPayment(id) {
    const data = getData();
    const payment = data.payments.find(p => p.id === id);
    
    if (payment) {
        document.getElementById('paymentId').value = payment.id;
        document.getElementById('paymentOrderId').value = payment.orderId;
        document.getElementById('paymentCustomerName').value = payment.customerName;
        document.getElementById('paymentProductName').value = payment.productName;
        document.getElementById('paymentTotal').value = payment.total;
        document.getElementById('paymentDiscount').value = payment.discount;
        document.getElementById('paymentNetAmount').value = payment.netAmount;
        document.getElementById('paymentMethod').value = payment.method;
        document.getElementById('paymentDate').value = payment.paymentDate;
        
        if (systemState.editingMode.payments) {
            systemState.editingMode.payments = false;
            document.getElementById('paymentUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
    }
}

function clearPaymentForm() {
    document.getElementById('paymentOrderId').value = '';
    document.getElementById('paymentCustomerName').value = '';
    document.getElementById('paymentProductName').value = '';
    document.getElementById('paymentTotal').value = '';
    document.getElementById('paymentDiscount').value = '';
    document.getElementById('paymentNetAmount').value = '';
    document.getElementById('paymentMethod').value = '';
    document.getElementById('paymentDate').valueAsDate = new Date();
}

// Salary Management
function initializeSalariesSection() {
    const newId = generateNewId('salary');
    document.getElementById('salaryId').value = newId;
    document.getElementById('salaryDate').valueAsDate = new Date();
    
    loadSalaryTable();
    setupSalaryEvents();
    
    // Setup auto-fill for employee
    document.getElementById('salaryEmployeeId').addEventListener('input', updateEmployeeSalaryInfo);
    document.getElementById('salaryAmount').addEventListener('input', calculateNetSalary);
    document.getElementById('salaryBonus').addEventListener('input', calculateNetSalary);
}

function setupSalaryEvents() {
    document.getElementById('salarySave').addEventListener('click', saveSalary);
    document.getElementById('salaryUpdate').addEventListener('click', () => {
        if (!systemState.editingMode.salaries) {
            editSalary();
        } else {
            updateSalary();
        }
    });
    document.getElementById('salaryDelete').addEventListener('click', deleteSalary);
    document.getElementById('salaryClear').addEventListener('click', () => {
        clearSalaryForm();
        const newId = generateNewId('salary');
        document.getElementById('salaryId').value = newId;
    });
    document.getElementById('salarySearch').addEventListener('click', searchSalaries);
    document.getElementById('salaryRefresh').addEventListener('click', () => {
        loadSalaryTable();
        clearSalaryForm();
        const newId = generateNewId('salary');
        document.getElementById('salaryId').value = newId;
    });
    document.getElementById('salaryReport').addEventListener('click', () => {
        showReportModal('salaries');
    });
}

function updateEmployeeSalaryInfo() {
    const employeeId = parseInt(document.getElementById('salaryEmployeeId').value);
    
    if (!employeeId || isNaN(employeeId)) {
        document.getElementById('salaryEmployeeName').value = '';
        document.getElementById('salaryAmount').value = '';
        return;
    }
    
    const data = getData();
    const employee = data.employees.find(e => e.id === employeeId);
    
    if (employee) {
        document.getElementById('salaryEmployeeName').value = employee.name;
        document.getElementById('salaryAmount').value = employee.salary;
        
        // Calculate net salary
        calculateNetSalary();
    } else {
        document.getElementById('salaryEmployeeName').value = '';
        document.getElementById('salaryAmount').value = '';
    }
}

function calculateNetSalary() {
    const salary = parseFloat(document.getElementById('salaryAmount').value) || 0;
    const bonus = parseFloat(document.getElementById('salaryBonus').value) || 0;
    const netSalary = salary + bonus;
    
    document.getElementById('salaryNet').value = netSalary.toFixed(2);
}

function saveSalary() {
    const id = parseInt(document.getElementById('salaryId').value);
    const employeeId = parseInt(document.getElementById('salaryEmployeeId').value);
    const bonus = parseFloat(document.getElementById('salaryBonus').value) || 0;
    const salaryDate = document.getElementById('salaryDate').value;
    
    // Validation
    if (!employeeId || !salaryDate) {
        alert('Please fill all required fields!');
        return;
    }
    
    if (bonus < 0) {
        alert('Bonus cannot be negative!');
        return;
    }
    
    const data = getData();
    
    // Check if salary ID already exists
    if (data.salaries.some(s => s.id === id)) {
        alert('Salary ID already exists!');
        return;
    }
    
    // Check if employee exists
    const employee = data.employees.find(e => e.id === employeeId);
    if (!employee) {
        alert('Employee not found!');
        return;
    }
    
    // Check if salary already exists for this employee and month
    const salaryMonth = salaryDate.substring(0, 7); // YYYY-MM
    const existingSalary = data.salaries.find(s => 
        s.employeeId === employeeId && s.salaryDate.substring(0, 7) === salaryMonth
    );
    
    if (existingSalary) {
        alert('Salary already processed for this employee in this month!');
        return;
    }
    
    const netSalary = employee.salary + bonus;
    
    // Create salary record
    const salary = {
        id: id,
        employeeId: employeeId,
        employeeName: employee.name,
        salaryAmount: employee.salary,
        bonus: bonus,
        netSalary: netSalary,
        salaryDate: salaryDate,
        createdDate: new Date().toISOString()
    };
    
    data.salaries.push(salary);
    saveData(data);
    
    alert('Salary saved successfully!');
    clearSalaryForm();
    loadSalaryTable();
    updateDashboardStats();
    
    const newId = generateNewId('salary');
    document.getElementById('salaryId').value = newId;
}

function editSalary() {
    const id = parseInt(document.getElementById('salaryId').value);
    
    if (!id) {
        alert('Please enter Salary ID to edit!');
        return;
    }
    
    const data = getData();
    const salary = data.salaries.find(s => s.id === id);
    
    if (!salary) {
        alert('Salary ID not found!');
        return;
    }
    
    if (confirm(`Do you want to edit Salary ID = ${id}?`)) {
        document.getElementById('salaryEmployeeId').value = salary.employeeId;
        document.getElementById('salaryEmployeeName').value = salary.employeeName;
        document.getElementById('salaryAmount').value = salary.salaryAmount;
        document.getElementById('salaryBonus').value = salary.bonus;
        document.getElementById('salaryNet').value = salary.netSalary;
        document.getElementById('salaryDate').value = salary.salaryDate;
        
        systemState.editingMode.salaries = true;
        document.getElementById('salaryUpdate').innerHTML = '<i class="fas fa-save"></i> Save Edit';
    }
}

function updateSalary() {
    const id = parseInt(document.getElementById('salaryId').value);
    const employeeId = parseInt(document.getElementById('salaryEmployeeId').value);
    const bonus = parseFloat(document.getElementById('salaryBonus').value) || 0;
    const salaryDate = document.getElementById('salaryDate').value;
    
    // Validation
    if (!employeeId || !salaryDate) {
        alert('Please fill all required fields!');
        return;
    }
    
    const data = getData();
    const salaryIndex = data.salaries.findIndex(s => s.id === id);
    
    if (salaryIndex === -1) {
        alert('Salary not found!');
        return;
    }
    
    // Check if employee exists
    const employee = data.employees.find(e => e.id === employeeId);
    if (!employee) {
        alert('Employee not found!');
        return;
    }
    
    const netSalary = employee.salary + bonus;
    
    // Update salary
    data.salaries[salaryIndex] = {
        ...data.salaries[salaryIndex],
        employeeId: employeeId,
        employeeName: employee.name,
        salaryAmount: employee.salary,
        bonus: bonus,
        netSalary: netSalary,
        salaryDate: salaryDate
    };
    
    saveData(data);
    
    alert('Salary updated successfully!');
    clearSalaryForm();
    loadSalaryTable();
    updateDashboardStats();
    
    systemState.editingMode.salaries = false;
    document.getElementById('salaryUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
    
    const newId = generateNewId('salary');
    document.getElementById('salaryId').value = newId;
}

function deleteSalary() {
    const id = parseInt(document.getElementById('salaryId').value);
    
    if (!id) {
        alert('Please enter Salary ID to delete!');
        return;
    }
    
    if (confirm(`Do you want to delete Salary ID = ${id}?`)) {
        const data = getData();
        const salaryIndex = data.salaries.findIndex(s => s.id === id);
        
        if (salaryIndex === -1) {
            alert('Salary ID not found!');
            return;
        }
        
        data.salaries.splice(salaryIndex, 1);
        saveData(data);
        
        alert('Salary deleted successfully!');
        clearSalaryForm();
        loadSalaryTable();
        updateDashboardStats();
        
        const newId = generateNewId('salary');
        document.getElementById('salaryId').value = newId;
    }
}

function searchSalaries() {
    const id = document.getElementById('searchSalaryId').value.trim();
    const data = getData();
    
    let filtered = data.salaries;
    
    if (id) {
        const searchId = parseInt(id);
        if (!isNaN(searchId)) {
            filtered = filtered.filter(s => s.id === searchId);
        }
    }
    
    displaySalaryTable(filtered);
}

function loadSalaryTable() {
    const data = getData();
    displaySalaryTable(data.salaries);
}

function displaySalaryTable(salaries) {
    const tbody = document.querySelector('#salaryTable tbody');
    tbody.innerHTML = '';
    
    salaries.forEach(salary => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${salary.id}</td>
            <td>${salary.employeeId}</td>
            <td>${salary.employeeName}</td>
            <td>$${salary.salaryAmount.toFixed(2)}</td>
            <td>$${salary.bonus.toFixed(2)}</td>
            <td>$${salary.netSalary.toFixed(2)}</td>
            <td>${new Date(salary.salaryDate).toLocaleDateString()}</td>
            <td>
                <button class="action-btn select" onclick="selectSalary(${salary.id})">
                    <i class="fas fa-check"></i> Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function selectSalary(id) {
    const data = getData();
    const salary = data.salaries.find(s => s.id === id);
    
    if (salary) {
        document.getElementById('salaryId').value = salary.id;
        document.getElementById('salaryEmployeeId').value = salary.employeeId;
        document.getElementById('salaryEmployeeName').value = salary.employeeName;
        document.getElementById('salaryAmount').value = salary.salaryAmount;
        document.getElementById('salaryBonus').value = salary.bonus;
        document.getElementById('salaryNet').value = salary.netSalary;
        document.getElementById('salaryDate').value = salary.salaryDate;
        
        if (systemState.editingMode.salaries) {
            systemState.editingMode.salaries = false;
            document.getElementById('salaryUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
    }
}

function clearSalaryForm() {
    document.getElementById('salaryEmployeeId').value = '';
    document.getElementById('salaryEmployeeName').value = '';
    document.getElementById('salaryAmount').value = '';
    document.getElementById('salaryBonus').value = '';
    document.getElementById('salaryNet').value = '';
    document.getElementById('salaryDate').valueAsDate = new Date();
}

// Supplier Management
function initializeSupplierSection() {
    const newId = generateNewId('supplier');
    document.getElementById('supplierId').value = newId;
    
    loadSupplierTable();
    setupSupplierEvents();
}

function setupSupplierEvents() {
    document.getElementById('supplierSave').addEventListener('click', saveSupplier);
    document.getElementById('supplierUpdate').addEventListener('click', () => {
        if (!systemState.editingMode.suppliers) {
            editSupplier();
        } else {
            updateSupplier();
        }
    });
    document.getElementById('supplierDelete').addEventListener('click', deleteSupplier);
    document.getElementById('supplierClear').addEventListener('click', () => {
        clearSupplierForm();
        const newId = generateNewId('supplier');
        document.getElementById('supplierId').value = newId;
    });
    document.getElementById('supplierSearch').addEventListener('click', searchSuppliers);
    document.getElementById('supplierRefresh').addEventListener('click', () => {
        loadSupplierTable();
        clearSupplierForm();
        const newId = generateNewId('supplier');
        document.getElementById('supplierId').value = newId;
    });
    document.getElementById('supplierReport').addEventListener('click', () => {
        showReportModal('suppliers');
    });
}

function saveSupplier() {
    const id = parseInt(document.getElementById('supplierId').value);
    const name = document.getElementById('supplierName').value.trim();
    const phone = document.getElementById('supplierPhone').value.trim();
    const address = document.getElementById('supplierAddress').value.trim();
    
    // Validation
    if (!name || !phone || !address) {
        alert('Please fill all required fields!');
        return;
    }
    
    // Validate phone (allow numbers, +, -)
    if (!/^[\d+\-\s]+$/.test(phone)) {
        alert('Phone must contain only numbers, +, or -!');
        return;
    }
    
    const data = getData();
    
    // Check if supplier ID already exists
    if (data.suppliers.some(s => s.id === id)) {
        alert('Supplier ID already exists!');
        return;
    }
    
    // Add new supplier
    const supplier = {
        id: id,
        name: name,
        phone: phone,
        address: address,
        createdDate: new Date().toISOString()
    };
    
    data.suppliers.push(supplier);
    saveData(data);
    
    alert('Supplier saved successfully!');
    clearSupplierForm();
    loadSupplierTable();
    updateDashboardStats();
    
    const newId = generateNewId('supplier');
    document.getElementById('supplierId').value = newId;
}

function editSupplier() {
    const id = parseInt(document.getElementById('supplierId').value);
    
    if (!id) {
        alert('Please enter Supplier ID to edit!');
        return;
    }
    
    const data = getData();
    const supplier = data.suppliers.find(s => s.id === id);
    
    if (!supplier) {
        alert('Supplier ID not found!');
        return;
    }
    
    if (confirm(`Do you want to edit Supplier ID = ${id}?`)) {
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierPhone').value = supplier.phone;
        document.getElementById('supplierAddress').value = supplier.address;
        
        systemState.editingMode.suppliers = true;
        document.getElementById('supplierUpdate').innerHTML = '<i class="fas fa-save"></i> Save Edit';
    }
}

function updateSupplier() {
    const id = parseInt(document.getElementById('supplierId').value);
    const name = document.getElementById('supplierName').value.trim();
    const phone = document.getElementById('supplierPhone').value.trim();
    const address = document.getElementById('supplierAddress').value.trim();
    
    // Validation
    if (!name || !phone || !address) {
        alert('Please fill all required fields!');
        return;
    }
    
    const data = getData();
    const index = data.suppliers.findIndex(s => s.id === id);
    
    if (index === -1) {
        alert('Supplier not found!');
        return;
    }
    
    // Update supplier
    data.suppliers[index] = {
        ...data.suppliers[index],
        name: name,
        phone: phone,
        address: address
    };
    
    saveData(data);
    
    alert('Supplier updated successfully!');
    clearSupplierForm();
    loadSupplierTable();
    updateDashboardStats();
    
    systemState.editingMode.suppliers = false;
    document.getElementById('supplierUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
    
    const newId = generateNewId('supplier');
    document.getElementById('supplierId').value = newId;
}

function deleteSupplier() {
    const id = parseInt(document.getElementById('supplierId').value);
    
    if (!id) {
        alert('Please enter Supplier ID to delete!');
        return;
    }
    
    if (confirm(`Do you want to delete Supplier ID = ${id}?`)) {
        const data = getData();
        const index = data.suppliers.findIndex(s => s.id === id);
        
        if (index === -1) {
            alert('Supplier ID not found!');
            return;
        }
        
        // Check if supplier has products
        const hasProducts = data.products.some(p => p.supplierId === id);
        if (hasProducts) {
            alert('Cannot delete supplier with existing products!');
            return;
        }
        
        data.suppliers.splice(index, 1);
        saveData(data);
        
        alert('Supplier deleted successfully!');
        clearSupplierForm();
        loadSupplierTable();
        updateDashboardStats();
        
        const newId = generateNewId('supplier');
        document.getElementById('supplierId').value = newId;
    }
}

function searchSuppliers() {
    const name = document.getElementById('searchSupplierName').value.trim();
    const phone = document.getElementById('searchSupplierPhone').value.trim();
    const data = getData();
    
    let filtered = data.suppliers;
    
    if (name) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    if (phone) {
        filtered = filtered.filter(s => s.phone.includes(phone));
    }
    
    displaySupplierTable(filtered);
}

function loadSupplierTable() {
    const data = getData();
    displaySupplierTable(data.suppliers);
}

function displaySupplierTable(suppliers) {
    const tbody = document.querySelector('#supplierTable tbody');
    tbody.innerHTML = '';
    
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.id}</td>
            <td>${supplier.name}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.address}</td>
            <td>
                <button class="action-btn select" onclick="selectSupplier(${supplier.id})">
                    <i class="fas fa-check"></i> Select
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function selectSupplier(id) {
    const data = getData();
    const supplier = data.suppliers.find(s => s.id === id);
    
    if (supplier) {
        document.getElementById('supplierId').value = supplier.id;
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierPhone').value = supplier.phone;
        document.getElementById('supplierAddress').value = supplier.address;
        
        if (systemState.editingMode.suppliers) {
            systemState.editingMode.suppliers = false;
            document.getElementById('supplierUpdate').innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
    }
}

function clearSupplierForm() {
    document.getElementById('supplierName').value = '';
    document.getElementById('supplierPhone').value = '';
    document.getElementById('supplierAddress').value = '';
}

// Report System
function showReportModal(type) {
    systemState.currentReportType = type;
    const modal = document.getElementById('reportModal');
    modal.classList.add('active');
    
    // Setup report options
    setupReportOptions();
    
    // Preview initial report
    previewReport();
}

function setupReportOptions() {
    const reportTypeInputs = document.querySelectorAll('input[name="reportType"]');
    const reportIdInput = document.getElementById('reportId');
    const dateInputs = document.querySelectorAll('#reportDateFrom, #reportDateTo');
    
    reportTypeInputs.forEach(input => {
        input.addEventListener('change', () => {
            const type = document.querySelector('input[name="reportType"]:checked').value;
            
            // Enable/disable inputs based on selection
            reportIdInput.disabled = type !== 'id';
            dateInputs.forEach(dateInput => {
                dateInput.disabled = type !== 'date';
            });
            
            // Set default dates for date range
            if (type === 'date') {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                
                document.getElementById('reportDateFrom').valueAsDate = firstDay;
                document.getElementById('reportDateTo').valueAsDate = today;
            }
            
            // Update preview
            previewReport();
        });
    });
    
    // Add change listeners to filters
    reportIdInput.addEventListener('input', previewReport);
    dateInputs.forEach(input => {
        input.addEventListener('change', previewReport);
    });
    
    // Setup modal close
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('reportModal').classList.remove('active');
    });
    
    // Setup PDF generation
    document.getElementById('generatePdf').addEventListener('click', generatePdf);
    
    // Setup print
    document.getElementById('printReport').addEventListener('click', printReport);
}

function previewReport() {
    const type = document.querySelector('input[name="reportType"]:checked').value;
    const reportType = systemState.currentReportType;
    const data = getData();
    let reportData = [];
    
    switch(reportType) {
        case 'customers':
            reportData = data.customers;
            break;
        case 'employees':
            reportData = data.employees;
            break;
        case 'products':
            reportData = data.products;
            break;
        case 'orders':
            reportData = data.orders;
            break;
        case 'payments':
            reportData = data.payments;
            break;
        case 'salaries':
            reportData = data.salaries;
            break;
        case 'suppliers':
            reportData = data.suppliers;
            break;
    }
    
    // Apply filters
    if (type === 'id') {
        const id = parseInt(document.getElementById('reportId').value);
        if (!isNaN(id)) {
            reportData = reportData.filter(item => item.id === id);
        }
    } else if (type === 'date') {
        const from = new Date(document.getElementById('reportDateFrom').value);
        const to = new Date(document.getElementById('reportDateTo').value);
        
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            const dateField = getDateFieldForReportType(reportType);
            reportData = reportData.filter(item => {
                const itemDate = new Date(item[dateField] || item.createdDate);
                return itemDate >= from && itemDate <= to;
            });
        }
    }
    
    // Generate report preview
    const preview = document.getElementById('reportPreview');
    preview.innerHTML = generateReportHTML(reportType, reportData);
}

function getDateFieldForReportType(type) {
    switch(type) {
        case 'orders': return 'orderDate';
        case 'payments': return 'paymentDate';
        case 'salaries': return 'salaryDate';
        default: return 'createdDate';
    }
}

function generateReportHTML(type, data) {
    const reportTitle = getReportTitle(type);
    const columns = getReportColumns(type);
    const total = calculateReportTotal(type, data);
    
    let html = `
        <div class="report-header">
            <h2>Qorraxmaal Solar Energy</h2>
            <p>${reportTitle} Report</p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
            <p>Total Records: ${data.length}</p>
            ${total ? `<p>Total Amount: $${total.toFixed(2)}</p>` : ''}
        </div>
    `;
    
    if (data.length > 0) {
        html += `
            <table class="report-table">
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${col.label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            ${columns.map(col => `<td>${formatReportValue(item[col.field], col.type)}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        html += '<p style="text-align: center; color: #666; padding: 40px;">No records found for the selected criteria.</p>';
    }
    
    html += `
        <div class="report-footer">
            <p>Thank you for using Qorraxmaal Solar Energy Management System</p>
            <p>063-7848443 || 063-4253382</p>
        </div>
    `;
    
    return html;
}

function getReportTitle(type) {
    const titles = {
        'customers': 'Customer',
        'employees': 'Employee',
        'products': 'Product',
        'orders': 'Order',
        'payments': 'Payment',
        'salaries': 'Salary',
        'suppliers': 'Supplier'
    };
    return titles[type] || type;
}

function getReportColumns(type) {
    const columns = {
        'customers': [
            { label: 'ID', field: 'id', type: 'number' },
            { label: 'Name', field: 'name', type: 'string' },
            { label: 'Phone', field: 'phone', type: 'string' },
            { label: 'Address', field: 'address', type: 'string' },
            { label: 'Created Date', field: 'createdDate', type: 'date' }
        ],
        'employees': [
            { label: 'ID', field: 'id', type: 'number' },
            { label: 'Name', field: 'name', type: 'string' },
            { label: 'Salary', field: 'salary', type: 'currency' },
            { label: 'Shift', field: 'shift', type: 'string' },
            { label: 'Phone', field: 'phone', type: 'string' },
            { label: 'Address', field: 'address', type: 'string' }
        ],
        'products': [
            { label: 'ID', field: 'id', type: 'number' },
            { label: 'Supplier ID', field: 'supplierId', type: 'number' },
            { label: 'Name', field: 'name', type: 'string' },
            { label: 'Price', field: 'price', type: 'currency' },
            { label: 'Quantity', field: 'quantity', type: 'number' }
        ],
        'orders': [
            { label: 'ID', field: 'id', type: 'number' },
            { label: 'Product', field: 'productName', type: 'string' },
            { label: 'Customer', field: 'customerName', type: 'string' },
            { label: 'Quantity', field: 'quantity', type: 'number' },
            { label: 'Unit Price', field: 'unitPrice', type: 'currency' },
            { label: 'Total', field: 'totalAmount', type: 'currency' },
            { label: 'Date', field: 'orderDate', type: 'date' }
        ],
        'payments': [
            { label: 'ID', field: 'id', type: 'number' },
            { label: 'Order ID', field: 'orderId', type: 'number' },
            { label: 'Customer', field: 'customerName', type: 'string' },
            { label: 'Total', field: 'total', type: 'currency' },
            { label: 'Discount', field: 'discount', type: 'currency' },
            { label: 'Net Amount', field: 'netAmount', type: 'currency' },
            { label: 'Method', field: 'method', type: 'string' },
            { label: 'Date', field: 'paymentDate', type: 'date' }
        ],
        'salaries': [
            { label: 'ID', field: 'id', type: 'number' },
            { label: 'Employee ID', field: 'employeeId', type: 'number' },
            { label: 'Employee Name', field: 'employeeName', type: 'string' },
            { label: 'Salary', field: 'salaryAmount', type: 'currency' },
            { label: 'Bonus', field: 'bonus', type: 'currency' },
            { label: 'Net Salary', field: 'netSalary', type: 'currency' },
            { label: 'Date', field: 'salaryDate', type: 'date' }
        ],
        'suppliers': [
            { label: 'ID', field: 'id', type: 'number' },
            { label: 'Name', field: 'name', type: 'string' },
            { label: 'Phone', field: 'phone', type: 'string' },
            { label: 'Address', field: 'address', type: 'string' }
        ]
    };
    return columns[type] || [];
}

function formatReportValue(value, type) {
    if (value === undefined || value === null) return '';
    
    switch(type) {
        case 'currency':
            return `$${parseFloat(value).toFixed(2)}`;
        case 'date':
            return new Date(value).toLocaleDateString();
        case 'number':
            return parseFloat(value);
        default:
            return value;
    }
}

function calculateReportTotal(type, data) {
    switch(type) {
        case 'orders':
            return data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
        case 'payments':
            return data.reduce((sum, item) => sum + (item.netAmount || 0), 0);
        case 'salaries':
            return data.reduce((sum, item) => sum + (item.netSalary || 0), 0);
        default:
            return 0;
    }
}

function generatePdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Qorraxmaal Solar Energy', 105, 15, null, null, 'center');
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const reportTitle = getReportTitle(systemState.currentReportType);
    doc.text(`${reportTitle} Report`, 105, 25, null, null, 'center');
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 35, null, null, 'center');
    
    // Get data for the report
    const type = document.querySelector('input[name="reportType"]:checked').value;
    const reportType = systemState.currentReportType;
    const data = getData();
    let reportData = [];
    
    switch(reportType) {
        case 'customers': reportData = data.customers; break;
        case 'employees': reportData = data.employees; break;
        case 'products': reportData = data.products; break;
        case 'orders': reportData = data.orders; break;
        case 'payments': reportData = data.payments; break;
        case 'salaries': reportData = data.salaries; break;
        case 'suppliers': reportData = data.suppliers; break;
    }
    
    // Apply filters
    if (type === 'id') {
        const id = parseInt(document.getElementById('reportId').value);
        if (!isNaN(id)) {
            reportData = reportData.filter(item => item.id === id);
        }
    } else if (type === 'date') {
        const from = new Date(document.getElementById('reportDateFrom').value);
        const to = new Date(document.getElementById('reportDateTo').value);
        
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            const dateField = getDateFieldForReportType(reportType);
            reportData = reportData.filter(item => {
                const itemDate = new Date(item[dateField] || item.createdDate);
                return itemDate >= from && itemDate <= to;
            });
        }
    }
    
    // Create table
    const columns = getReportColumns(reportType);
    const rows = reportData.map(item => 
        columns.map(col => formatReportValue(item[col.field], col.type))
    );
    
    // Add table to PDF
    doc.autoTable({
        head: [columns.map(col => col.label)],
        body: rows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' }
        }
    });
    
    // Add total
    const total = calculateReportTotal(reportType, reportData);
    if (total > 0) {
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total: $${total.toFixed(2)}`, 105, finalY, null, null, 'center');
    }
    
    // Add footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for using Qorraxmaal Solar Energy Management System', 105, finalY, null, null, 'center');
    doc.text('063-7848443 || 063-4253382', 105, finalY + 5, null, null, 'center');
    
    // Save PDF
    doc.save(`Qorraxmaal_${reportTitle}_Report_${new Date().toISOString().slice(0,10)}.pdf`);
}

function printReport() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Qorraxmaal Solar Energy Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .report-header h2 { color: #2c3e50; margin-bottom: 5px; }
                .report-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .report-table th { background: #2c3e50; color: white; padding: 10px; text-align: left; }
                .report-table td { padding: 10px; border-bottom: 1px solid #ddd; }
                .report-footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; text-align: center; color: #666; }
                @media print {
                    body { margin: 0; padding: 20px; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            ${document.getElementById('reportPreview').innerHTML}
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()">Print Report</button>
                <button onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Setup login system
    setupLogin();
    
    // Setup navigation
    setupNavigation();
    
    // Load any saved credentials
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe === 'true') {
        document.getElementById('username').value = localStorage.getItem('savedUsername') || '';
        document.getElementById('password').value = localStorage.getItem('savedPassword') || '';
        document.getElementById('rememberMe').checked = true;
    }
    
    // Setup remember me
    document.getElementById('rememberMe').addEventListener('change', function() {
        if (this.checked) {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            localStorage.setItem('savedUsername', username);
            localStorage.setItem('savedPassword', password);
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('savedUsername');
            localStorage.removeItem('savedPassword');
            localStorage.removeItem('rememberMe');
        }
    });
});