// State
let isLoginMode = true;
const API_URL = '/api/v1';

// Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');
const toggleAuth = document.getElementById('toggle-auth');
const msgDiv = document.getElementById('message');
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const logoutBtn = document.getElementById('logout-btn');
const roleSelect = document.getElementById('role');
const userRoleBadge = document.getElementById('user-role-badge');
const adminViewBtn = document.getElementById('admin-view-btn');

// Show messages
const showMessage = (msg, isError = false) => {
    msgDiv.textContent = msg;
    msgDiv.className = isError ? 'error' : 'success';
    setTimeout(() => msgDiv.textContent = '', 3000);
};

// Toggle Login/Register
toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? 'Login' : 'Register';
    authBtn.textContent = isLoginMode ? 'Login' : 'Register';
    toggleAuth.textContent = isLoginMode ? 'Need to register? Click here' : 'Already have an account? Login';

    // Show/Hide Role dropdown
    if (isLoginMode) {
        roleSelect.classList.add('hidden');
    } else {
        roleSelect.classList.remove('hidden');
    }
});

// Check if already logged in on page load
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        userRoleBadge.textContent = role.toUpperCase();

        // Show Admin Button if role is admin
        if (role === 'admin') {
            adminViewBtn.classList.remove('hidden');
        } else {
            adminViewBtn.classList.add('hidden');
        }

        fetchTasks(); // Fetch regular tasks by default
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        userRoleBadge.textContent = '';
    }
};

// Handle Login / Register
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const bodyData = isLoginMode ? { username, password } : { username, password, role };

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || data.error);

        if (isLoginMode) {
            // Save token AND role
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            showMessage('Login successful!');
            checkAuth();
        } else {
            showMessage('Registration successful! You can now login.');
            isLoginMode = true;
            toggleAuth.click(); // Switch back to login view
        }
        authForm.reset();
    } catch (err) {
        showMessage(err.message, true);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    checkAuth();
    showMessage('Logged out successfully');
});

// Fetch My Tasks
const fetchTasks = async () => {
    try {
        const res = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        renderTasks(data, false);
    } catch (err) {
        if (err.message === 'Token is not valid') logoutBtn.click();
        showMessage(err.message, true);
    }
};

// Fetch ALL Tasks for Admin
adminViewBtn.addEventListener('click', async () => {
    try {
        const res = await fetch(`${API_URL}/tasks/all`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        showMessage('Fetched all users tasks!', false);
        renderTasks(data, true);
    } catch (err) {
        showMessage(err.message, true);
    }
});

// Render Tasks to DOM
const renderTasks = (tasks, isAdminView) => {
    taskList.innerHTML = tasks.length === 0 ? '<p>No tasks found.</p>' : '';
    tasks.forEach(task => {
        const ownerTag = isAdminView ? `<span style="color: blue; font-size:12px;">(User: ${task.owner?.username || 'Unknown'})</span>` : '';
        taskList.innerHTML += `
                <div class="task-card">
                    <div class="task-info">
                        <h4>${task.title} ${ownerTag}</h4>
                        <p>${task.description || 'No description'}</p>
                    </div>
                    ${!isAdminView ? `<button class="danger-btn" style="width: auto; padding: 5px 10px;" onclick="deleteTask('${task._id}')">Delete</button>` : ''}
                </div>
            `;
    });
};

// Add Task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;

    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, description })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error);

        showMessage('Task added!');
        taskForm.reset();
        fetchTasks();
    } catch (err) {
        showMessage(err.message, true);
    }
});

// Delete Task
window.deleteTask = async (id) => {
    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to delete task');

        showMessage('Task deleted!');
        fetchTasks();
    } catch (err) {
        showMessage(err.message, true);
    }
};

// Initialize
checkAuth();