// Supabase Configuration
const SUPABASE_URL = 'https://qrwezhxprmqaumtjzuwp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyd2V6aHhwcm1xYXVtdGp6dXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQ4NTcsImV4cCI6MjA3ODYwMDg1N30.anslYAmwoDGotAg_8mMJ0hcU2UARHCpQbJM3HePYOyo';

// Initialize Supabase client
let supabaseClient = null;
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'Sfe7Q8NfcgvCBNI_g';
const EMAILJS_SERVICE_ID = 'service_r4yjvvj';
const EMAILJS_CUSTOMER_TEMPLATE_ID = 'template_mxcg0l5'; // Customer confirmation template
const EMAILJS_BUSINESS_TEMPLATE_ID = 'template_in0x0ko'; // Business notification template
const BUSINESS_EMAIL = 'benedekmolnar2018@gmail.com';

// Initialize EmailJS if available (EmailJS v4+)
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
} else {
    console.warn('EmailJS library not loaded');
}

// Function to send booking confirmation emails
async function sendBookingEmails(bookingData) {
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS not loaded. Skipping email notifications.');
        return;
    }

    try {
        // Service name mapping for email
        const serviceNames = {
            'full-grooming': 'Teljes Kozmetikai Csomag',
            'bath-brush': 'Fürdés és Fésülés',
            'nail-trimming': 'Körömvágás',
            'ear-cleaning': 'Fül Tisztítás',
            'teeth-cleaning': 'Fog Tisztítás',
            'puppy-groom': 'Kölyök Első Kozmetika'
        };

        const serviceName = serviceNames[bookingData.service] || bookingData.service;
        const dateFormatted = new Date(bookingData.date + 'T' + bookingData.time).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Send confirmation email to customer
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CUSTOMER_TEMPLATE_ID, {
            to_email: bookingData.email,
            to_name: bookingData.ownerName,
            reply_to: BUSINESS_EMAIL,
            service: serviceName,
            date: bookingData.date,
            time: bookingData.time,
            date_formatted: dateFormatted,
            dog_name: bookingData.dogName,
            dog_breed: bookingData.dogBreed || 'Nincs megadva',
            dog_size: bookingData.dogSize,
            special_notes: bookingData.specialNotes || 'Nincs',
            phone: bookingData.phone
        }, {
            publicKey: EMAILJS_PUBLIC_KEY
        });

        // Send notification email to business
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_BUSINESS_TEMPLATE_ID, {
            to_email: BUSINESS_EMAIL,
            to_name: 'Bűbáj-Kutyakozmetika',
            owner_name: bookingData.ownerName,
            owner_email: bookingData.email,
            owner_phone: bookingData.phone,
            service: serviceName,
            date: bookingData.date,
            time: bookingData.time,
            date_formatted: dateFormatted,
            dog_name: bookingData.dogName,
            dog_breed: bookingData.dogBreed || 'Nincs megadva',
            dog_size: bookingData.dogSize,
            special_notes: bookingData.specialNotes || 'Nincs'
        }, {
            publicKey: EMAILJS_PUBLIC_KEY
        });

        console.log('Booking confirmation emails sent successfully');
    } catch (error) {
        console.error('Error sending emails:', error);
        // Don't show error to user - booking is already saved
    }
}

