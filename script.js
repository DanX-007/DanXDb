// Konfigurasi GitHub (ganti dengan data Anda)

const GITHUB_CONFIG = {
    ACCESS_KEY: "DanXxSgm", // Kunci akses untuk masuk ke aplikasi
    REPO_OWNER: "DaniBotJs", // Ganti dengan username GitHub Anda
    REPO_NAME: "Auth", // Ganti dengan nama repository
    FILE_PATH: "Auth.json", // Path ke file JSON di repo
    TOKEN: "-" // Token GitHub Anda (HARUS diganti)
};

// DOM Elements
const authSection = document.getElementById('authSection');
const crudSection = document.getElementById('crudSection');
const accessKeyInput = document.getElementById('accessKey');
const loginBtn = document.getElementById('loginBtn');

// Tab Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const addTab = document.getElementById('addTab');
const editTab = document.getElementById('editTab');
const deleteTab = document.getElementById('deleteTab');
const viewTab = document.getElementById('viewTab');

// Add Data Elements
const idInput = document.getElementById('id');
const ipInput = document.getElementById('ip');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const accessInput = document.getElementById('access');
const bannedInput = document.getElementById('banned');
const bannedReasonInput = document.getElementById('bannedReason');
const addBtn = document.getElementById('addBtn');

// Edit Data Elements
const editIdInput = document.getElementById('editId');
const findBtn = document.getElementById('findBtn');
const editForm = document.getElementById('editForm');
const editIpInput = document.getElementById('editIp');
const editUsernameInput = document.getElementById('editUsername');
const editPasswordInput = document.getElementById('editPassword');
const editAccessInput = document.getElementById('editAccess');
const editBannedInput = document.getElementById('editBanned');
const editBannedReasonInput = document.getElementById('editBannedReason');
const updateBtn = document.getElementById('updateBtn');

// Delete Data Elements
const deleteIdInput = document.getElementById('deleteId');
const deletePreview = document.getElementById('deletePreview');
const deleteDataPreview = document.getElementById('deleteDataPreview');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// View Data Elements
const refreshBtn = document.getElementById('refreshBtn');
const dataTableBody = document.getElementById('dataTableBody');

// Notification Area
const notificationArea = document.getElementById('notificationArea');

// Data
let jsonData = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
loginBtn.addEventListener('click', handleLogin);
tabs.forEach(tab => tab.addEventListener('click', handleTabSwitch));
addBtn.addEventListener('click', addData);
findBtn.addEventListener('click', findData);
updateBtn.addEventListener('click', updateData);
confirmDeleteBtn.addEventListener('click', deleteData);
refreshBtn.addEventListener('click', loadData);
accessKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

// Initialize Application
function initApp() {
    showNotification('warning', 'Harap masukkan kunci akses untuk melanjutkan');
}

// Handle Login
function handleLogin() {
    const accessKey = accessKeyInput.value.trim();
    
    if (!accessKey) {
        showNotification('error', 'Kunci akses tidak boleh kosong');
        return;
    }
    
    if (accessKey === GITHUB_CONFIG.ACCESS_KEY) {
        authSection.classList.add('hidden');
        crudSection.classList.remove('hidden');
        loadData();
        showNotification('success', 'Berhasil masuk!');
    } else {
        showNotification('error', 'Kunci akses salah');
    }
}

// Handle Tab Switch
function handleTabSwitch(e) {
    const tabId = e.target.dataset.tab;
    
    // Update active tab
    tabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');
    
    // Show corresponding content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabId}Tab`).classList.add('active');
    
    // Clear notifications
    notificationArea.innerHTML = '';
    
    // Load data for view tab
    if (tabId === 'view') {
        loadData();
    }
}

