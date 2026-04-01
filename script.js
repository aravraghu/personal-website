// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Simple form handling (for demo purposes)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const message = String(formData.get('message') || '').trim();

        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                alert('Message sent successfully!');
                contactForm.reset();
            } else {
                alert('Error sending message. Please try again later.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the message. Please try again later.');
        }
    });
}

// Add animation on scroll
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

// Observe sections for animation
document.querySelectorAll('section > .container').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Portfolio item hover effect
document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Project dialog
const projectDialog = document.getElementById('project-dialog');
const projectTitle = document.getElementById('project-dialog-title');
const projectSummary = document.getElementById('project-dialog-summary');
const projectDetails = document.getElementById('project-dialog-details');
const projectGallery = document.getElementById('project-gallery');
const projectCloseButton = document.querySelector('.project-dialog-close');

if (projectDialog && projectTitle && projectSummary && projectDetails && projectCloseButton) {
    const openProjectDialog = (projectCard) => {
        projectTitle.textContent = projectCard.dataset.projectTitle || 'Project Title';
        projectSummary.textContent = projectCard.dataset.projectSummary || '';
        projectDetails.textContent = projectCard.dataset.projectDetails || '';

        // Clear and populate gallery
        projectGallery.innerHTML = '';
        const galleryImages = (projectCard.dataset.projectGallery || '').split(',').map(img => img.trim()).filter(img => img);
        galleryImages.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = projectCard.dataset.projectTitle + ' screenshot';
            projectGallery.appendChild(img);
        });

        projectDialog.showModal();
    };

    document.querySelectorAll('.projects-item').forEach((projectCard) => {
        projectCard.addEventListener('click', () => {
            openProjectDialog(projectCard);
        });

        projectCard.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openProjectDialog(projectCard);
            }
        });
    });

    projectCloseButton.addEventListener('click', () => {
        projectDialog.close();
    });

    projectDialog.addEventListener('click', (event) => {
        const dialogBox = projectDialog.querySelector('.project-dialog-content');
        if (dialogBox && !dialogBox.contains(event.target)) {
            projectDialog.close();
        }
    });
}
