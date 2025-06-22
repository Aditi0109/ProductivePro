// ProductivePro Interactive Features
// Handles all productivity tool functionality

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all interactive components
    initializeNavigation();
    initializePomodoroTimer();
    initializeSiteBlocking();
    initializeWhitelistMode();
    initializeScheduleManager();
    initializeInsightsDashboard();
    initializeNudgesSystem();
    initializeLeaderboard();
    initializeMobileMenu();
    initializeScrollAnimations();
    
    // Navigation functionality (existing)
    function initializeNavigation() {
        const navbar = document.getElementById('navbar');
        const navLinks = document.querySelectorAll('.nav-link');
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
            updateActiveNavLink();
        });
        
        updateActiveNavLink();
    }
    
    function updateActiveNavLink() {
        const sections = ['hero', 'features', 'pricing', 'contact'];
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = sectionId;
                }
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Pomodoro Timer Implementation
    function initializePomodoroTimer() {
        let currentTimer = null;
        let timeRemaining = 25 * 60; // 25 minutes in seconds
        let isRunning = false;
        let currentDuration = 25;
        
        const timerDisplay = document.getElementById('timer-display');
        const timerStatus = document.getElementById('timer-status');
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const stopBtn = document.getElementById('stop-timer');
        const presetButtons = document.querySelectorAll('.timer-preset');
        
        function updateDisplay() {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        function updateButtons() {
            startBtn.disabled = isRunning;
            pauseBtn.disabled = !isRunning;
            stopBtn.disabled = !isRunning && timeRemaining === currentDuration * 60;
        }
        
        startBtn.addEventListener('click', async function() {
            if (!isRunning) {
                try {
                    const response = await fetch('/api/pomodoro/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ duration: currentDuration, type: 'work' })
                    });
                    
                    if (response.ok) {
                        isRunning = true;
                        timerStatus.textContent = 'Focus session in progress...';
                        
                        currentTimer = setInterval(() => {
                            timeRemaining--;
                            updateDisplay();
                            
                            if (timeRemaining <= 0) {
                                completeTimer();
                            }
                        }, 1000);
                        
                        updateButtons();
                        showNotification('Pomodoro session started! Stay focused.', 'success');
                    }
                } catch (error) {
                    showNotification('Failed to start timer. Please try again.', 'error');
                }
            }
        });
        
        pauseBtn.addEventListener('click', function() {
            if (isRunning) {
                clearInterval(currentTimer);
                isRunning = false;
                timerStatus.textContent = 'Session paused';
                updateButtons();
                showNotification('Timer paused', 'info');
            }
        });
        
        stopBtn.addEventListener('click', async function() {
            if (isRunning || timeRemaining < currentDuration * 60) {
                try {
                    await fetch('/api/pomodoro/stop', { method: 'POST' });
                    resetTimer();
                    showNotification('Session stopped', 'warning');
                } catch (error) {
                    resetTimer();
                }
            }
        });
        
        async function completeTimer() {
            clearInterval(currentTimer);
            isRunning = false;
            
            try {
                await fetch('/api/pomodoro/complete', { method: 'POST' });
                timerStatus.textContent = 'Session completed! Great work!';
                showNotification('Pomodoro session completed! Time for a break.', 'success');
                
                // Auto-refresh insights
                refreshInsights();
            } catch (error) {
                timerStatus.textContent = 'Session completed!';
            }
            
            updateButtons();
        }
        
        function resetTimer() {
            clearInterval(currentTimer);
            isRunning = false;
            timeRemaining = currentDuration * 60;
            timerStatus.textContent = 'Ready to focus';
            updateDisplay();
            updateButtons();
        }
        
        presetButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (!isRunning) {
                    currentDuration = parseInt(this.dataset.duration);
                    timeRemaining = currentDuration * 60;
                    updateDisplay();
                    timerStatus.textContent = `${currentDuration} minute session ready`;
                    
                    // Visual feedback
                    presetButtons.forEach(b => b.classList.remove('bg-accent-500'));
                    this.classList.add('bg-accent-500');
                }
            });
        });
        
        updateDisplay();
        updateButtons();
    }

    // Site Blocking Implementation
    function initializeSiteBlocking() {
        const blockSiteInput = document.getElementById('block-site-input');
        const addBlockedSiteBtn = document.getElementById('add-blocked-site');
        const blockedSitesList = document.getElementById('blocked-sites-list');
        
        async function loadBlockedSites() {
            try {
                const response = await fetch('/api/blocked-sites');
                const sites = await response.json();
                
                blockedSitesList.innerHTML = sites.map(site => `
                    <div class="flex justify-between items-center bg-dark-500 px-3 py-2 rounded">
                        <div class="flex items-center space-x-2">
                            <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span class="text-white text-sm">${site.url}</span>
                            <span class="text-gray-400 text-xs">${site.category}</span>
                        </div>
                        <button onclick="removeBlockedSite(${site.id})" class="text-red-400 hover:text-red-300 text-xs">
                            Remove
                        </button>
                    </div>
                `).join('');
            } catch (error) {
                showNotification('Failed to load blocked sites', 'error');
            }
        }
        
        addBlockedSiteBtn.addEventListener('click', async function() {
            const url = blockSiteInput.value.trim();
            if (!url) return;
            
            try {
                const response = await fetch('/api/blocked-sites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, category: 'user_added' })
                });
                
                if (response.ok) {
                    blockSiteInput.value = '';
                    loadBlockedSites();
                    refreshInsights();
                    showNotification(`${url} has been blocked`, 'success');
                }
            } catch (error) {
                showNotification('Failed to block site', 'error');
            }
        });
        
        blockSiteInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addBlockedSiteBtn.click();
            }
        });
        
        // Global function for remove buttons
        window.removeBlockedSite = async function(id) {
            try {
                const response = await fetch(`/api/blocked-sites/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadBlockedSites();
                    refreshInsights();
                    showNotification('Site unblocked', 'info');
                }
            } catch (error) {
                showNotification('Failed to unblock site', 'error');
            }
        };
        
        loadBlockedSites();
    }

    // Whitelist Mode Implementation
    function initializeWhitelistMode() {
        const whitelistSiteInput = document.getElementById('whitelist-site-input');
        const addWhitelistSiteBtn = document.getElementById('add-whitelist-site');
        const whitelistSitesList = document.getElementById('whitelist-sites-list');
        
        async function loadWhitelistSites() {
            try {
                const response = await fetch('/api/whitelist-sites');
                const sites = await response.json();
                
                whitelistSitesList.innerHTML = sites.map(site => `
                    <div class="flex justify-between items-center bg-dark-500 px-3 py-2 rounded">
                        <div class="flex items-center space-x-2">
                            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span class="text-white text-sm">${site.url}</span>
                            <span class="text-gray-400 text-xs">${site.category}</span>
                        </div>
                        <button onclick="removeWhitelistSite(${site.id})" class="text-green-400 hover:text-green-300 text-xs">
                            Remove
                        </button>
                    </div>
                `).join('');
            } catch (error) {
                showNotification('Failed to load whitelist sites', 'error');
            }
        }
        
        addWhitelistSiteBtn.addEventListener('click', async function() {
            const url = whitelistSiteInput.value.trim();
            if (!url) return;
            
            try {
                const response = await fetch('/api/whitelist-sites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, category: 'user_added' })
                });
                
                if (response.ok) {
                    whitelistSiteInput.value = '';
                    loadWhitelistSites();
                    showNotification(`${url} has been whitelisted`, 'success');
                }
            } catch (error) {
                showNotification('Failed to whitelist site', 'error');
            }
        });
        
        whitelistSiteInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addWhitelistSiteBtn.click();
            }
        });
        
        window.removeWhitelistSite = async function(id) {
            try {
                const response = await fetch(`/api/whitelist-sites/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadWhitelistSites();
                    showNotification('Site removed from whitelist', 'info');
                }
            } catch (error) {
                showNotification('Failed to remove from whitelist', 'error');
            }
        };
        
        loadWhitelistSites();
    }

    // Schedule Manager Implementation
    function initializeScheduleManager() {
        const scheduleNameInput = document.getElementById('schedule-name');
        const scheduleDaySelect = document.getElementById('schedule-day');
        const scheduleStartInput = document.getElementById('schedule-start');
        const scheduleEndInput = document.getElementById('schedule-end');
        const addScheduleBtn = document.getElementById('add-schedule');
        const schedulesList = document.getElementById('schedules-list');
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        async function loadSchedules() {
            try {
                const response = await fetch('/api/schedules');
                const schedules = await response.json();
                
                schedulesList.innerHTML = schedules.map(schedule => `
                    <div class="flex justify-between items-center bg-dark-500 px-3 py-2 rounded">
                        <div>
                            <div class="text-white text-sm font-medium">${schedule.name}</div>
                            <div class="text-gray-400 text-xs">
                                ${dayNames[schedule.dayOfWeek]} ${schedule.startTime} - ${schedule.endTime}
                            </div>
                        </div>
                        <button onclick="removeSchedule(${schedule.id})" class="text-orange-400 hover:text-orange-300 text-xs">
                            Remove
                        </button>
                    </div>
                `).join('');
            } catch (error) {
                showNotification('Failed to load schedules', 'error');
            }
        }
        
        addScheduleBtn.addEventListener('click', async function() {
            const name = scheduleNameInput.value.trim();
            const dayOfWeek = parseInt(scheduleDaySelect.value);
            const startTime = scheduleStartInput.value;
            const endTime = scheduleEndInput.value;
            
            if (!name || !startTime || !endTime) {
                showNotification('Please fill in all fields', 'warning');
                return;
            }
            
            try {
                const response = await fetch('/api/schedules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, dayOfWeek, startTime, endTime, blockingType: 'blacklist' })
                });
                
                if (response.ok) {
                    scheduleNameInput.value = '';
                    scheduleStartInput.value = '';
                    scheduleEndInput.value = '';
                    loadSchedules();
                    showNotification('Schedule created successfully', 'success');
                }
            } catch (error) {
                showNotification('Failed to create schedule', 'error');
            }
        });
        
        window.removeSchedule = async function(id) {
            try {
                const response = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadSchedules();
                    showNotification('Schedule removed', 'info');
                }
            } catch (error) {
                showNotification('Failed to remove schedule', 'error');
            }
        };
        
        loadSchedules();
    }

    // Insights Dashboard Implementation
    function initializeInsightsDashboard() {
        const productiveTimeEl = document.getElementById('productive-time');
        const focusScoreEl = document.getElementById('focus-score');
        const pomodoroCountEl = document.getElementById('pomodoro-count');
        const sitesBlockedCountEl = document.getElementById('sites-blocked-count');
        const refreshInsightsBtn = document.getElementById('refresh-insights');
        
        async function loadInsights() {
            try {
                const response = await fetch('/api/insights');
                const insights = await response.json();
                
                productiveTimeEl.textContent = `${Math.floor(insights.totalProductiveTime / 60)}h ${insights.totalProductiveTime % 60}m`;
                focusScoreEl.textContent = `${insights.focusScore}%`;
                pomodoroCountEl.textContent = insights.pomodoroCount;
                sitesBlockedCountEl.textContent = insights.sitesBlocked;
                
                // Update focus score color
                if (insights.focusScore >= 80) {
                    focusScoreEl.className = 'text-2xl font-bold text-green-500';
                } else if (insights.focusScore >= 60) {
                    focusScoreEl.className = 'text-2xl font-bold text-yellow-500';
                } else {
                    focusScoreEl.className = 'text-2xl font-bold text-red-500';
                }
            } catch (error) {
                showNotification('Failed to load insights', 'error');
            }
        }
        
        refreshInsightsBtn.addEventListener('click', loadInsights);
        
        // Global function for other components to refresh insights
        window.refreshInsights = loadInsights;
        
        loadInsights();
    }

    // Nudges System Implementation
    function initializeNudgesSystem() {
        const nudgesListEl = document.getElementById('nudges-list');
        const generateNudgeBtn = document.getElementById('generate-nudge');
        
        const nudgeMessages = [
            'Time for a 5-minute break to recharge your focus!',
            'You\'ve been productive! Consider starting a new Pomodoro session.',
            'Reminder: Stay hydrated and maintain good posture.',
            'Great focus streak! Keep up the momentum.',
            'Time to review your blocked sites list for optimization.',
            'Consider taking a short walk to boost creativity.'
        ];
        
        async function loadNudges() {
            try {
                const response = await fetch('/api/nudges');
                const nudges = await response.json();
                
                nudgesListEl.innerHTML = nudges.map(nudge => `
                    <div class="bg-dark-500 px-3 py-2 rounded flex justify-between items-start">
                        <div class="flex-1">
                            <div class="text-purple-400 text-xs uppercase font-medium">${nudge.type.replace('_', ' ')}</div>
                            <div class="text-white text-sm">${nudge.message}</div>
                        </div>
                        <button onclick="markNudgeRead(${nudge.id})" class="text-gray-400 hover:text-white text-xs ml-2">
                            ✓
                        </button>
                    </div>
                `).join('') || '<div class="text-gray-400 text-sm text-center">No new nudges</div>';
            } catch (error) {
                showNotification('Failed to load nudges', 'error');
            }
        }
        
        generateNudgeBtn.addEventListener('click', function() {
            const randomMessage = nudgeMessages[Math.floor(Math.random() * nudgeMessages.length)];
            
            // Add nudge to UI immediately for demo
            const nudgeHtml = `
                <div class="bg-dark-500 px-3 py-2 rounded flex justify-between items-start animate-pulse">
                    <div class="flex-1">
                        <div class="text-purple-400 text-xs uppercase font-medium">Smart Suggestion</div>
                        <div class="text-white text-sm">${randomMessage}</div>
                    </div>
                    <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-white text-xs ml-2">
                        ✓
                    </button>
                </div>
            `;
            
            if (nudgesListEl.children.length === 1 && nudgesListEl.textContent.includes('No new nudges')) {
                nudgesListEl.innerHTML = nudgeHtml;
            } else {
                nudgesListEl.insertAdjacentHTML('afterbegin', nudgeHtml);
            }
            
            showNotification('Smart nudge generated based on your activity', 'info');
        });
        
        window.markNudgeRead = async function(id) {
            try {
                await fetch(`/api/nudges/${id}/read`, { method: 'POST' });
                loadNudges();
            } catch (error) {
                // Still remove from UI for demo
                loadNudges();
            }
        };
        
        loadNudges();
    }

    // Leaderboard Implementation
    function initializeLeaderboard() {
        const leaderboardListEl = document.getElementById('leaderboard-list');
        const refreshLeaderboardBtn = document.getElementById('refresh-leaderboard');
        
        async function loadLeaderboard() {
            try {
                const response = await fetch('/api/leaderboard');
                const leaderboard = await response.json();
                
                leaderboardListEl.innerHTML = leaderboard.map((entry, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                    const isCurrentUser = entry.user.firstName === 'Demo';
                    
                    return `
                        <div class="flex justify-between items-center bg-dark-500 px-3 py-2 rounded ${isCurrentUser ? 'ring-2 ring-accent-500' : ''}">
                            <div class="flex items-center space-x-3">
                                <span class="text-lg">${medal || `#${index + 1}`}</span>
                                <div>
                                    <div class="text-white text-sm font-medium">
                                        ${entry.user.firstName} ${entry.user.lastName} ${isCurrentUser ? '(You)' : ''}
                                    </div>
                                    <div class="text-gray-400 text-xs">${entry.streakDays} day streak</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-yellow-400 font-bold">${entry.totalScore.toLocaleString()}</div>
                                <div class="text-gray-400 text-xs">points</div>
                            </div>
                        </div>
                    `;
                }).join('');
            } catch (error) {
                showNotification('Failed to load leaderboard', 'error');
            }
        }
        
        refreshLeaderboardBtn.addEventListener('click', function() {
            loadLeaderboard();
            showNotification('Leaderboard refreshed', 'info');
        });
        
        loadLeaderboard();
    }

    // Mobile menu functionality (existing)
    function initializeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                if (mobileMenu.classList.contains('hidden')) {
                    icon.setAttribute('data-feather', 'menu');
                } else {
                    icon.setAttribute('data-feather', 'x');
                }
                feather.replace();
            });
        }
    }

    // Scroll animations (existing)
    function initializeScrollAnimations() {
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.classList.add('animate-on-scroll');
            observer.observe(card);
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-600', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-600', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-600', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-600', 'text-white');
        }
        
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i data-feather="${getNotificationIcon(type)}" class="w-5 h-5"></i>
                <span>${message}</span>
                <button class="ml-4 hover:opacity-70" onclick="this.parentElement.parentElement.remove()">
                    <i data-feather="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        feather.replace();
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('translate-x-full');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    function getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'x-circle';
            case 'warning': return 'alert-triangle';
            default: return 'info';
        }
    }

    // Initialize feather icons
    feather.replace();
    
    console.log('ProductivePro interactive features initialized successfully');
});