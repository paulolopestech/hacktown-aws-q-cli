class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.currentView = 'list';
        this.currentDate = new Date();
        this.selectedDate = null;
        this.isLoading = false;
        this.userProfile = {
            username: '',
            avatar: null
        };
        this.reminders = new Map();
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.bindEvents();
        this.renderTodos();
        this.renderCalendar();
        this.addLoadingStates();
        this.loadUserProfile();
        this.startReminderChecker();
        this.createPhotoModal();
        this.setupDateValidation();
    }

    setupDateValidation() {
        const dueDateInput = document.getElementById('dueDateInput');
        const reminderInput = document.getElementById('reminderInput');
        
        // Set minimum date to today for due date
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
        
        // Set minimum datetime to now for reminder
        const now = new Date();
        const nowString = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
        reminderInput.min = nowString;
        
        // Validate reminder is before due date
        const validateDates = () => {
            const dueDate = dueDateInput.value;
            const reminderDateTime = reminderInput.value;
            
            if (dueDate && reminderDateTime) {
                const dueDateObj = new Date(dueDate + 'T23:59:59'); // End of due date
                const reminderDateObj = new Date(reminderDateTime);
                
                if (reminderDateObj >= dueDateObj) {
                    reminderInput.setCustomValidity('Reminder must be before the due date');
                    reminderInput.style.borderColor = 'var(--danger-color)';
                    return false;
                } else {
                    reminderInput.setCustomValidity('');
                    reminderInput.style.borderColor = '';
                    return true;
                }
            }
            
            reminderInput.setCustomValidity('');
            reminderInput.style.borderColor = '';
            return true;
        };
        
        // Update reminder max when due date changes
        dueDateInput.addEventListener('change', () => {
            const dueDate = dueDateInput.value;
            if (dueDate) {
                // Set reminder max to end of due date
                const maxReminder = dueDate + 'T23:59';
                reminderInput.max = maxReminder;
            } else {
                reminderInput.removeAttribute('max');
            }
            validateDates();
        });
        
        reminderInput.addEventListener('change', validateDates);
        reminderInput.addEventListener('blur', validateDates);
    }

    loadFromLocalStorage() {
        try {
            const savedTodos = localStorage.getItem('todos');
            if (savedTodos) {
                this.todos = JSON.parse(savedTodos);
            }
            
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                this.userProfile = JSON.parse(savedProfile);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
            localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    loadUserProfile() {
        const usernameInput = document.getElementById('usernameInput');
        const avatarImg = document.getElementById('avatarImg');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        
        if (this.userProfile.username) {
            usernameInput.value = this.userProfile.username;
        }
        
        if (this.userProfile.avatar) {
            avatarImg.src = this.userProfile.avatar;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        }
    }

    createPhotoModal() {
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.id = 'photoModal';
        modal.innerHTML = `
            <div class="photo-modal-content">
                <span class="photo-modal-close">&times;</span>
                <img id="modalImage" src="" alt="Todo Photo">
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('photo-modal-close')) {
                modal.style.display = 'none';
            }
        });
    }

    startReminderChecker() {
        setInterval(() => {
            this.checkReminders();
        }, 60000); // Check every minute
        this.checkReminders(); // Check immediately
    }

    checkReminders() {
        const now = new Date();
        this.todos.forEach(todo => {
            if (todo.reminder && !todo.completed) {
                const reminderTime = new Date(todo.reminder);
                if (reminderTime <= now && !this.reminders.has(todo.id)) {
                    this.showReminder(todo);
                    this.reminders.set(todo.id, true);
                }
            }
        });
    }

    showReminder(todo) {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Todo Reminder', {
                    body: todo.text,
                    icon: todo.photo || '/favicon.ico'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Todo Reminder', {
                            body: todo.text,
                            icon: todo.photo || '/favicon.ico'
                        });
                    }
                });
            }
        }
        
        // Visual reminder
        alert(`Reminder: ${todo.text}`);
    }

    addLoadingStates() {
        // Add loading spinner CSS if not already present
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .loading {
                    opacity: 0.6;
                    pointer-events: none;
                    position: relative;
                }
                .loading::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 20px;
                    height: 20px;
                    margin: -10px 0 0 -10px;
                    border: 2px solid #e5e7eb;
                    border-top: 2px solid #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    z-index: 1000;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .success-animation {
                    animation: successPulse 0.6s ease-out;
                }
                @keyframes successPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setLoading(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
        } else {
            element.classList.remove('loading');
        }
    }

    showSuccess(element) {
        element.classList.add('success-animation');
        setTimeout(() => {
            element.classList.remove('success-animation');
        }, 600);
    }

    bindEvents() {
        // Add todo
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Photo upload for todos
        document.getElementById('photoBtn').addEventListener('click', () => {
            document.getElementById('todoPhotoInput').click();
        });

        // User profile
        document.getElementById('userAvatar').addEventListener('click', () => {
            document.getElementById('avatarInput').click();
        });
        
        document.getElementById('avatarInput').addEventListener('change', (e) => {
            this.handleAvatarUpload(e);
        });
        
        document.getElementById('saveProfileBtn').addEventListener('click', () => {
            this.saveUserProfile();
        });
        
        // Auto-save on username input blur
        document.getElementById('usernameInput').addEventListener('blur', () => {
            if (document.getElementById('usernameInput').value.trim() !== this.userProfile.username) {
                this.saveUserProfile();
            }
        });
        
        // Auto-save on Enter key in username input
        document.getElementById('usernameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveUserProfile();
                e.target.blur();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Clear completed
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());

        // View toggle
        document.getElementById('listViewBtn').addEventListener('click', () => this.setView('list'));
        document.getElementById('calendarViewBtn').addEventListener('click', () => this.setView('calendar'));

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.setView('list');
                        break;
                    case '2':
                        e.preventDefault();
                        this.setView('calendar');
                        break;
                }
            }
        });

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Check file size (limit to 2MB for localStorage)
            if (file.size > 2 * 1024 * 1024) {
                alert('Please select an image smaller than 2MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarImg = document.getElementById('avatarImg');
                const avatarPlaceholder = document.getElementById('avatarPlaceholder');
                
                // Update UI
                avatarImg.src = e.target.result;
                avatarImg.style.display = 'block';
                avatarPlaceholder.style.display = 'none';
                
                // Save to profile and localStorage
                this.userProfile.avatar = e.target.result;
                this.saveToLocalStorage();
                
                // Show success feedback on avatar
                const userAvatar = document.getElementById('userAvatar');
                userAvatar.style.transform = 'scale(1.1)';
                userAvatar.style.borderColor = 'var(--secondary-color)';
                
                setTimeout(() => {
                    userAvatar.style.transform = '';
                    userAvatar.style.borderColor = '';
                }, 1000);
                
                console.log('Avatar uploaded and saved to localStorage');
            };
            reader.readAsDataURL(file);
        }
    }

    saveUserProfile() {
        const usernameInput = document.getElementById('usernameInput');
        const saveBtn = document.getElementById('saveProfileBtn');
        
        // Update user profile data
        this.userProfile.username = usernameInput.value.trim();
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Show success feedback with icon change
        const originalIcon = saveBtn.textContent;
        saveBtn.textContent = '✅';
        saveBtn.style.background = 'var(--secondary-color)';
        saveBtn.style.borderColor = 'var(--secondary-color)';
        
        // Add success animation
        saveBtn.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            saveBtn.textContent = originalIcon;
            saveBtn.style.background = '';
            saveBtn.style.borderColor = '';
            saveBtn.style.transform = '';
        }, 1500);
        
        // Also show a subtle notification
        if (this.userProfile.username) {
            console.log(`Profile saved for: ${this.userProfile.username}`);
        }
    }

    setView(view) {
        this.currentView = view;
        
        // Update view buttons with animation
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.getElementById(view + 'ViewBtn');
        activeBtn.classList.add('active');
        this.showSuccess(activeBtn);
        
        // Show/hide views with smooth transition
        const listView = document.getElementById('listView');
        const calendarView = document.getElementById('calendarView');
        
        if (view === 'list') {
            calendarView.classList.add('hidden');
            setTimeout(() => listView.classList.remove('hidden'), 150);
        } else {
            listView.classList.add('hidden');
            setTimeout(() => {
                calendarView.classList.remove('hidden');
                this.renderCalendar();
            }, 150);
        }
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
        
        // Add smooth transition effect
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.style.transform = `translateX(${direction * 10}px)`;
        calendarGrid.style.opacity = '0.7';
        
        setTimeout(() => {
            calendarGrid.style.transform = 'translateX(0)';
            calendarGrid.style.opacity = '1';
        }, 150);
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update header with smooth transition
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthEl = document.getElementById('currentMonth');
        currentMonthEl.style.opacity = '0.5';
        setTimeout(() => {
            currentMonthEl.textContent = `${monthNames[month]} ${year}`;
            currentMonthEl.style.opacity = '1';
        }, 150);
        
        // Create calendar grid
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';
        calendarGrid.style.transition = 'all 0.3s ease';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month with staggered animation
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.style.animationDelay = `${day * 20}ms`;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = today.getFullYear() === year && 
                           today.getMonth() === month && 
                           today.getDate() === day;
            
            if (isToday) {
                dayElement.classList.add('today');
            }
            
            if (this.selectedDate === dateStr) {
                dayElement.classList.add('selected');
            }
            
            // Count todos for this date
            const todosForDate = this.todos.filter(todo => todo.dueDate === dateStr);
            
            dayElement.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                ${todosForDate.length > 0 ? `<div class="calendar-todo-count">${todosForDate.length}</div>` : ''}
            `;
            
            dayElement.addEventListener('click', () => this.selectDate(dateStr));
            calendarGrid.appendChild(dayElement);
        }
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.renderCalendar();
        this.renderSelectedDateTodos();
        
        // Smooth scroll to selected date todos
        setTimeout(() => {
            document.querySelector('.selected-date-todos').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 300);
    }

    async renderSelectedDateTodos() {
        if (!this.selectedDate) return;
        
        const selectedDateTitle = document.getElementById('selectedDateTitle');
        const selectedDateTodos = document.getElementById('selectedDateTodos');
        
        // Add loading state
        this.setLoading(selectedDateTodos, true);
        
        const date = new Date(this.selectedDate);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        selectedDateTitle.textContent = `Todos for ${formattedDate}`;
        
        // Simulate slight delay for smooth UX
        setTimeout(() => {
            const todosForDate = this.todos.filter(todo => todo.dueDate === this.selectedDate);
            const now = new Date();
            
            if (todosForDate.length === 0) {
                selectedDateTodos.innerHTML = '<li class="empty-state">No todos for this date</li>';
            } else {
                selectedDateTodos.innerHTML = todosForDate.map(todo => {
                    let reminderText = '';
                    let reminderClass = '';
                    if (todo.reminder && !todo.completed) {
                        const reminderTime = new Date(todo.reminder);
                        const isActive = reminderTime <= now;
                        
                        if (isActive) {
                            reminderClass = 'active';
                            reminderText = `🔔 ${reminderTime.toLocaleDateString()} ${reminderTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                        } else {
                            reminderText = `⏰ ${reminderTime.toLocaleDateString()} ${reminderTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                        }
                    }

                    return `
                        <li class="todo-item ${todo.completed ? 'completed' : ''}">
                            <input 
                                type="checkbox" 
                                class="todo-checkbox" 
                                ${todo.completed ? 'checked' : ''}
                                onchange="app.updateTodo(${todo.id}, { completed: this.checked })"
                            >
                            <input 
                                type="text" 
                                class="todo-text ${todo.completed ? 'completed' : ''}" 
                                value="${this.escapeHtml(todo.text)}"
                                onblur="app.updateTodo(${todo.id}, { text: this.value })"
                                onkeypress="if(event.key === 'Enter') this.blur()"
                            >
                            ${todo.photo ? `<img src="${todo.photo}" class="todo-photo" onclick="app.showPhotoModal('${todo.photo}')" alt="Todo photo">` : ''}
                            ${reminderText ? `<span class="todo-reminder ${reminderClass}">${reminderText}</span>` : ''}
                            <button 
                                class="delete-btn" 
                                onclick="app.deleteTodo(${todo.id})"
                                aria-label="Delete todo"
                            >
                                Delete
                            </button>
                        </li>
                    `;
                }).join('');
            }
            
            this.setLoading(selectedDateTodos, false);
        }, 200);
    }

    async loadTodos() {
        try {
            const response = await fetch('/api/todos');
            this.todos = await response.json();
            this.renderTodos();
            this.updateStats();
        } catch (error) {
            console.error('Error loading todos:', error);
        }
    }

    async addTodo() {
        const input = document.getElementById('todoInput');
        const dueDateInput = document.getElementById('dueDateInput');
        const reminderInput = document.getElementById('reminderInput');
        const photoInput = document.getElementById('todoPhotoInput');
        const addBtn = document.getElementById('addBtn');
        const text = input.value.trim();
        const dueDate = dueDateInput.value || null;
        const reminder = reminderInput.value || null;

        if (!text) {
            // Add shake animation for empty input
            input.style.animation = 'shake 0.5s ease-in-out';
            input.focus();
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
            return;
        }

        // Validate dates
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Check if due date is in the past
        if (dueDate && dueDate < today) {
            dueDateInput.style.animation = 'shake 0.5s ease-in-out';
            dueDateInput.style.borderColor = 'var(--danger-color)';
            alert('Due date cannot be in the past');
            setTimeout(() => {
                dueDateInput.style.animation = '';
                dueDateInput.style.borderColor = '';
            }, 500);
            return;
        }

        // Check if reminder is in the past
        if (reminder && new Date(reminder) <= now) {
            reminderInput.style.animation = 'shake 0.5s ease-in-out';
            reminderInput.style.borderColor = 'var(--danger-color)';
            alert('Reminder time cannot be in the past');
            setTimeout(() => {
                reminderInput.style.animation = '';
                reminderInput.style.borderColor = '';
            }, 500);
            return;
        }

        // Check if reminder is after due date
        if (dueDate && reminder) {
            const dueDateObj = new Date(dueDate + 'T23:59:59');
            const reminderDateObj = new Date(reminder);
            
            if (reminderDateObj >= dueDateObj) {
                reminderInput.style.animation = 'shake 0.5s ease-in-out';
                reminderInput.style.borderColor = 'var(--danger-color)';
                alert('Reminder must be before the due date');
                setTimeout(() => {
                    reminderInput.style.animation = '';
                    reminderInput.style.borderColor = '';
                }, 500);
                return;
            }
        }

        // Add loading state
        this.setLoading(addBtn, true);
        const btnText = addBtn.querySelector('.btn-text');
        const btnIcon = addBtn.querySelector('.btn-icon');
        const originalText = btnText.textContent;
        const originalIcon = btnIcon.textContent;
        
        btnText.textContent = 'Adding...';
        btnIcon.textContent = '⏳';

        try {
            // Handle photo upload
            let photoData = null;
            if (photoInput.files[0]) {
                photoData = await this.convertFileToBase64(photoInput.files[0]);
            }

            const newTodo = {
                id: Date.now(), // Simple ID generation for localStorage
                text: text,
                completed: false,
                dueDate: dueDate,
                reminder: reminder,
                photo: photoData,
                createdAt: new Date().toISOString()
            };

            this.todos.push(newTodo);
            this.saveToLocalStorage();
            
            // Clear inputs with success animation
            input.value = '';
            dueDateInput.value = '';
            reminderInput.value = '';
            photoInput.value = '';
            
            // Reset date constraints
            this.setupDateValidation();
            
            this.showSuccess(input);
            
            this.renderTodos();
            this.updateStats();
            
            if (this.currentView === 'calendar') {
                this.renderCalendar();
                if (this.selectedDate) {
                    this.renderSelectedDateTodos();
                }
            }
            
            // Show success feedback
            btnText.textContent = 'Added!';
            btnIcon.textContent = '✓';
            addBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
                btnText.textContent = originalText;
                btnIcon.textContent = originalIcon;
                addBtn.style.background = '';
            }, 1000);
        } catch (error) {
            console.error('Error adding todo:', error);
            btnText.textContent = 'Error!';
            btnIcon.textContent = '✗';
            addBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            
            setTimeout(() => {
                btnText.textContent = originalText;
                btnIcon.textContent = originalIcon;
                addBtn.style.background = '';
            }, 2000);
        } finally {
            this.setLoading(addBtn, false);
        }
    }

    convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async updateTodo(id, updates) {
        try {
            const index = this.todos.findIndex(todo => todo.id === id);
            if (index !== -1) {
                this.todos[index] = { ...this.todos[index], ...updates };
                this.saveToLocalStorage();
                
                this.renderTodos();
                this.updateStats();
                if (this.currentView === 'calendar') {
                    this.renderCalendar();
                    if (this.selectedDate) {
                        this.renderSelectedDateTodos();
                    }
                }
            }
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    }

    async deleteTodo(id) {
        try {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveToLocalStorage();
            
            this.renderTodos();
            this.updateStats();
            if (this.currentView === 'calendar') {
                this.renderCalendar();
                if (this.selectedDate) {
                    this.renderSelectedDateTodos();
                }
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }

    async clearCompleted() {
        const completedTodos = this.todos.filter(todo => todo.completed);
        
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveToLocalStorage();
        
        this.renderTodos();
        this.updateStats();
        if (this.currentView === 'calendar') {
            this.renderCalendar();
            if (this.selectedDate) {
                this.renderSelectedDateTodos();
            }
        }
    }

    async loadTodos() {
        // This method is now handled by loadFromLocalStorage
        this.renderTodos();
        this.updateStats();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTodos();
    }

    getFilteredTodos() {
        const today = new Date().toISOString().split('T')[0];
        
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'today':
                return this.todos.filter(todo => todo.dueDate === today);
            case 'overdue':
                return this.todos.filter(todo => 
                    todo.dueDate && todo.dueDate < today && !todo.completed
                );
            default:
                return this.todos;
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<li class="empty-state">No todos found</li>';
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        todoList.innerHTML = filteredTodos.map(todo => {
            let dueDateClass = '';
            let dueDateText = '';
            
            if (todo.dueDate) {
                if (todo.dueDate < today && !todo.completed) {
                    dueDateClass = 'todo-overdue';
                    dueDateText = `Due: ${new Date(todo.dueDate).toLocaleDateString()} (Overdue)`;
                } else if (todo.dueDate === today) {
                    dueDateClass = 'todo-due-today';
                    dueDateText = 'Due: Today';
                } else {
                    dueDateText = `Due: ${new Date(todo.dueDate).toLocaleDateString()}`;
                }
            }

            let reminderText = '';
            let reminderClass = '';
            if (todo.reminder && !todo.completed) {
                const reminderTime = new Date(todo.reminder);
                const isActive = reminderTime <= now;
                
                if (isActive) {
                    reminderClass = 'active';
                    reminderText = `🔔 ${reminderTime.toLocaleDateString()} ${reminderTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                } else {
                    reminderText = `⏰ ${reminderTime.toLocaleDateString()} ${reminderTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                }
            }
            
            return `
                <li class="todo-item ${todo.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.updateTodo(${todo.id}, { completed: this.checked })"
                    >
                    <input 
                        type="text" 
                        class="todo-text ${todo.completed ? 'completed' : ''}" 
                        value="${this.escapeHtml(todo.text)}"
                        onblur="app.updateTodo(${todo.id}, { text: this.value })"
                        onkeypress="if(event.key === 'Enter') this.blur()"
                    >
                    ${todo.photo ? `<img src="${todo.photo}" class="todo-photo" onclick="app.showPhotoModal('${todo.photo}')" alt="Todo photo">` : ''}
                    ${reminderText ? `<span class="todo-reminder ${reminderClass}">${reminderText}</span>` : ''}
                    ${dueDateText ? `<span class="todo-due-date ${dueDateClass}">${dueDateText}</span>` : ''}
                    <button 
                        class="delete-btn" 
                        onclick="app.deleteTodo(${todo.id})"
                        aria-label="Delete todo"
                    >
                        Delete
                    </button>
                </li>
            `;
        }).join('');
    }

    showPhotoModal(photoSrc) {
        const modal = document.getElementById('photoModal');
        const modalImage = document.getElementById('modalImage');
        
        modalImage.src = photoSrc;
        modal.style.display = 'block';
    }

    updateStats() {
        const activeTodos = this.todos.filter(todo => !todo.completed);
        const count = activeTodos.length;
        const countText = count === 1 ? '1 item left' : `${count} items left`;
        
        document.getElementById('todoCount').textContent = countText;
        
        // Show/hide clear completed button
        const hasCompleted = this.todos.some(todo => todo.completed);
        const clearBtn = document.getElementById('clearCompleted');
        clearBtn.style.display = hasCompleted ? 'block' : 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});
