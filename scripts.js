// Variables del carrusel
let currentSlide = 0;
let slides = [];
let totalSlides = 0;
let carousel = null;
let slideNumber = null;
let skillsNav = null;
let slideIndicators = null;

// Variables para el arrastre
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;

// Nombres de las habilidades (para la navegación)
const skillNames = [
    'Trabajo en equipo',
    'Resolutivo',
    'Trabajador',
    'Sociable',
    'Resolución conflictos',
    'Orientación servicio',
    'Trato cordial',
    'Movilidad geográfica',
    'Inglés'
];

// Mapeo de parámetros URL a índices
const skillMap = {
    'equipo': 0,
    'resolutivo': 1,
    'trabajador': 2,
    'sociable': 3,
    'conflictos': 4,
    'servicio': 5,
    'trato': 6,
    'movilidad': 7,
    'ingles': 8
};

// Función para crear los puntos de navegación
function createSkillDots() {
    if (!skillsNav) return;

    skillNames.forEach((name, index) => {
        const dot = document.createElement('div');
        dot.className = `skill-dot ${index === 0 ? 'active' : ''}`;

        // Guardar los nombres completos como atributos de datos
        dot.setAttribute('data-name-es', name);
        dot.setAttribute('data-name-en', getEnglishSkillName(index));

        let displayName = name;
        if (name === 'Resolución conflictos') displayName = 'Conflictos';
        else if (name === 'Orientación servicio') displayName = 'Servicio';
        else if (name === 'Trato cordial') displayName = 'Trato';
        else if (name === 'Movilidad geográfica') displayName = 'Movilidad';
        else displayName = name.split(' ')[0];

        dot.textContent = displayName;
        dot.title = name;
        dot.onclick = () => goToSlide(index);
        skillsNav.appendChild(dot);
    });
}

// Función auxiliar para obtener nombres en inglés de las habilidades
function getEnglishSkillName(index) {
    const englishNames = [
        'Teamwork',
        'Resourceful',
        'Hardworking',
        'Sociable',
        'Complaint and conflict resolution',
        'Customer service orientation',
        'Friendly and professional manner',
        'Geographic mobility',
        'English'
    ];
    return englishNames[index] || skillNames[index];
}

// Función para actualizar los puntos de navegación según el idioma
function updateSkillDotsLanguage(lang) {
    const dots = document.querySelectorAll('.skill-dot');
    const names = lang === 'es' ?
        ['Trabajo', 'Resolutivo', 'Trabajador', 'Sociable', 'Conflictos', 'Servicio', 'Trato', 'Movilidad', 'Inglés'] :
        ['Teamwork', 'Resourceful', 'Hardworking', 'Sociable', 'Conflict', 'Service', 'Manner', 'Mobility', 'English'];

    dots.forEach((dot, index) => {
        if (index < names.length) {
            dot.textContent = names[index];
            dot.title = lang === 'es' ? skillNames[index] : getEnglishSkillName(index);
        }
    });
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM cargado'); // Para depuración

    // Inicializar variables SOLO si existen en la página actual
    slides = document.querySelectorAll('.skill-slide');
    totalSlides = slides.length;
    carousel = document.getElementById('skillCarousel');
    slideNumber = document.getElementById('slideNumber');
    skillsNav = document.getElementById('skillsNav');
    slideIndicators = document.getElementById('slideIndicators');

    // Solo inicializar el carrusel si estamos en habilidades.html
    if (slides.length > 0 && carousel) {
        console.log('Inicializando carrusel con', totalSlides, 'slides');

        // Crear navegación por puntos
        createSkillDots();

        // Crear indicadores de progreso
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = `indicator ${i === 0 ? 'active' : ''}`;
            indicator.onclick = () => goToSlide(i);
            slideIndicators.appendChild(indicator);
        }

        // Comprobar parámetro URL
        const skillParam = getParameterByName('skill');
        if (skillParam && skillMap.hasOwnProperty(skillParam)) {
            const targetSlide = skillMap[skillParam];
            if (targetSlide >= 0 && targetSlide < totalSlides) {
                setTimeout(() => {
                    goToSlide(targetSlide);
                }, 100);
            }
        }

        // Inicializar eventos de arrastre
        initDragEvents();

        // Actualizar posición inicial
        updateCarousel();
    }

    // Inicializar sistema de idiomas (siempre)
    initLanguageSystem();
});

