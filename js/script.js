// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // Calendar functionality for booking page
    initCalendar();

    // Booking Form Submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(bookingForm);
            const bookingData = {};
            formData.forEach((value, key) => {
                bookingData[key] = value;
            });

            // Validate that date and time are selected
            if (!bookingData.date || !bookingData.time) {
                alert('Kérjük, válasszon dátumot és időpontot!');
                return;
            }

            // Create appointment object
            const appointment = {
                id: Date.now().toString(),
                service: bookingData.service,
                date: bookingData.date,
                time: bookingData.time,
                dogName: bookingData.dogName,
                dogBreed: bookingData.dogBreed || '',
                dogSize: bookingData.dogSize,
                specialNotes: bookingData.specialNotes || '',
                ownerName: bookingData.ownerName,
                email: bookingData.email,
                phone: bookingData.phone,
                createdAt: new Date().toISOString()
            };

            // Save to localStorage
            if (saveAppointment(appointment)) {
                // Hide form and show success message
                bookingForm.style.display = 'none';
                const successMessage = document.getElementById('bookingSuccess');
                if (successMessage) {
                    successMessage.style.display = 'block';
                }

                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Refresh calendar to show booked slots
                if (typeof initCalendar === 'function') {
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }
            } else {
                alert('Hiba történt a foglalás mentése során. Kérjük, próbálja újra!');
            }
        });
    }

    // Newsletter Form Submission
    const newsletterForms = document.querySelectorAll('#newsletterForm');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value;

            // Here you would typically send the email to a server
            console.log('Newsletter subscription:', email);

            // Show feedback
            const button = form.querySelector('button');
            const originalText = button.textContent;
            button.textContent = 'Feliratkozva!';
            button.style.background = 'linear-gradient(135deg, var(--color-aqua), var(--color-blue))';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                emailInput.value = '';
            }, 2000);
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add animation on scroll (optional enhancement)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const animateElements = document.querySelectorAll('.service-card, .offer-item, .team-member, .value-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Local Storage Functions for Appointments
function getAppointments() {
    try {
        const appointments = localStorage.getItem('dogGroomingAppointments');
        return appointments ? JSON.parse(appointments) : [];
    } catch (error) {
        console.error('Error reading appointments from localStorage:', error);
        return [];
    }
}

function saveAppointment(appointment) {
    try {
        const appointments = getAppointments();
        appointments.push(appointment);
        localStorage.setItem('dogGroomingAppointments', JSON.stringify(appointments));
        return true;
    } catch (error) {
        console.error('Error saving appointment to localStorage:', error);
        return false;
    }
}

function getAppointmentsByDate(date) {
    const appointments = getAppointments();
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
}

function isTimeSlotBooked(date, time) {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const appointments = getAppointmentsByDate(dateString);
    return appointments.some(apt => apt.time === time);
}

function deleteAppointment(appointmentId) {
    try {
        const appointments = getAppointments();
        const filtered = appointments.filter(apt => apt.id !== appointmentId);
        localStorage.setItem('dogGroomingAppointments', JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting appointment from localStorage:', error);
        return false;
    }
}

function getAllAppointments() {
    return getAppointments();
}

// Calendar functionality
function initCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const calendarMonthYear = document.getElementById('calendarMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    const timeSlotsGrid = document.getElementById('timeSlotsGrid');
    const selectedDateInput = document.getElementById('selectedDate');
    const selectedTimeInput = document.getElementById('selectedTime');

    if (!calendarDays) return; // Not on booking page

    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;

    // Working hours: Monday-Friday, 9:00-18:00
    const WORK_START = 9;
    const WORK_END = 18;
    const SLOT_DURATION = 30; // minutes

    const monthNames = [
        'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
        'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
    ];

    function isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    }

    function isPastDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }

    function isAvailableDate(date) {
        if (isPastDate(date)) return false;
        if (isWeekend(date)) return false;
        return true;
    }

    function generateTimeSlots() {
        const slots = [];
        for (let hour = WORK_START; hour < WORK_END; hour++) {
            for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    }

    function formatTime(timeString) {
        // Return 24-hour format (e.g., 14:30)
        return timeString;
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

        calendarDays.innerHTML = '';

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const date = new Date(year, month - 1, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            if (isWeekend(date)) {
                dayElement.classList.add('weekend', 'disabled');
            } else if (isPastDate(date)) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => selectDate(date));
            }

            // Mark today
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            // Mark selected date
            if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }

            calendarDays.appendChild(dayElement);
        }

        // Next month days
        const totalCells = calendarDays.children.length;
        const remainingCells = 42 - totalCells; // 6 weeks * 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(year, month + 1, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        }
    }

    function selectDate(date) {
        if (!isAvailableDate(date)) return;

        selectedDate = new Date(date);
        selectedTime = null;
        
        // Update hidden input
        const dateString = selectedDate.toISOString().split('T')[0];
        if (selectedDateInput) {
            selectedDateInput.value = dateString;
        }
        if (selectedTimeInput) {
            selectedTimeInput.value = '';
        }

        // Show time slots
        showTimeSlots();
        renderCalendar();
    }

    function showTimeSlots() {
        if (!selectedDate) return;

        timeSlotsContainer.style.display = 'block';
        timeSlotsGrid.innerHTML = '';

        const timeSlots = generateTimeSlots();
        
        timeSlots.forEach(timeString => {
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.textContent = formatTime(timeString);
            slotElement.dataset.time = timeString;

            // Check if time is in the past for today
            if (selectedDate.toDateString() === new Date().toDateString()) {
                const now = new Date();
                const [hours, minutes] = timeString.split(':').map(Number);
                const slotTime = new Date();
                slotTime.setHours(hours, minutes, 0, 0);
                if (slotTime < now) {
                    slotElement.classList.add('disabled');
                }
            }

            // Check if time slot is already booked
            const dateString = selectedDate.toISOString().split('T')[0];
            if (isTimeSlotBooked(dateString, timeString)) {
                slotElement.classList.add('disabled');
                slotElement.textContent = formatTime(timeString) + ' (Foglalt)';
                slotElement.title = 'Ez az időpont már foglalt';
            }

            if (selectedTime === timeString) {
                slotElement.classList.add('selected');
            }

            slotElement.addEventListener('click', () => {
                if (slotElement.classList.contains('disabled')) return;
                
                // Remove previous selection
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.classList.remove('selected');
                });
                
                // Select new time
                slotElement.classList.add('selected');
                selectedTime = timeString;
                
                if (selectedTimeInput) {
                    selectedTimeInput.value = timeString;
                }
            });

            timeSlotsGrid.appendChild(slotElement);
        });

        // Scroll to time slots
        timeSlotsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function changeMonth(direction) {
        currentDate.setMonth(currentDate.getMonth() + direction);
        selectedDate = null;
        selectedTime = null;
        timeSlotsContainer.style.display = 'none';
        if (selectedDateInput) selectedDateInput.value = '';
        if (selectedTimeInput) selectedTimeInput.value = '';
        renderCalendar();
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => changeMonth(1));
    }

    // Initialize calendar
    renderCalendar();
}

