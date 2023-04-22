let slideIndex = 0;
let currentElement = null;
let hasUserSeenSpotlight = false;


document.addEventListener('DOMContentLoaded', function() {
  const popup = document.getElementById('popup');
  const closeBtn = document.getElementById('close');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const slides = document.querySelector('.slides');

  const hasSeenInfoBox = localStorage.getItem('hasSeenInfoBox');
  if (hasSeenInfoBox) {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
    const spotlight = document.querySelector('.spotlight');
    if (spotlight) {
      spotlight.style.display = 'none';
    }
  }
  


closeBtn.addEventListener('click', function() {
  if (currentElement) {
    currentElement.classList.remove('focused');
  }

  const spotlightElement = document.querySelector('.spotlight');
  if (spotlightElement) {
    spotlightElement.classList.remove('spotlight');
  }

  const spotlight = document.querySelector('.spotlight');
  if (spotlight) {
    spotlight.style.display = 'none';
  }

  popup.style.display = 'none';
  localStorage.setItem('hasSeenInfoBox', 'true');
});



    prevBtn.addEventListener('click', function() {
        slideIndex = Math.max(0, slideIndex - 1);
        updateSlide();
    });

    nextBtn.addEventListener('click', function() {
        slideIndex = Math.min(slides.children.length - 1, slideIndex + 1);
        updateSlide();
    });

    function updateSlide() {
    const slideWidth = slides.children[0].offsetWidth;
    slides.style.transform = `translateX(-${slideWidth * slideIndex}px)`;

    const animatedTexts = document.querySelectorAll('.animated-text');
    animatedTexts.forEach(text => {
        text.classList.remove('slide-1-animation');
    });

    const currentSlide = slides.children[slideIndex];
    const currentAnimatedTexts = currentSlide.querySelectorAll('.animated-text');
    currentAnimatedTexts.forEach((text, index) => {
        setTimeout(() => {
            text.classList.add('slide-1-animation');
        }, 200 * (index + 1));
    });

    if (slideIndex === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-block';
    }

    if (slideIndex === slides.children.length - 1) {
        nextBtn.style.display = 'none';
        closeBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        closeBtn.style.display = 'none';
    }
}

updateSlide();


});



function setSpotlight(element) {
  if (currentElement) {
    if (currentElement.classList.contains('toggle-label')) {
      currentElement.parentElement.classList.remove('focused');
    } else {
      currentElement.classList.remove('focused');
    }
  }

  if (!element) {
    currentElement = null;
    return;
  }

  currentElement = element;
  if (currentElement.classList.contains('toggle-label')) {
    currentElement.parentElement.classList.add('focused');
  } else {
    currentElement.classList.add('focused');
  }
}



function updateSpotlight() {
  const hasSeenHelp = localStorage.getItem('hasSeenHelp');
  if (hasSeenHelp === 'true') {
    return;
  }

  setTimeout(() => {
    const currentIndex = getCurrentSlideIndex();

    if (hasUserSeenSpotlight) {
      setSpotlight(null);
      return;
    }

    if (currentIndex === 0) {
      setSpotlight(null);
    } else if (currentIndex === 1) {
      setSpotlight(document.getElementById('modal-btn'));
    } else if (currentIndex === 2) {
      setSpotlight(document.getElementById('toggleAgregarProducto'));
    } else if (currentIndex === 3) {
      setSpotlight(document.querySelector('.toggle-switch'));
      setSpotlight(document.querySelector('.toggle-label'));
    } else if (currentIndex === 4) {
      setSpotlight(document.getElementById('facturar-btn'));
    }
  }, 150);
}


document.getElementById('next').addEventListener('click', () => {
  updateSpotlight();
});

document.getElementById('prev').addEventListener('click', () => {
  updateSpotlight();
});

document.getElementById('close').addEventListener('click', () => {
  localStorage.setItem('hasSeenInfoBox', true);
});



function getCurrentSlideIndex() {
  return slideIndex;
}

function hideSpotlight() {
  const spotlightElement = document.querySelector('.spotlight');
  if (spotlightElement) {
    spotlightElement.classList.remove('spotlight');
  }
  hasUserSeenSpotlight = true;
}



document.getElementById('entendido').addEventListener('click', () => {
  localStorage.setItem('hasSeenInfoBox', true);
});

updateSpotlight();