// Helper function to format date in local timezone (YYYY-MM-DD)
function formatDateLocal(date) {
    if (typeof date === 'string') {
        return date; // Already a string
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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

    // Hide/show required asterisks based on field validity
    function updateAsteriskVisibility() {
        // Handle date and time separately
        const dateTimeGroup = document.querySelector('.calendar-group');
        if (dateTimeGroup) {
            const dateTimeLabel = dateTimeGroup.querySelector('label');
            const dateTimeAsterisk = dateTimeLabel?.querySelector('.required-asterisk');
            if (dateTimeAsterisk) {
                const dateInput = document.getElementById('selectedDate');
                const timeInput = document.getElementById('selectedTime');
                const bothValid = dateInput?.value && timeInput?.value;
                dateTimeAsterisk.classList.toggle('hidden', !!bothValid);
            }
        }
        
        // Handle other required fields
        const requiredFields = document.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            // Skip hidden date/time inputs as they're handled above
            if (field.id === 'selectedDate' || field.id === 'selectedTime') {
                return;
            }
            
            const label = field.closest('.form-group')?.querySelector('label');
            if (label) {
                const asterisk = label.querySelector('.required-asterisk');
                if (asterisk) {
                    let isValid = false;
                    
                    if (field.tagName === 'SELECT') {
                        // For select fields, check if a value is selected (not empty)
                        isValid = field.value !== '';
                    } else if (field.type === 'email') {
                        // For email, check validity and non-empty
                        isValid = field.validity.valid && field.value.trim() !== '';
                    } else {
                        // For text inputs, check if not empty
                        isValid = field.value.trim() !== '';
                    }
                    
                    asterisk.classList.toggle('hidden', isValid);
                }
            }
        });
    }

    // Set Hungarian validation messages for form fields
    function setHungarianValidationMessages() {
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            // Service selection
            const serviceField = document.getElementById('service');
            if (serviceField) {
                serviceField.addEventListener('invalid', function() {
                    if (this.value === '') {
                        this.setCustomValidity('Kérjük, válasszon szolgáltatást!');
                    } else {
                        this.setCustomValidity('');
                    }
                });
                serviceField.addEventListener('change', function() {
                    this.setCustomValidity('');
                });
            }

            // Date and time
            const dateInput = document.getElementById('selectedDate');
            const timeInput = document.getElementById('selectedTime');
            if (dateInput) {
                dateInput.addEventListener('invalid', function() {
                    this.setCustomValidity('Kérjük, válasszon dátumot!');
                });
            }
            if (timeInput) {
                timeInput.addEventListener('invalid', function() {
                    this.setCustomValidity('Kérjük, válasszon időpontot!');
                });
            }

            // Dog name
            const dogNameField = document.getElementById('dogName');
            if (dogNameField) {
                dogNameField.addEventListener('invalid', function() {
                    if (this.value.trim() === '') {
                        this.setCustomValidity('Kérjük, töltse ki ezt a mezőt!');
                    } else {
                        this.setCustomValidity('');
                    }
                });
                dogNameField.addEventListener('input', function() {
                    if (this.value.trim() !== '') {
                        this.setCustomValidity('');
                    }
                });
            }

            // Dog size
            const dogSizeField = document.getElementById('dogSize');
            if (dogSizeField) {
                dogSizeField.addEventListener('invalid', function() {
                    if (this.value === '') {
                        this.setCustomValidity('Kérjük, válasszon méretet!');
                    } else {
                        this.setCustomValidity('');
                    }
                });
                dogSizeField.addEventListener('change', function() {
                    this.setCustomValidity('');
                });
            }

            // Owner name
            const ownerNameField = document.getElementById('ownerName');
            if (ownerNameField) {
                ownerNameField.addEventListener('invalid', function() {
                    if (this.value.trim() === '') {
                        this.setCustomValidity('Kérjük, töltse ki ezt a mezőt!');
                    } else {
                        this.setCustomValidity('');
                    }
                });
                ownerNameField.addEventListener('input', function() {
                    if (this.value.trim() !== '') {
                        this.setCustomValidity('');
                    }
                });
            }

            // Email
            const emailField = document.getElementById('email');
            if (emailField) {
                emailField.addEventListener('invalid', function() {
                    if (this.value.trim() === '') {
                        this.setCustomValidity('Kérjük, töltse ki ezt a mezőt!');
                    } else if (!this.validity.valid) {
                        this.setCustomValidity('Kérjük, adjon meg érvényes email címet!');
                    } else {
                        this.setCustomValidity('');
                    }
                });
                emailField.addEventListener('input', function() {
                    if (this.validity.valid) {
                        this.setCustomValidity('');
                    }
                });
            }

            // Phone
            const phoneField = document.getElementById('phone');
            if (phoneField) {
                phoneField.addEventListener('invalid', function() {
                    if (this.value.trim() === '') {
                        this.setCustomValidity('Kérjük, töltse ki ezt a mezőt!');
                    } else {
                        this.setCustomValidity('');
                    }
                });
                phoneField.addEventListener('input', function() {
                    if (this.value.trim() !== '') {
                        this.setCustomValidity('');
                    }
                });
            }
        }

        // Newsletter email validation
        const newsletterForms = document.querySelectorAll('#newsletterForm');
        newsletterForms.forEach(form => {
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput) {
                emailInput.addEventListener('invalid', function() {
                    if (this.value.trim() === '') {
                        this.setCustomValidity('Kérjük, töltse ki ezt a mezőt!');
                    } else if (!this.validity.valid) {
                        this.setCustomValidity('Kérjük, adjon meg érvényes email címet!');
                    } else {
                        this.setCustomValidity('');
                    }
                });
                emailInput.addEventListener('input', function() {
                    if (this.validity.valid) {
                        this.setCustomValidity('');
                    }
                });
            }
        });
    }

    // Set Hungarian validation messages (for both booking and newsletter forms)
    setHungarianValidationMessages();

    // Add event listeners to required fields
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {

        const requiredFields = bookingForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('input', updateAsteriskVisibility);
            field.addEventListener('change', updateAsteriskVisibility);
            field.addEventListener('blur', updateAsteriskVisibility);
        });
        
        // Also check when date/time are selected
        const selectedDateInput = document.getElementById('selectedDate');
        const selectedTimeInput = document.getElementById('selectedTime');
        if (selectedDateInput) {
            selectedDateInput.addEventListener('change', updateAsteriskVisibility);
        }
        if (selectedTimeInput) {
            selectedTimeInput.addEventListener('change', updateAsteriskVisibility);
        }
        
        // Initial check
        setTimeout(updateAsteriskVisibility, 100);
    }

    // Booking Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            // Check form validity first
            if (!bookingForm.checkValidity()) {
                e.preventDefault();
                // Find first invalid field and show its message
                const firstInvalid = bookingForm.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.reportValidity();
                }
                return;
            }

            e.preventDefault();
            
            // Get form data
            const formData = new FormData(bookingForm);
            const bookingData = {};
            formData.forEach((value, key) => {
                bookingData[key] = value;
            });

            // Validate that date and time are selected
            if (!bookingData.date || !bookingData.time) {
                const dateInput = document.getElementById('selectedDate');
                const timeInput = document.getElementById('selectedTime');
                if (!bookingData.date && dateInput) {
                    dateInput.setCustomValidity('Kérjük, válasszon dátumot!');
                    dateInput.reportValidity();
                } else if (!bookingData.time && timeInput) {
                    timeInput.setCustomValidity('Kérjük, válasszon időpontot!');
                    timeInput.reportValidity();
                }
                return;
            }

            // Create appointment object (matching database column names)
            const appointment = {
                service: bookingData.service,
                date: bookingData.date,
                time: bookingData.time,
                dog_name: bookingData.dogName,
                dog_breed: bookingData.dogBreed || null,
                dog_size: bookingData.dogSize,
                special_notes: bookingData.specialNotes || null,
                owner_name: bookingData.ownerName,
                email: bookingData.email,
                phone: bookingData.phone,
                status: 'pending'  // Explicitly set status
            };

            // Save to Supabase using database function (bypasses RLS)
            try {
                if (!supabaseClient) {
                    throw new Error('Supabase client not initialized. Please check your Supabase configuration.');
                }

                // Call the database function instead of direct insert
                const { data, error } = await supabaseClient.rpc('insert_booking', {
                    p_service: bookingData.service,
                    p_date: bookingData.date,
                    p_time: bookingData.time,
                    p_dog_name: bookingData.dogName,
                    p_dog_breed: bookingData.dogBreed || null,
                    p_dog_size: bookingData.dogSize,
                    p_special_notes: bookingData.specialNotes || null,
                    p_owner_name: bookingData.ownerName,
                    p_email: bookingData.email,
                    p_phone: bookingData.phone
                });

                if (error) {
                    console.error('Supabase error:', error);
                    alert('Hiba történt a foglalás mentése során: ' + error.message);
                    return;
                }

                // Success! Hide form and show success message
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

                console.log('Booking saved successfully with ID:', data);

                // Send confirmation emails
                await sendBookingEmails({
                    service: bookingData.service,
                    date: bookingData.date,
                    time: bookingData.time,
                    dogName: bookingData.dogName,
                    dogBreed: bookingData.dogBreed || '',
                    dogSize: bookingData.dogSize,
                    specialNotes: bookingData.specialNotes || '',
                    ownerName: bookingData.ownerName,
                    email: bookingData.email,
                    phone: bookingData.phone
                });

            } catch (error) {
                console.error('Error saving booking:', error);
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

            // Validate email
            if (!email || !emailInput.validity.valid) {
                emailInput.reportValidity();
                return;
            }

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

async function isTimeSlotBooked(date, time) {
    if (!supabaseClient) {
        console.error('Supabase client not initialized');
        return false;
    }
    
    try {
        const dateString = formatDateLocal(date);
        
        // Query for bookings on this date
        let { data, error } = await supabaseClient
            .from('bookings')
            .select('id, time, date, status')
            .eq('date', dateString);

        if (error) {
            console.error('Error checking bookings:', error);
            return false;
        }

        // Filter by status (only check pending/confirmed bookings)
        if (data && data.length > 0) {
            data = data.filter(booking => ['pending', 'confirmed'].includes(booking.status));
        }

        if (!data || data.length === 0) {
            return false;
        }

        // Check if any booking matches the time (handle format differences)
        // Database stores time as "11:00:00" but we check with "11:00"
        const timeMatch = data.some(booking => {
            const bookingTime = booking.time;
            
            // Handle both "09:00" and "09:00:00" formats
            if (typeof bookingTime === 'string') {
                // Remove seconds if present for comparison ("11:00:00" -> "11:00")
                const bookingTimeNoSeconds = bookingTime.substring(0, 5);
                return bookingTimeNoSeconds === time || bookingTime.startsWith(time);
            }
            return bookingTime === time;
        });

        return timeMatch;
    } catch (error) {
        console.error('Error in isTimeSlotBooked:', error);
        return false;
    }
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

    async function selectDate(date) {
        if (!isAvailableDate(date)) return;

        selectedDate = new Date(date);
        selectedTime = null;
        
        // Update hidden input (use local timezone format)
        const dateString = formatDateLocal(selectedDate);
        if (selectedDateInput) {
            selectedDateInput.value = dateString;
            selectedDateInput.dispatchEvent(new Event('change'));
        }
        if (selectedTimeInput) {
            selectedTimeInput.value = '';
            selectedTimeInput.dispatchEvent(new Event('change'));
        }

        // Show time slots
        await showTimeSlots();
        renderCalendar();
    }

    async function showTimeSlots() {
        if (!selectedDate) return;

        timeSlotsContainer.style.display = 'block';
        timeSlotsGrid.innerHTML = '';

        const timeSlots = generateTimeSlots();
        
        // Process time slots asynchronously
        for (const timeString of timeSlots) {
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
            const dateString = formatDateLocal(selectedDate);
            const isBooked = await isTimeSlotBooked(dateString, timeString);
            if (isBooked) {
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
                    selectedTimeInput.dispatchEvent(new Event('change'));
                }
            });

            timeSlotsGrid.appendChild(slotElement);
        }

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