// Inicializar eventos de arrastre
function initDragEvents() {
    if (!carousel) return;

    // Prevenir el comportamiento por defecto del navegador al arrastrar imágenes
    carousel.addEventListener('dragstart', (e) => e.preventDefault());

    // Eventos para ratón
    carousel.addEventListener('mousedown', dragStart);
    carousel.addEventListener('mouseup', dragEnd);
    carousel.addEventListener('mouseleave', dragEnd);
    carousel.addEventListener('mousemove', drag);

    // Eventos para táctil (móvil/tablet)
    carousel.addEventListener('touchstart', dragStart);
    carousel.addEventListener('touchend', dragEnd);
    carousel.addEventListener('touchmove', drag);
    carousel.addEventListener('touchcancel', dragEnd);
}

// Inicio del arrastre
function dragStart(e) {
    if (!carousel) return;
    e.preventDefault();

    // Obtener posición inicial
    if (e.type === 'touchstart') {
        startPos = e.touches[0].clientX;
    } else {
        startPos = e.clientX;
    }

    isDragging = true;

    // Detener animación actual
    if (animationID) {
        cancelAnimationFrame(animationID);
    }

    // Guardar la posición actual
    prevTranslate = currentTranslate;

    // Añadir clase para cambiar cursor
    carousel.style.cursor = 'grabbing';
    carousel.classList.add('dragging');
}

// Durante el arrastre
function drag(e) {
    if (!isDragging || !carousel) return;

    e.preventDefault();

    let currentPosition;
    if (e.type === 'touchmove') {
        currentPosition = e.touches[0].clientX;
    } else {
        currentPosition = e.clientX;
    }

    // Calcular distancia arrastrada
    const diff = currentPosition - startPos;

    // Calcular nuevo desplazamiento (con límites)
    const slideWidth = carousel.offsetWidth;
    const maxTranslate = 0;
    const minTranslate = -(totalSlides - 1) * slideWidth;

    currentTranslate = prevTranslate + diff;

    // Aplicar límites para no arrastrar más allá del primer o último slide
    if (currentTranslate > maxTranslate) {
        currentTranslate = maxTranslate - (currentTranslate - maxTranslate) * 0.2; // Efecto elástico
    } else if (currentTranslate < minTranslate) {
        currentTranslate = minTranslate + (minTranslate - currentTranslate) * 0.2; // Efecto elástico
    }

    // Aplicar transformación
    carousel.style.transform = `translateX(${currentTranslate}px)`;
    carousel.style.transition = 'none';
}

// Fin del arrastre
function dragEnd(e) {
    if (!isDragging || !carousel) return;

    isDragging = false;
    carousel.style.cursor = 'grab';
    carousel.classList.remove('dragging');

    // Calcular a qué slide debemos ir
    const slideWidth = carousel.offsetWidth;
    const threshold = slideWidth * 0.2; // Si arrastra más del 20%, cambia de slide

    // Determinar el slide más cercano
    const movedBy = currentTranslate - prevTranslate;

    if (Math.abs(movedBy) > threshold) {
        // Cambiar de slide en la dirección del arrastre
        if (movedBy < 0) {
            currentSlide = Math.min(currentSlide + 1, totalSlides - 1);
        } else {
            currentSlide = Math.max(currentSlide - 1, 0);
        }
    }

    // Ir al slide correspondiente
    goToSlide(currentSlide);
}

// Función para mover el carrusel
function moveSlide(direction) {
    if (!slides.length) return;

    slides.forEach(slide => slide.classList.remove('selected'));

    currentSlide += direction;

    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }

    updateCarousel();

    slides[currentSlide].classList.add('selected');
    setTimeout(() => {
        slides[currentSlide].classList.remove('selected');
    }, 1000);
}

// Función para ir a un slide específico
function goToSlide(index) {
    if (!slides.length) return;

    slides.forEach(slide => slide.classList.remove('selected'));

    currentSlide = index;
    updateCarousel();

    slides[currentSlide].classList.add('selected');
    setTimeout(() => {
        slides[currentSlide].classList.remove('selected');
    }, 1000);
}

