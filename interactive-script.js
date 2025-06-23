// ProductivePro Interactive Features
// Handles all productivity tool functionality

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all interactive components
    initializeNavigation();
    initializePomodoroTimer();
    initializeFlowBeats();
    initializeTaskPlanner();
    initializeInsightsDashboard();
    initializeFocusFuel();
    initializeSnapStudy();
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
        const sections = ['hero', 'features', 'snapStudy', 'contact'];
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
        let isFullscreen = false;
        
        const timerDisplay = document.getElementById('timer-display');
        const timerStatus = document.getElementById('timer-status');
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const stopBtn = document.getElementById('stop-timer');
        const presetButtons = document.querySelectorAll('.timer-preset');
        
        // Fullscreen elements
        const fullscreenTimer = document.getElementById('fullscreen-timer');
        const fullscreenTimerDisplay = document.getElementById('fullscreen-timer-display');
        const fullscreenTimerStatus = document.getElementById('fullscreen-timer-status');
        const fullscreenStartBtn = document.getElementById('fullscreen-start-timer');
        const fullscreenPauseBtn = document.getElementById('fullscreen-pause-timer');
        const fullscreenStopBtn = document.getElementById('fullscreen-stop-timer');
        const fullscreenPresetButtons = document.querySelectorAll('.fullscreen-timer-preset');
        const exitFullscreenBtn = document.getElementById('exit-fullscreen');
        
        function updateDisplay() {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            timerDisplay.textContent = timeText;
            if (isFullscreen) {
                fullscreenTimerDisplay.textContent = timeText;
            }
        }
        
        function updateStatus(status) {
            timerStatus.textContent = status;
            if (isFullscreen) {
                fullscreenTimerStatus.textContent = status;
            }
        }
        
        function updateButtons() {
            // Update start button text based on state
            const startText = isPaused ? 'Resume' : 'Start';
            startBtn.textContent = startText;
            fullscreenStartBtn.textContent = startText;
            
            const buttons = [
                { normal: startBtn, fullscreen: fullscreenStartBtn, disabled: isRunning },
                { normal: pauseBtn, fullscreen: fullscreenPauseBtn, disabled: !isRunning || isPaused },
                { normal: stopBtn, fullscreen: fullscreenStopBtn, disabled: !isRunning && !isPaused && timeRemaining === currentDuration * 60 }
            ];
            
            buttons.forEach(btn => {
                btn.normal.disabled = btn.disabled;
                btn.fullscreen.disabled = btn.disabled;
            });
        }
        
        function enterFullscreen() {
            isFullscreen = true;
            fullscreenTimer.classList.remove('hidden');
            fullscreenTimer.classList.add('flex');
            updateDisplay();
            updateStatus(timerStatus.textContent);
            feather.replace();
        }
        
        function exitFullscreen() {
            isFullscreen = false;
            fullscreenTimer.classList.add('hidden');
            fullscreenTimer.classList.remove('flex');
        }
        
        let isPaused = false;

        async function startTimer() {
            if (!isRunning && !isPaused) {
                try {
                    const response = await fetch('/api/pomodoro/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ duration: currentDuration, type: 'work' })
                    });
                    
                    if (response.ok) {
                        isRunning = true;
                        isPaused = false;
                        updateStatus('Focus session in progress...');
                        
                        // Enter fullscreen when starting timer
                        enterFullscreen();
                        
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
            } else if (isPaused) {
                // Resume from pause
                resumeTimer();
            }
        }

        async function resumeTimer() {
            if (isPaused && !isRunning) {
                try {
                    await fetch('/api/pomodoro/resume', { method: 'POST' });
                    isRunning = true;
                    isPaused = false;
                    updateStatus('Focus session resumed...');
                    
                    currentTimer = setInterval(() => {
                        timeRemaining--;
                        updateDisplay();
                        
                        if (timeRemaining <= 0) {
                            completeTimer();
                        }
                    }, 1000);
                    
                    updateButtons();
                    showNotification('Session resumed', 'success');
                    refreshInsights();
                } catch (error) {
                    showNotification('Failed to resume timer', 'error');
                }
            }
        }

        startBtn.addEventListener('click', startTimer);
        fullscreenStartBtn.addEventListener('click', startTimer);
        
        async function pauseTimer() {
            if (isRunning) {
                try {
                    await fetch('/api/pomodoro/pause', { method: 'POST' });
                    clearInterval(currentTimer);
                    isRunning = false;
                    isPaused = true;
                    updateStatus('Session paused - Time away is being tracked');
                    updateButtons();
                    showNotification('Timer paused - Time away is being tracked', 'info');
                    
                    // Refresh insights to show updated pause time
                    refreshInsights();
                } catch (error) {
                    clearInterval(currentTimer);
                    isRunning = false;
                    isPaused = true;
                    updateStatus('Session paused');
                    updateButtons();
                    showNotification('Timer paused', 'info');
                }
            }
        }

        async function stopTimer() {
            if (isRunning || timeRemaining < currentDuration * 60) {
                try {
                    await fetch('/api/pomodoro/stop', { method: 'POST' });
                    resetTimer();
                    exitFullscreen();
                    showNotification('Session stopped', 'warning');
                } catch (error) {
                    resetTimer();
                    exitFullscreen();
                }
            }
        }

        pauseBtn.addEventListener('click', pauseTimer);
        fullscreenPauseBtn.addEventListener('click', pauseTimer);
        
        stopBtn.addEventListener('click', stopTimer);
        fullscreenStopBtn.addEventListener('click', stopTimer);
        
        async function completeTimer() {
            clearInterval(currentTimer);
            isRunning = false;
            
            try {
                await fetch('/api/pomodoro/complete', { method: 'POST' });
                updateStatus('Session completed! Great work!');
                showNotification('Pomodoro session completed! Time for a break.', 'success');
                
                // Show smart nudge after completion
                showSmartNudge('Excellent focus session! Consider taking a 5-minute break before your next task.');
                
                // Auto-refresh insights
                refreshInsights();
                
                // Exit fullscreen after completion
                setTimeout(() => {
                    exitFullscreen();
                }, 3000);
            } catch (error) {
                updateStatus('Session completed!');
                setTimeout(() => {
                    exitFullscreen();
                }, 3000);
            }
            
            updateButtons();
        }
        
        function resetTimer() {
            clearInterval(currentTimer);
            isRunning = false;
            isPaused = false;
            timeRemaining = currentDuration * 60;
            updateStatus('Ready to focus');
            updateDisplay();
            updateButtons();
        }
        
        function setupPresetButtons(buttons, isFullscreenMode = false) {
            buttons.forEach(btn => {
                btn.addEventListener('click', function() {
                    if (!isRunning) {
                        currentDuration = parseInt(this.dataset.duration);
                        timeRemaining = currentDuration * 60;
                        updateDisplay();
                        updateStatus(`${currentDuration} minute session ready`);
                        
                        // Visual feedback
                        buttons.forEach(b => {
                            if (isFullscreenMode) {
                                b.classList.remove('bg-accent-500');
                                b.classList.add('bg-gray-700');
                            } else {
                                b.classList.remove('bg-accent-500');
                            }
                        });
                        
                        if (isFullscreenMode) {
                            this.classList.remove('bg-gray-700');
                            this.classList.add('bg-accent-500');
                        } else {
                            this.classList.add('bg-accent-500');
                        }
                    }
                });
            });
        }

        setupPresetButtons(presetButtons, false);
        setupPresetButtons(fullscreenPresetButtons, true);
        
        // Exit fullscreen button
        exitFullscreenBtn.addEventListener('click', exitFullscreen);
        
        // Keyboard shortcuts for fullscreen mode
        document.addEventListener('keydown', function(e) {
            if (isFullscreen) {
                switch(e.code) {
                    case 'Space':
                        e.preventDefault();
                        if (isRunning) {
                            pauseTimer();
                        } else {
                            startTimer();
                        }
                        break;
                    case 'Escape':
                        e.preventDefault();
                        exitFullscreen();
                        break;
                    case 'KeyS':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            stopTimer();
                        }
                        break;
                }
            }
        });
        
        updateDisplay();
        updateButtons();
    }

    // FlowBeats Music Player Implementation
    function initializeFlowBeats() {
        const playPauseBtn = document.getElementById('music-play-pause');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeDisplay = document.getElementById('volume-display');
        const trackTitle = document.getElementById('current-track-title');
        const trackArtist = document.getElementById('current-track-artist');
        const listenerCount = document.getElementById('listener-count');
        const musicStatus = document.getElementById('music-status');
        const lofiAudio = document.getElementById('lofi-audio');
        
        let isPlaying = false;
        
        // Initialize audio element
        lofiAudio.volume = 0.5;
        lofiAudio.crossOrigin = "anonymous";
        
        // Load current track info
        async function loadCurrentTrack() {
            try {
                const response = await fetch('/api/flowbeats/current');
                const data = await response.json();
                
                if (data.success) {
                    trackTitle.textContent = data.currentTrack.title;
                    trackArtist.textContent = data.currentTrack.artist;
                    listenerCount.textContent = `🎧 ${data.listeners} listeners`;
                }
            } catch (error) {
                trackTitle.textContent = 'Lofi Hip Hop Radio';
                trackArtist.textContent = 'lofi.cafe';
                listenerCount.textContent = '🎧 Loading...';
            }
        }
        
        // Play/Pause functionality
        function togglePlayPause() {
            if (isPlaying) {
                lofiAudio.pause();
                playPauseBtn.innerHTML = '<i data-feather="play" class="w-5 h-5"></i>';
                musicStatus.textContent = '⏸️';
                isPlaying = false;
                showNotification('Music paused', 'info');
            } else {
                // Ensure audio is properly initialized with user interaction
                if (!lofiAudio.src || lofiAudio.src === '') {
                    lofiAudio.src = 'https://lofi.cafe/api/stream';
                    lofiAudio.load(); // Load the stream
                }
                
                // Request play with user gesture
                const playPromise = lofiAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        playPauseBtn.innerHTML = '<i data-feather="pause" class="w-5 h-5"></i>';
                        musicStatus.textContent = '🎵';
                        isPlaying = true;
                        showNotification('Playing lofi music', 'success');
                    }).catch(error => {
                        console.error('Audio play failed:', error);
                        
                        // Try with a direct user-initiated audio element
                        if (!window.globalAudio) {
                            window.globalAudio = new Audio();
                            window.globalAudio.crossOrigin = "anonymous";
                            window.globalAudio.volume = lofiAudio.volume;
                        }
                        
                        window.globalAudio.src = 'https://lofi.cafe/api/stream';
                        window.globalAudio.play().then(() => {
                            playPauseBtn.innerHTML = '<i data-feather="pause" class="w-5 h-5"></i>';
                            musicStatus.textContent = '🎵';
                            isPlaying = true;
                            showNotification('Music started', 'success');
                            
                            // Update volume control to work with global audio
                            volumeSlider.addEventListener('input', () => {
                                window.globalAudio.volume = volumeSlider.value / 100;
                                volumeDisplay.textContent = volumeSlider.value + '%';
                            });
                        }).catch(err => {
                            showNotification('Click play button to start music (browser requires user interaction)', 'info');
                        });
                    });
                }
            }
            
            // Re-render feather icons
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
        
        // Volume control
        function updateVolume() {
            const volume = volumeSlider.value / 100;
            lofiAudio.volume = volume;
            volumeDisplay.textContent = volumeSlider.value + '%';
        }
        
        // Event listeners
        playPauseBtn.addEventListener('click', togglePlayPause);
        volumeSlider.addEventListener('input', updateVolume);
        
        // Handle audio events
        lofiAudio.addEventListener('ended', () => {
            // Lofi stream shouldn't end, but if it does, restart
            if (isPlaying) {
                setTimeout(() => {
                    lofiAudio.play();
                }, 1000);
            }
        });
        
        lofiAudio.addEventListener('error', () => {
            if (isPlaying) {
                showNotification('Audio stream interrupted, retrying...', 'warning');
                setTimeout(() => {
                    lofiAudio.src = 'https://lofi.cafe/api/stream';
                    lofiAudio.play();
                }, 2000);
            }
        });
        
        // Load track info on initialization
        loadCurrentTrack();
        
        // Refresh track info periodically
        setInterval(loadCurrentTrack, 30000); // Every 30 seconds
    }

    // TaskPlanner Implementation
    function initializeTaskPlanner() {
        const taskTitleInput = document.getElementById('task-title');
        const taskTimeSlotInput = document.getElementById('task-time-slot');
        const taskDescriptionInput = document.getElementById('task-description');
        const taskPrioritySelect = document.getElementById('task-priority');
        const addTaskBtn = document.getElementById('add-task');
        const tasksList = document.getElementById('tasks-list');
        
        async function loadTasks() {
            try {
                const response = await fetch('/api/tasks');
                const tasks = await response.json();
                
                tasksList.innerHTML = tasks.map(task => {
                    const priorityColors = {
                        low: 'bg-blue-500',
                        medium: 'bg-yellow-500',
                        high: 'bg-red-500'
                    };
                    
                    return `
                        <div class="flex items-center justify-between bg-dark-500 px-3 py-3 rounded ${task.completed ? 'opacity-60' : ''}">
                            <div class="flex items-center space-x-3 flex-1">
                                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                                       onchange="toggleTaskCompletion(${task.id}, this.checked)"
                                       class="w-4 h-4 text-accent-600 bg-dark-400 border-gray-300 rounded focus:ring-accent-500">
                                <div class="flex-1">
                                    <div class="flex items-center space-x-2 mb-1">
                                        <span class="text-white text-sm font-medium ${task.completed ? 'line-through' : ''}">${task.title}</span>
                                        <span class="w-2 h-2 ${priorityColors[task.priority]} rounded-full"></span>
                                        <span class="text-xs text-gray-400 capitalize">${task.priority}</span>
                                    </div>
                                    ${task.description ? `<div class="text-gray-400 text-xs mb-1">${task.description}</div>` : ''}
                                    ${task.timeSlot ? `<div class="text-purple-400 text-xs">⏰ ${task.timeSlot}</div>` : ''}
                                </div>
                            </div>
                            <button onclick="deleteTask(${task.id})" class="text-red-400 hover:text-red-300 text-xs ml-2">
                                Delete
                            </button>
                        </div>
                    `;
                }).join('');
            } catch (error) {
                showNotification('Failed to load tasks', 'error');
            }
        }
        
        addTaskBtn.addEventListener('click', async function() {
            const title = taskTitleInput.value.trim();
            const timeSlot = taskTimeSlotInput.value.trim();
            const description = taskDescriptionInput.value.trim();
            const priority = taskPrioritySelect.value;
            
            if (!title) {
                showNotification('Please enter a task title', 'warning');
                return;
            }
            
            try {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, timeSlot, description, priority })
                });
                
                if (response.ok) {
                    taskTitleInput.value = '';
                    taskTimeSlotInput.value = '';
                    taskDescriptionInput.value = '';
                    taskPrioritySelect.value = 'medium';
                    loadTasks();
                    showNotification(`Task "${title}" added successfully`, 'success');
                }
            } catch (error) {
                showNotification('Failed to add task', 'error');
            }
        });
        
        taskTitleInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTaskBtn.click();
            }
        });
        
        // Global functions for task actions
        window.toggleTaskCompletion = async function(id, completed) {
            try {
                const response = await fetch(`/api/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed })
                });
                
                if (response.ok) {
                    loadTasks();
                    showNotification(completed ? 'Task completed!' : 'Task marked as incomplete', 'info');
                }
            } catch (error) {
                showNotification('Failed to update task', 'error');
            }
        };
        
        window.deleteTask = async function(id) {
            try {
                const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadTasks();
                    showNotification('Task deleted', 'info');
                }
            } catch (error) {
                showNotification('Failed to delete task', 'error');
            }
        };
        
        loadTasks();
    }




    // Insights Dashboard Implementation
    function initializeInsightsDashboard() {
        const productiveTimeEl = document.getElementById('productive-time');
        const timeAwayEl = document.getElementById('time-away');
        const focusScoreEl = document.getElementById('focus-score');
        const pomodoroCountEl = document.getElementById('pomodoro-count');
        const sitesBlockedCountEl = document.getElementById('sites-blocked-count');
        const refreshInsightsBtn = document.getElementById('refresh-insights');
        
        async function loadInsights() {
            try {
                const response = await fetch('/api/insights');
                const insights = await response.json();
                
                // Display productive time in minutes
                productiveTimeEl.textContent = `${insights.totalProductiveTime}m`;
                
                // Display time away (distracted time from pauses)
                timeAwayEl.textContent = `${insights.timeAway}m`;
                
                // Display focus score (focused time vs total time)
                focusScoreEl.textContent = `${insights.focusScore}%`;
                
                // Display sessions completed today
                pomodoroCountEl.textContent = insights.pomodoroCount;
                
                // Display sites blocked count
                sitesBlockedCountEl.textContent = insights.sitesBlocked;
                
                // Update focus score color based on percentage
                if (insights.focusScore >= 80) {
                    focusScoreEl.className = 'text-xl font-bold text-green-500';
                } else if (insights.focusScore >= 60) {
                    focusScoreEl.className = 'text-xl font-bold text-yellow-500';
                } else if (insights.focusScore > 0) {
                    focusScoreEl.className = 'text-xl font-bold text-orange-500';
                } else {
                    focusScoreEl.className = 'text-xl font-bold text-gray-500';
                }
                
                // Update time away color based on amount
                if (insights.timeAway > 30) {
                    timeAwayEl.className = 'text-xl font-bold text-red-500';
                } else if (insights.timeAway > 10) {
                    timeAwayEl.className = 'text-xl font-bold text-yellow-500';
                } else {
                    timeAwayEl.className = 'text-xl font-bold text-green-500';
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

    // FocusFuel Motivational Quotes Implementation
    function initializeFocusFuel() {
        const quoteTextEl = document.getElementById('quote-text');
        const quoteAuthorEl = document.getElementById('quote-author');
        const getNewQuoteBtn = document.getElementById('get-new-quote');
        const nextQuoteTimerEl = document.getElementById('next-quote-timer');
        const focusFuelPopup = document.getElementById('focusfuel-popup');
        const focusFuelPopupQuote = document.getElementById('focusfuel-popup-quote');
        const focusFuelPopupAuthor = document.getElementById('focusfuel-popup-author');
        const focusFuelPopupDismiss = document.getElementById('focusfuel-popup-dismiss');
        
        let currentQuote = null;
        let nextQuoteTimeout = null;
        let lastQuoteTime = localStorage.getItem('lastQuoteTime') || 0;
        
        // Fallback quotes in case API fails
        const fallbackQuotes = [
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
            { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" }
        ];
        
        async function fetchQuote() {
            try {
                // Try to get quote from a free API
                const response = await fetch('https://api.quotable.io/random?tags=motivational|inspirational|success|wisdom');
                if (response.ok) {
                    const quote = await response.json();
                    return { text: quote.content, author: quote.author };
                } else {
                    throw new Error('API not available');
                }
            } catch (error) {
                // Fallback to local quotes
                return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
            }
        }
        
        async function loadNewQuote() {
            quoteTextEl.textContent = 'Loading new quote...';
            quoteAuthorEl.textContent = '';
            
            try {
                currentQuote = await fetchQuote();
                quoteTextEl.textContent = `"${currentQuote.text}"`;
                quoteAuthorEl.textContent = `— ${currentQuote.author}`;
                localStorage.setItem('lastQuoteTime', Date.now().toString());
                showNotification('New quote loaded', 'success');
            } catch (error) {
                showNotification('Failed to load quote', 'error');
                // Use fallback
                currentQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
                quoteTextEl.textContent = `"${currentQuote.text}"`;
                quoteAuthorEl.textContent = `— ${currentQuote.author}`;
            }
        }
        
        function showQuotePopup() {
            if (currentQuote) {
                focusFuelPopupQuote.textContent = `"${currentQuote.text}"`;
                focusFuelPopupAuthor.textContent = `— ${currentQuote.author}`;
                focusFuelPopup.classList.remove('hidden');
                
                // Auto-dismiss after 15 seconds
                setTimeout(() => {
                    if (!focusFuelPopup.classList.contains('hidden')) {
                        focusFuelPopup.classList.add('hidden');
                    }
                }, 15000);
                
                feather.replace();
            }
        }
        
        function updateTimer() {
            const now = Date.now();
            const lastQuote = parseInt(localStorage.getItem('lastQuoteTime') || '0');
            const hourInMs = 60 * 60 * 1000;
            const nextQuoteTime = lastQuote + hourInMs;
            const timeUntilNext = nextQuoteTime - now;
            
            if (timeUntilNext <= 0) {
                nextQuoteTimerEl.textContent = 'Ready for new quote!';
                loadNewQuote().then(() => {
                    showQuotePopup();
                });
            } else {
                const minutes = Math.floor(timeUntilNext / (60 * 1000));
                const seconds = Math.floor((timeUntilNext % (60 * 1000)) / 1000);
                nextQuoteTimerEl.textContent = `Next quote in: ${minutes}m ${seconds}s`;
            }
        }
        
        // Event handlers
        getNewQuoteBtn.addEventListener('click', loadNewQuote);
        
        focusFuelPopupDismiss.addEventListener('click', function() {
            focusFuelPopup.classList.add('hidden');
        });
        
        // Initialize quote system
        setInterval(updateTimer, 1000); // Update timer every second
        
        // Load initial quote if none exists or it's been more than an hour
        const now = Date.now();
        const lastQuote = parseInt(localStorage.getItem('lastQuoteTime') || '0');
        if (now - lastQuote >= 60 * 60 * 1000 || !lastQuote) {
            loadNewQuote();
        } else {
            // Load the last quote from storage if available
            const savedQuote = localStorage.getItem('currentQuote');
            if (savedQuote) {
                try {
                    currentQuote = JSON.parse(savedQuote);
                    quoteTextEl.textContent = `"${currentQuote.text}"`;
                    quoteAuthorEl.textContent = `— ${currentQuote.author}`;
                } catch (e) {
                    loadNewQuote();
                }
            } else {
                loadNewQuote();
            }
        }
        
        updateTimer();
        
        // Save current quote to localStorage for persistence
        function saveCurrentQuote() {
            if (currentQuote) {
                localStorage.setItem('currentQuote', JSON.stringify(currentQuote));
            }
        }
        
        // Update the loadNewQuote function to save the quote
        const originalLoadNewQuote = loadNewQuote;
        loadNewQuote = async function() {
            await originalLoadNewQuote();
            saveCurrentQuote();
        };
    }

    // SnapStudy PDF to Flashcards Implementation
    function initializeSnapStudy() {
        const pdfUploadEl = document.getElementById('pdf-upload');
        const mainPdfUploadEl = document.getElementById('main-pdf-upload');
        const browsePdfBtn = document.getElementById('browse-pdf');
        const generateFlashcardsBtn = document.getElementById('generate-flashcards');
        const mainGenerateFlashcardsBtn = document.getElementById('main-generate-flashcards');
        const openFlashcardsBtn = document.getElementById('open-flashcards');
        const openStudyModeBtn = document.getElementById('open-study-mode');
        const pdfStatusEl = document.getElementById('pdf-status');
        const uploadStatusEl = document.getElementById('upload-status');
        const flashcardResultsEl = document.getElementById('flashcard-results');
        const flashcardPreviewEl = document.getElementById('flashcard-preview');
        const flashcardInfoEl = document.getElementById('flashcard-info');
        const flashcardCountSelect = document.getElementById('flashcard-count');
        const difficultyLevelSelect = document.getElementById('difficulty-level');
        
        // Flashcard modal elements
        const flashcardModal = document.getElementById('flashcard-modal');
        const closeFlashcardModalBtn = document.getElementById('close-flashcard-modal');
        const flashcardContentEl = document.getElementById('flashcard-content');
        const flipCardBtn = document.getElementById('flip-card');
        const prevCardBtn = document.getElementById('prev-card');
        const nextCardBtn = document.getElementById('next-card');
        const cardCounterEl = document.getElementById('card-counter');
        
        let uploadedFile = null;
        let generatedFlashcards = [];
        let currentCardIndex = 0;
        let showingAnswer = false;
        

        
        function handleFileUpload(file) {
            if (file && file.type === 'application/pdf') {
                uploadedFile = file;
                const fileName = file.name;
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                
                if (pdfStatusEl) pdfStatusEl.textContent = `Selected: ${fileName} (${fileSize} MB)`;
                if (uploadStatusEl) uploadStatusEl.textContent = `Uploaded: ${fileName} (${fileSize} MB)`;
                
                // Enable generate buttons
                if (generateFlashcardsBtn) generateFlashcardsBtn.disabled = false;
                if (mainGenerateFlashcardsBtn) mainGenerateFlashcardsBtn.disabled = false;
                
                showNotification('PDF uploaded successfully', 'success');
            } else {
                showNotification('Please select a valid PDF file', 'error');
            }
        }
        
        async function generateFlashcards() {
            if (!uploadedFile) {
                showNotification('Please upload a PDF first', 'error');
                return;
            }
            
            const count = flashcardCountSelect ? parseInt(flashcardCountSelect.value) : 10;
            const difficulty = difficultyLevelSelect ? difficultyLevelSelect.value : 'medium';
            
            // Show loading state
            if (mainGenerateFlashcardsBtn) {
                mainGenerateFlashcardsBtn.textContent = 'Processing PDF...';
                mainGenerateFlashcardsBtn.disabled = true;
            }
            
            try {
                // Step 1: Upload and extract text from PDF
                const formData = new FormData();
                formData.append('pdf', uploadedFile);
                
                const uploadResponse = await fetch('/api/snapstudy/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload PDF');
                }
                
                const uploadResult = await uploadResponse.json();
                
                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || 'PDF processing failed');
                }
                
                // Update loading state
                if (mainGenerateFlashcardsBtn) {
                    mainGenerateFlashcardsBtn.textContent = 'Generating flashcards...';
                }
                
                // Step 2: Generate flashcards using AI
                const generateResponse = await fetch('/api/snapstudy/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        textContent: uploadResult.textContent,
                        count: count,
                        difficulty: difficulty
                    })
                });
                
                if (!generateResponse.ok) {
                    throw new Error('Failed to generate flashcards');
                }
                
                const generateResult = await generateResponse.json();
                
                if (!generateResult.success) {
                    throw new Error(generateResult.error || 'Flashcard generation failed');
                }
                
                generatedFlashcards = generateResult.flashcards || [];
                
                displayFlashcardResults();
                
                // Show appropriate success message based on generation source
                if (generateResult.source === 'text-analysis') {
                    showNotification(`Generated ${generatedFlashcards.length} flashcards using text analysis`, 'success');
                } else {
                    showNotification(`Generated ${generatedFlashcards.length} flashcards successfully`, 'success');
                }
                
            } catch (error) {
                console.error('Flashcard generation error:', error);
                showNotification(error.message || 'Failed to generate flashcards', 'error');
            } finally {
                if (mainGenerateFlashcardsBtn) {
                    mainGenerateFlashcardsBtn.textContent = 'Generate Flashcards';
                    mainGenerateFlashcardsBtn.disabled = false;
                }
            }
        }
        
        function displayFlashcardResults() {
            if (!flashcardResultsEl) return;
            
            flashcardResultsEl.classList.remove('hidden');
            
            if (flashcardInfoEl) {
                flashcardInfoEl.textContent = `${generatedFlashcards.length} flashcards ready for study`;
            }
            
            if (flashcardPreviewEl) {
                flashcardPreviewEl.innerHTML = generatedFlashcards.slice(0, 4).map(card => `
                    <div class="bg-dark-500 rounded-lg p-4 border border-dark-400">
                        <div class="text-blue-400 text-xs uppercase font-medium mb-2">Question ${card.id}</div>
                        <div class="text-white text-sm">${card.question}</div>
                        <div class="text-gray-400 text-xs mt-2">Difficulty: ${card.difficulty}</div>
                    </div>
                `).join('');
                
                if (generatedFlashcards.length > 4) {
                    flashcardPreviewEl.innerHTML += `
                        <div class="bg-dark-500 rounded-lg p-4 border border-dark-400 flex items-center justify-center">
                            <div class="text-gray-400 text-center">
                                <div class="text-lg font-bold">+${generatedFlashcards.length - 4}</div>
                                <div class="text-xs">more cards</div>
                            </div>
                        </div>
                    `;
                }
            }
            
            // Enable study mode button
            if (openStudyModeBtn) openStudyModeBtn.disabled = false;
            if (openFlashcardsBtn) openFlashcardsBtn.disabled = false;
        }
        
        function openStudyMode() {
            if (generatedFlashcards.length === 0) {
                showNotification('Generate flashcards first', 'error');
                return;
            }
            
            currentCardIndex = 0;
            showingAnswer = false;
            flashcardModal.classList.remove('hidden');
            displayCurrentCard();
            feather.replace();
        }
        
        function displayCurrentCard() {
            const card = generatedFlashcards[currentCardIndex];
            if (!card) return;
            
            if (showingAnswer) {
                flashcardContentEl.innerHTML = `
                    <div class="mb-4">
                        <div class="text-blue-400 text-sm uppercase font-medium mb-2">Question</div>
                        <div class="text-gray-300 mb-4">${card.question}</div>
                        <div class="text-green-400 text-sm uppercase font-medium mb-2">Answer</div>
                        <div class="text-white text-lg">${card.answer}</div>
                    </div>
                `;
                flipCardBtn.textContent = 'Next Question';
            } else {
                flashcardContentEl.innerHTML = `
                    <div class="text-blue-400 text-sm uppercase font-medium mb-4">Question ${card.id}</div>
                    <div class="text-white text-lg">${card.question}</div>
                `;
                flipCardBtn.textContent = 'Show Answer';
            }
            
            cardCounterEl.textContent = `${currentCardIndex + 1} / ${generatedFlashcards.length}`;
            
            // Update button states
            prevCardBtn.disabled = currentCardIndex === 0;
            nextCardBtn.disabled = currentCardIndex === generatedFlashcards.length - 1;
        }
        
        // Event handlers
        if (browsePdfBtn && mainPdfUploadEl) {
            browsePdfBtn.addEventListener('click', () => mainPdfUploadEl.click());
            mainPdfUploadEl.addEventListener('change', (e) => {
                if (e.target.files[0]) handleFileUpload(e.target.files[0]);
            });
        }
        
        if (pdfUploadEl) {
            pdfUploadEl.addEventListener('change', (e) => {
                if (e.target.files[0]) handleFileUpload(e.target.files[0]);
            });
        }
        
        if (generateFlashcardsBtn) {
            generateFlashcardsBtn.addEventListener('click', generateFlashcards);
        }
        
        if (mainGenerateFlashcardsBtn) {
            mainGenerateFlashcardsBtn.addEventListener('click', generateFlashcards);
        }
        
        if (openFlashcardsBtn) {
            openFlashcardsBtn.addEventListener('click', openStudyMode);
        }
        
        if (openStudyModeBtn) {
            openStudyModeBtn.addEventListener('click', openStudyMode);
        }
        
        if (closeFlashcardModalBtn) {
            closeFlashcardModalBtn.addEventListener('click', () => {
                flashcardModal.classList.add('hidden');
            });
        }
        
        if (flipCardBtn) {
            flipCardBtn.addEventListener('click', () => {
                if (showingAnswer) {
                    // Move to next card
                    if (currentCardIndex < generatedFlashcards.length - 1) {
                        currentCardIndex++;
                        showingAnswer = false;
                        displayCurrentCard();
                    }
                } else {
                    // Show answer
                    showingAnswer = true;
                    displayCurrentCard();
                }
            });
        }
        
        if (prevCardBtn) {
            prevCardBtn.addEventListener('click', () => {
                if (currentCardIndex > 0) {
                    currentCardIndex--;
                    showingAnswer = false;
                    displayCurrentCard();
                }
            });
        }
        
        if (nextCardBtn) {
            nextCardBtn.addEventListener('click', () => {
                if (currentCardIndex < generatedFlashcards.length - 1) {
                    currentCardIndex++;
                    showingAnswer = false;
                    displayCurrentCard();
                }
            });
        }
        
        // Drag and drop support
        const dropZone = document.querySelector('.border-dashed');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('border-blue-500', 'bg-blue-50');
            });
            
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-blue-500', 'bg-blue-50');
                
                const files = e.dataTransfer.files;
                if (files[0]) handleFileUpload(files[0]);
            });
        }
    }

    // Mobile Menu Implementation  
    function initializeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
                
                // Change icon
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