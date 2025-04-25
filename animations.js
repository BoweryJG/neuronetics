// Animations for NeuroStar Impact Report
// Uses Lottie for SVG animations and GSAP for element entrance effects

document.addEventListener('DOMContentLoaded', function() {
  // GSAP fade/slide in for sections
  if (window.gsap) {
    gsap.utils.toArray('section').forEach((section, i) => {
      gsap.from(section, {
        opacity: 0,
        y: 60,
        duration: 1.2,
        delay: 0.2 + i * 0.2,
        ease: 'power3.out',
        clearProps: 'all'
      });
    });
  }

  // Lottie Animations
  if (window.lottie) {
    // Clinical Results Visualization
    lottie.loadAnimation({
      container: document.getElementById('clinical-lottie'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'https://assets10.lottiefiles.com/packages/lf20_2ks3pjua.json' // Example: brain scan animation
    });

  }
});
