/* === [1. Chart Initializations] === */
// We place this inside window.onload so it runs after all HTML is loaded.

window.onload = function() {
    
    // a) Initialize Registration Trend (Line Chart)
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Mar 19', 'Mar 22', 'Mar 25', 'Mar 28', 'Mar 30', 'Sat'],
            datasets: [{
                label: 'Signups',
                data: [0, 800, 2700, 1300, 2500, 3100],
                borderColor: '#6366f1', // Indigo (accent color)
                borderWidth: 3,
                tension: 0.4, // Smooth curve (like reference)
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.05)', // Transparent indigo fill
                pointRadius: 0 // Hide points until hover (like reference)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { display: false } }, // Matches reference style
                x: { grid: { display: false } }
            }
        }
    });

    // b) Initialize Registration Donut Chart
    const regCtx = document.getElementById('regDonutChart').getContext('2d');
    new Chart(regCtx, {
        type: 'doughnut',
        data: {
            labels: ['Sold (82%)', 'Available (18%)'],
            datasets: [{
                data: [11480, 2520],
                backgroundColor: ['#6366f1', '#10b981'], // Indigo, Green (like reference)
                borderWidth: 0,
                cutout: '75%' // Makes it look professional
            }]
        },
        options: {
            plugins: {
                legend: { position: 'right' } // Put labels on the side
            }
        }
    });

    // c) Initialize Attendance Donut Chart (Matches Reference)
    const attendCtx = document.getElementById('attendanceChart').getContext('2d');
    new Chart(attendCtx, {
        type: 'doughnut',
        data: {
            labels: ['Checked-in (60%)', 'Remaining (40%)'],
            datasets: [{
                data: [960, 540],
                backgroundColor: ['#10b981', '#f59e0b'], // Green, Yellow
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
};


/* === [2. Navigation / SPA Logic] === */

// This function hides the current visible "page" and shows the selected one.
function showSection(sectionId, element) {
    // 1. Hide all pages
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(p => p.classList.remove('active'));

    // 2. Remove "active" style from all navigation links
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => link.classList.remove('active'));

    // 3. Show the selected page
    document.getElementById(sectionId).classList.add('active');

    // 4. Highlight the clicked nav item
    element.classList.add('active');
}

/* === [Registration Management Logic] === */

const registrationData = {
    'TechFest': [
        { name: "Arjun Mehta", dept: "Computer Science", id: "CS102", status: "Confirmed" },
        { name: "Priya Sharma", dept: "Information Technology", id: "IT405", status: "Confirmed" },
        { name: "Rahul Verma", dept: "Electronics", id: "EC098", status: "Pending" }
    ],
    'Hackathon': [
        { name: "Amit Patel", dept: "AI & ML", id: "AI221", status: "Confirmed" },
        { name: "Sanya Gupta", dept: "Computer Science", id: "CS554", status: "Confirmed" }
    ],
    'Cultural': [
        { name: "Ishaan Singh", dept: "Mechanical", id: "ME771", status: "Confirmed" },
        { name: "Ananya Iyer", dept: "Civil Engineering", id: "CE102", status: "Pending" }
    ]
};

// Function to populate table based on event
function filterRegistrations(eventKey, btnElement) {
    // Update Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    // Update Title
    document.getElementById('currentEventTitle').innerText = `${eventKey} Participants`;

    // Render Table
    const tbody = document.getElementById('registrationBody');
    const students = registrationData[eventKey];

    tbody.innerHTML = students.map(s => `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.dept}</td>
            <td><code>${s.id}</code></td>
            <td><span class="status-badge ${s.status === 'Confirmed' ? 'status-confirmed' : 'status-pending'}">${s.status}</span></td>
            <td>
                <button class="btn-icon"><i class="fas fa-edit"></i></button>
                <button class="btn-icon"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Search Functionality
function searchTable() {
    const input = document.getElementById('tableSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#registrationBody tr');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}

// Load default event on start
// Note: Add this to your existing window.onload
const existingOnload = window.onload;
window.onload = function() {
    if (existingOnload) existingOnload();
    // Default call to load TechFest data
    const defaultBtn = document.querySelector('.tab-btn');
    if(defaultBtn) filterRegistrations('TechFest', defaultBtn);
};

/* === [Budget & Expense Logic] === */

// 1. Data Store
const budgetData = {
    'TechFest': { total: 10000, expenses: [] },
    'Hackathon': { total: 5000, expenses: [] },
    'Cultural': { total: 15000, expenses: [] }
};

let categoryChart; // Variable to hold the chart instance

// 2. Switch Event
function switchEventBudget() {
    const selectedEvent = document.getElementById('eventSelector').value;
    updateBudgetUI(selectedEvent);
}

// 3. Add Expense
function addNewExpense() {
    const eventKey = document.getElementById('eventSelector').value;
    const cat = document.getElementById('expCategory').value;
    const note = document.getElementById('expNote').value;
    const amt = parseFloat(document.getElementById('expAmount').value);

    if (!note || isNaN(amt)) return alert("Please enter valid details");

    budgetData[eventKey].expenses.push({ category: cat, note: note, amount: amt });
    
    // Clear inputs
    document.getElementById('expNote').value = '';
    document.getElementById('expAmount').value = '';
    
    updateBudgetUI(eventKey);
}

// 4. Update UI & Charts
function updateBudgetUI(eventKey) {
    const data = budgetData[eventKey];
    const spent = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = data.total - spent;

    // Update Top Cards
    document.getElementById('totalAllocated').innerText = `₹${data.total.toLocaleString()}`;
    document.getElementById('totalSpent').innerText = `₹${spent.toLocaleString()}`;
    document.getElementById('remainingAmount').innerText = `₹${remaining.toLocaleString()}`;

    // Update History List
    const historyList = document.getElementById('expenseHistory');
    historyList.innerHTML = data.expenses.slice().reverse().map(e => `
        <li class="history-item">
            <div class="history-info">
                <h5>${e.note}</h5>
                <small>${e.category}</small>
            </div>
            <div class="history-amount">-₹${e.amount}</div>
        </li>
    `).join('');

    // Update Category Chart
    updateCategoryChart(data.expenses);
}

function updateCategoryChart(expenses) {
    const categories = ["Food", "Venue", "Marketing", "Sound", "Misc"];
    const totals = categories.map(cat => 
        expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    );

    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (categoryChart) categoryChart.destroy(); // Remove old chart before drawing new one

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Spending by Category (₹)',
                data: totals,
                backgroundColor: ['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#94a3b8'],
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal Bar Chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// Add this to your window.onload in script.js
// updateBudgetUI('TechFest');

/* === [Enhanced Task Logic] === */

const taskData = {
    'TechFest': [
        { name: "Book the Main Auditorium", priority: "High", date: "2025-05-25", completed: true },
        { name: "Arrange Catering Services", priority: "Medium", date: "2025-05-28", completed: false }
    ],
    'Hackathon': [
        { name: "Setup Hackathon Portal", priority: "High", date: "2025-05-20", completed: true }
    ]
};

function switchEventTasks() {
    const selected = document.getElementById('taskEventSelector').value;
    renderTasks(selected);
}

function addNewTask() {
    const eventKey = document.getElementById('taskEventSelector').value;
    const name = document.getElementById('taskInput').value;
    const priority = document.getElementById('taskPriority').value;
    const date = document.getElementById('taskDate').value;

    if (!name || !date) return alert("Fill in task name and date");

    taskData[eventKey].push({ name, priority, date, completed: false });
    renderTasks(eventKey);
    document.getElementById('taskInput').value = '';
}

function renderTasks(eventKey) {
    const tasks = taskData[eventKey];
    const tbody = document.getElementById('taskTableBody');
    
    tbody.innerHTML = tasks.map((t, i) => `
        <tr>
            <td>${i + 1}</td>
            <td style="font-weight:600">${t.name}</td>
            <td><span class="priority-badge p-${t.priority}">${t.priority}</span></td>
            <td><i class="far fa-calendar-alt"></i> ${t.date}</td>
            <td>
                <input type="checkbox" class="check-box" ${t.completed ? 'checked' : ''} onchange="toggleTask('${eventKey}', ${i})">
                <span class="status-badge ${t.completed ? 'status-confirmed' : 'status-pending'}">${t.completed ? 'Completed' : 'Pending'}</span>
            </td>
            <td><button class="btn-icon" onclick="deleteTask('${eventKey}', ${i})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');

    updateProgress(tasks);
}

function updateProgress(tasks) {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    // Update Circular Chart
    const circle = document.getElementById('circleFill');
    circle.setAttribute('stroke-dasharray', `${percent}, 100`);
    
    document.getElementById('taskPercentText').innerText = percent + '%';
    document.getElementById('progressFraction').innerText = `${done} / ${total}`;
    document.getElementById('totalTaskCount').innerText = `Total Tasks: ${total}`;
}

function toggleTask(key, i) {
    taskData[key][i].completed = !taskData[key][i].completed;
    renderTasks(key);
}

function deleteTask(key, i) {
    taskData[key].splice(i, 1);
    renderTasks(key);
}

// Ensure this is called in your main window.onload
// renderTasks('TechFest');

/* === [BUG-FREE SCHEDULE LOGIC] === */

// Initial Data
const scheduleData = {
    'TechFest': [
        { title: "Opening Ceremony", start: "10:00", end: "10:30", loc: "Main Auditorium" },
        { title: "Guest Speech", start: "10:30", end: "11:15", loc: "Main Auditorium" }
    ],
    'Hackathon': [
        { title: "Orientation", start: "09:00", end: "10:00", loc: "Lab 1" }
    ]
};

// Function to switch between events
function switchSchedule() {
    const selectedEvent = document.getElementById('schedEventSelector').value;
    renderSchedule(selectedEvent);
}

// Function to add new item
function addScheduleItem() {
    const eventKey = document.getElementById('schedEventSelector').value;
    const title = document.getElementById('schedTitle').value;
    const start = document.getElementById('schedStart').value;
    const end = document.getElementById('schedEnd').value;
    const loc = document.getElementById('schedLoc').value || "Main Hall";

    // 1. Validation: Prevent adding empty items
    if (!title || !start || !end) {
        alert("Please provide a title, start time, and end time.");
        return;
    }

    // 2. Add to data object
    if (!scheduleData[eventKey]) scheduleData[eventKey] = [];
    scheduleData[eventKey].push({ title, start, end, loc });

    // 3. Auto-Sort items by start time
    scheduleData[eventKey].sort((a, b) => a.start.localeCompare(b.start));

    // 4. Clear the inputs
    document.getElementById('schedTitle').value = '';
    document.getElementById('schedStart').value = '';
    document.getElementById('schedEnd').value = '';
    document.getElementById('schedLoc').value = '';

    // 5. Refresh UI
    renderSchedule(eventKey);
}

// Function to render Table and Timeline
function renderSchedule(eventKey) {
    const items = scheduleData[eventKey] || [];
    const tableBody = document.getElementById('schedTableBody');
    const timelineView = document.getElementById('timelineView');
    const activityCount = document.getElementById('totalActivities');

    // Update Activity Count
    if(activityCount) activityCount.innerText = `Total Activities: ${items.length}`;

    // Render Table
    if(tableBody) {
        tableBody.innerHTML = items.map((item, i) => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px;">${i + 1}</td>
                <td style="padding: 12px;"><strong>${item.title}</strong><br><small style="color:#64748b">${item.loc}</small></td>
                <td style="padding: 12px;"><span class="status-badge" style="background:#e0e7ff; color:#4338ca; padding:4px 8px; border-radius:5px; font-size:0.8rem;">${formatTime(item.start)} - ${formatTime(item.end)}</span></td>
                <td style="padding: 12px;"><button class="btn-icon" onclick="deleteSchedItem('${eventKey}', ${i})"><i class="fas fa-trash" style="color:#ef4444"></i></button></td>
            </tr>
        `).join('');
    }

    // Render Timeline View
    if(timelineView) {
        timelineView.innerHTML = items.map(item => `
            <div class="timeline-v-item">
                <div class="t-time">${formatTime(item.start)}</div>
                <div class="t-dot"></div>
                <div class="t-card">
                    <div>
                        <h4 style="margin:0; font-size:1rem;">${item.title}</h4>
                        <p style="margin:2px 0 0; color:#64748b; font-size:0.85rem;">${item.loc}</p>
                    </div>
                    <div class="t-tag">${formatTime(item.start)} - ${formatTime(item.end)}</div>
                </div>
            </div>
        `).join('');
    }
}

// Helper to format time (e.g., 13:00 to 01:00 PM)
function formatTime(timeStr) {
    const [hh, mm] = timeStr.split(':');
    let h = parseInt(hh);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mm} ${ampm}`;
}

// Function to delete item
function deleteSchedItem(key, index) {
    if(confirm("Delete this activity?")) {
        scheduleData[key].splice(index, 1);
        renderSchedule(key);
    }
}

/* === [Login Logic] === */
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    // Simple validation (For presentation purposes)
    if (email === "" || pass === "") {
        alert("Please enter credentials to continue.");
        return;
    }

    // Add a nice fade-out effect
    const loginScreen = document.getElementById('login-screen');
    loginScreen.style.transition = "0.5s all ease";
    loginScreen.style.opacity = "0";
    loginScreen.style.transform = "scale(1.1)";

    setTimeout(() => {
        loginScreen.style.display = "none";
        // Initialize dashboard charts after login
        if (typeof initDashboardCharts === "function") initDashboardCharts();
    }, 500);
}

// Initial state: ensure dashboard is ready but hidden behind login
document.addEventListener('DOMContentLoaded', () => {
    // You can pre-load your dashboard logic here if needed
});