// Show Notification
function showNotification(type, message) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="${icons[type]} notification-icon"></i>
        <div>${message}</div>
    `;
    
    notificationArea.innerHTML = '';
    notificationArea.appendChild(notification);
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Load Data from GitHub
async function loadData() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${GITHUB_CONFIG.FILE_PATH}`,
            {
                headers: {
                    'Authorization': `Bearer ${GITHUB_CONFIG.TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data = await response.json();
        const content = atob(data.content);
        jsonData = JSON.parse(content);
        
        renderDataTable();
        showNotification('success', 'Data berhasil dimuat');
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('error', `Gagal memuat data: ${error.message}`);
    }
}

// Render Data Table
function renderDataTable() {
    dataTableBody.innerHTML = '';
    
    if (jsonData.length === 0) {
        dataTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    Tidak ada data yang tersedia
                </td>
            </tr>
        `;
        return;
    }
    
    jsonData.forEach(item => {
        const row = document.createElement('tr');
        
        // Apply styling classes based on data
        const bannedClass = item.BANNED === "true" ? "banned-true" : "banned-false";
        const bannedText = item.BANNED === "true" ? "Ya" : "Tidak";
        const accessClass = item.ACCESS === "admin" ? "access-admin" : "access-user";
        
        row.innerHTML = `
            <td>${item.ID}</td>
            <td>${item.IP}</td>
            <td>${item.USERNAME}</td>
            <td class="${accessClass}">${item.ACCESS}</td>
            <td class="${bannedClass}">${bannedText}</td>
            <td class="action-cell">
                <button class="btn btn-warning edit-btn" data-id="${item.ID}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger delete-btn" data-id="${item.ID}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        dataTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            handleEditAction(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            handleDeleteAction(id);
        });
    });
}

// Handle Edit Action from Table
function handleEditAction(id) {
    // Switch to edit tab
    tabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector('.tab[data-tab="edit"]').classList.add('active');
    
    tabContents.forEach(content => content.classList.remove('active'));
    editTab.classList.add('active');
    
    // Fill the edit ID field and trigger search
    editIdInput.value = id;
    findData();
}

// Handle Delete Action from Table
function handleDeleteAction(id) {
    // Switch to delete tab
    tabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector('.tab[data-tab="delete"]').classList.add('active');
    
    tabContents.forEach(content => content.classList.remove('active'));
    deleteTab.classList.add('active');
    
    // Fill the delete ID field and trigger preview
    deleteIdInput.value = id;
    const item = jsonData.find(item => item.ID === id);
    
    if (item) {
        deleteDataPreview.innerHTML = `
            <pre>${JSON.stringify(item, null, 2)}</pre>
        `;
        deletePreview.classList.remove('hidden');
    } else {
        showNotification('error', 'Data tidak ditemukan');
        deletePreview.classList.add('hidden');
    }
}

// Add New Data
async function addData() {
    // Get input values
    const id = idInput.value.trim();
    const ip = ipInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const access = accessInput.value;
    const banned = bannedInput.value;
    const bannedReason = bannedReasonInput.value.trim();
    
    // Validate input
    if (!id || !ip || !username || !password) {
        showNotification('error', 'Semua field harus diisi');
        return;
    }
    
    // Check if ID already exists
    if (jsonData.some(item => item.ID === id)) {
        showNotification('error', 'ID sudah digunakan');
        return;
    }
    
    // Create new data object
    const newData = {
        ID: id,
        IP: ip,
        USERNAME: username,
        PASSWORD: password,
        ACCESS: access,
        BANNED: banned,
        BANNEDREASON: bannedReason
    };
    
    // Add to local data
    jsonData.push(newData);
    
    // Save to GitHub
    try {
        await saveDataToGitHub();
        showNotification('success', 'Data berhasil ditambahkan');
        
        // Clear form
        idInput.value = '';
        ipInput.value = '';
        usernameInput.value = '';
        passwordInput.value = '';
        bannedReasonInput.value = '';
        
        // Switch to view tab
        tabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector('.tab[data-tab="view"]').classList.add('active');
        
        tabContents.forEach(content => content.classList.remove('active'));
        viewTab.classList.add('active');
        
        // Reload data
        loadData();
    } catch (error) {
        console.error('Error adding data:', error);
        showNotification('error', `Gagal menambahkan data: ${error.message}`);
        // Remove from local data if save failed
        jsonData = jsonData.filter(item => item.ID !== id);
    }
}

// Find Data for Editing
function findData() {
    const id = editIdInput.value.trim();
    
    if (!id) {
        showNotification('error', 'ID tidak boleh kosong');
        return;
    }
    
    const item = jsonData.find(item => item.ID === id);
    
    if (item) {
        // Fill the form
        editIpInput.value = item.IP;
        editUsernameInput.value = item.USERNAME;
        editPasswordInput.value = item.PASSWORD;
        editAccessInput.value = item.ACCESS;
        editBannedInput.value = item.BANNED;
        editBannedReasonInput.value = item.BANNEDREASON;
        
        editForm.classList.remove('hidden');
        showNotification('success', 'Data ditemukan');
    } else {
        showNotification('error', 'Data tidak ditemukan');
        editForm.classList.add('hidden');
    }
}

// Update Data
async function updateData() {
    const id = editIdInput.value.trim();
    const ip = editIpInput.value.trim();
    const username = editUsernameInput.value.trim();
    const password = editPasswordInput.value.trim();
    const access = editAccessInput.value;
    const banned = editBannedInput.value;
    const bannedReason = editBannedReasonInput.value.trim();
    
    // Validate input
    if (!id || !ip || !username || !password) {
        showNotification('error', 'Semua field harus diisi');
        return;
    }
    
    // Find item index
    const itemIndex = jsonData.findIndex(item => item.ID === id);
    
    if (itemIndex === -1) {
        showNotification('error', 'Data tidak ditemukan');
        return;
    }
    
    // Update data
    jsonData[itemIndex] = {
        ...jsonData[itemIndex],
        IP: ip,
        USERNAME: username,
        PASSWORD: password,
        ACCESS: access,
        BANNED: banned,
        BANNEDREASON: bannedReason
    };
    
    // Save to GitHub
    try {
        await saveDataToGitHub();
        showNotification('success', 'Data berhasil diperbarui');
        
        // Clear form
        editIdInput.value = '';
        editIpInput.value = '';
        editUsernameInput.value = '';
        editPasswordInput.value = '';
        editBannedReasonInput.value = '';
        editForm.classList.add('hidden');
        
        // Reload data
        loadData();
    } catch (error) {
        console.error('Error updating data:', error);
        showNotification('error', `Gagal memperbarui data: ${error.message}`);
    }
}
function previewDeleteData() {
    const id = deleteIdInput.value.trim();
    
    if (!id) {
        showNotification('error', 'ID tidak boleh kosong');
        deletePreview.classList.add('hidden');
        return;
    }
    
    const item = jsonData.find(item => item.ID === id);
    
    if (item) {
        deleteDataPreview.innerHTML = `
            <pre>${JSON.stringify(item, null, 2)}</pre>
        `;
        deletePreview.classList.remove('hidden');
        
        // Scroll ke preview
        deletePreview.scrollIntoView({ behavior: 'smooth' });
    } else {
        showNotification('error', 'Data tidak ditemukan');
        deletePreview.classList.add('hidden');
    }
}
deleteIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        previewDeleteData();
    }
});
// Delete Data
async function deleteData() {
    const id = deleteIdInput.value.trim();
    
    if (!id) {
        showNotification('error', 'ID tidak boleh kosong');
        return;
    }
    
    // Confirm deletion
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        return;
    }
    
    // Remove from local data
    const initialLength = jsonData.length;
    jsonData = jsonData.filter(item => item.ID !== id);
    
    if (jsonData.length === initialLength) {
        showNotification('error', 'Data tidak ditemukan');
        return;
    }
    
    // Save to GitHub
    try {
        await saveDataToGitHub();
        showNotification('success', 'Data berhasil dihapus');
        
        // Clear form
        deleteIdInput.value = '';
        deletePreview.classList.add('hidden');
        
        // Switch to view tab
        tabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector('.tab[data-tab="view"]').classList.add('active');
        
        tabContents.forEach(content => content.classList.remove('active'));
        viewTab.classList.add('active');
        
        // Reload data
        loadData();
    } catch (error) {
        console.error('Error deleting data:', error);
        showNotification('error', `Gagal menghapus data: ${error.message}`);
    }
}

// Save Data to GitHub
async function saveDataToGitHub() {
    try {
        // Get the current file SHA to update the existing file
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${GITHUB_CONFIG.FILE_PATH}`,
            {
                headers: {
                    'Authorization': `Bearer ${GITHUB_CONFIG.TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!getResponse.ok) {
            throw new Error(`Failed to get file: ${getResponse.status}`);
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
        // Prepare the update request
        const content = JSON.stringify(jsonData, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        const updateResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${GITHUB_CONFIG.FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_CONFIG.TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update data via GitHub JSON Manager',
                    content: encodedContent,
                    sha: sha
                })
            }
        );
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`Failed to update file: ${updateResponse.status} - ${errorData.message}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error saving data to GitHub:', error);
        throw error;
    }
}