// Actualizar carrusel y elementos de navegación
function updateCarousel() {
    if (!carousel || !slides.length) return;

    // Calcular la posición exacta
    const slideWidth = carousel.offsetWidth;
    currentTranslate = -currentSlide * slideWidth;

    // Aplicar transformación con transición suave
    carousel.style.transform = `translateX(${currentTranslate}px)`;
    carousel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    // Actualizar número de slide si existe
    if (slideNumber) {
        const lang = localStorage.getItem('preferred-language') || 'es';
        const textHabilidad = lang === 'es' ? 'Habilidad' : 'Skill';
        const textDe = lang === 'es' ? 'de' : 'of';
        slideNumber.innerHTML = `${textHabilidad} ${currentSlide + 1} ${textDe} ${totalSlides}`;
    }

    // Actualizar dots de navegación
    document.querySelectorAll('.skill-dot').forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // Actualizar indicadores
    document.querySelectorAll('.indicator').forEach((ind, index) => {
        if (index === currentSlide) {
            ind.classList.add('active');
        } else {
            ind.classList.remove('active');
        }
    });
}

// Función para obtener parámetros de la URL
function getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Teclado: flechas izquierda/derecha
document.addEventListener('keydown', (e) => {
    if (slides.length > 0 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        if (e.key === 'ArrowLeft') {
            moveSlide(-1);
        } else if (e.key === 'ArrowRight') {
            moveSlide(1);
        }
    }
});

// Actualizar posición al redimensionar la ventana
window.addEventListener('resize', () => {
    if (carousel) {
        updateCarousel();
    }
});

// Hacer funciones globales para los onclick
window.moveSlide = moveSlide;
window.goToSlide = goToSlide;

// ===== SISTEMA DE IDIOMAS =====

// Cambiar idioma
function changeLanguage(lang) {
    console.log('Cambiando idioma a:', lang); // Para depuración

    // Actualizar el texto del botón
    const selectedSpan = document.getElementById('selected-lang');
    if (selectedSpan) {
        selectedSpan.textContent = lang === 'es' ? 'Español' : 'English';
    }

    // Cambiar textos de elementos con atributos data-es y data-en
    document.querySelectorAll('[data-es][data-en]').forEach(element => {
        if (element.tagName === 'SCRIPT') return;
        element.textContent = element.getAttribute(`data-${lang}`);
    });

    // Cambiar tooltips
    document.querySelectorAll('[data-tooltip-es][data-tooltip-en]').forEach(element => {
        element.setAttribute('data-tooltip', element.getAttribute(`data-tooltip-${lang}`));
    });

    // Cambiar placeholders (si los hay)
    document.querySelectorAll('[placeholder-es][placeholder-en]').forEach(element => {
        element.setAttribute('placeholder', element.getAttribute(`placeholder-${lang}`));
    });

    // Actualizar puntos de navegación
    updateSkillDotsLanguage(lang);

    // Actualizar número de slide
    if (slideNumber && slides.length > 0) {
        const textHabilidad = lang === 'es' ? 'Habilidad' : 'Skill';
        const textDe = lang === 'es' ? 'de' : 'of';
        slideNumber.innerHTML = `${textHabilidad} ${currentSlide + 1} ${textDe} ${totalSlides}`;
    }

    // Guardar preferencia
    localStorage.setItem('preferred-language', lang);

    // Cerrar el desplegable después de seleccionar
    const dropdown = document.querySelector('.language-dropdown');
    if (dropdown) dropdown.classList.remove('active');

    // Actualiza también los enlaces de descarga que tengan versión por idioma
    document.querySelectorAll(`[data-href-${lang}]`).forEach(el => {
    el.setAttribute('href', el.getAttribute(`data-href-${lang}`));
  });
}

// Inicializar sistema de idiomas
function initLanguageSystem() {
    console.log('Inicializando sistema de idiomas');

    let savedLang = localStorage.getItem('preferred-language');

    if (!savedLang) {
        // Primera visita: nadie ha elegido idioma todavía → detectar por navegador
        const browserLang = navigator.language.slice(0, 2);
        savedLang = browserLang === 'es' ? 'es' : 'en';
    }

    // Event listener para el botón del desplegable
    const dropdownBtn = document.querySelector('.dropdown-btn');
    if (dropdownBtn) {
        dropdownBtn.onclick = function (e) {
            e.stopPropagation();
            document.querySelector('.language-dropdown').classList.toggle('active');
        };
    }

    // Cerrar al hacer clic fuera
    document.onclick = function (event) {
        const dropdown = document.querySelector('.language-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    };

    // Aplicar idioma detectado o guardado
    changeLanguage(savedLang);
}

