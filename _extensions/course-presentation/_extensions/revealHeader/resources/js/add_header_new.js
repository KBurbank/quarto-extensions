/**
 * reveal-header
 * A filter that adds header text and logo.
 * 
 * MIT License
 * Copyright (c) 2023-2024 Shafayet Khan Shafee.
 */

function header() {
  Reveal.configure({ embedded: true });
  
  // add the header structure as the firstChild of div.reveal-header
  function add_header() {
    let header = document.querySelector("div.reveal-header");
    let reveal = document.querySelector(".reveal");
    let body = document.querySelector(".quarto-light");
    
    // Create header if it doesn't exist
    if (!header) {
      header = document.createElement('div');
      header.className = 'reveal-header';
      // Add basic structure
      header.innerHTML = `
        <div class="header-logo"><img src="" /></div>
        <div class="sc-title"><p></p></div>
        <div id="reveal-header-text" class="header-text"><p></p></div>
        <div class="sb-title"><p></p></div>
        <div id="reveal-subheader" class="sub-title"><p></p></div>
      `;
    }
    
    // Insert header before reveal
    body.insertBefore(header, reveal);
    
    let footer = document.querySelector("div.reveal-footer");
    // Create footer if it doesn't exist
    if (!footer) {
      footer = document.createElement('div');
      footer.className = 'reveal-footer';
      footer.innerHTML = '<div class="footer-section"><p></p></div>';
    }
    body.appendChild(footer)

    // // Ensure the header-text div exists
    // if (!header.querySelector('.header-text')) {
    //   let headerTextDiv = document.createElement('div');
    //   headerTextDiv.className = 'header-text';
    //   header.appendChild(headerTextDiv);
    // }

    // Move chalkboard buttons to footer
    let chalkboard = document.querySelectorAll("div.chalkboard-button")
    chalkboard.forEach((button) => {
      footer.prepend(button);
    });

    // Move palettes to footer
    let palettes = document.querySelectorAll("div.palette")
    palettes.forEach((palette) => {
      footer.append(palette);
    })
 
    // Move menu button to footer
    let menu = document.querySelector("div.slide-menu-button");
    if (menu != null) {
      footer.prepend(menu)
    }

    // Set logo image source if needed
    logo_img = document.querySelector('.header-logo img');
    if (logo_img.getAttribute('src') == null) {
      if (logo_img?.getAttribute('data-src') != null) {
        logo_img.src = logo_img?.getAttribute('data-src') || "";
        logo_img.removeAttribute('data-src');
      }
    }
  }

  // Helper function to wrap logo in a link
  function linkify_logo(logo, href) {
    const logo_cloned = logo.cloneNode(true);
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.appendChild(logo_cloned);
    logo.replaceWith(link);
  }

  // add the class inverse-header for slide with has-dark-background class
  // otherwise remove it.
  function add_class(has_dark, header_paras) {
    header_paras.forEach(el => {
      el.classList.remove('inverse-header');
      if (has_dark) {
        el.classList.add('inverse-header');
      }
    });
  }

  // Fix LaTeX delimiters for MathJax
  function fixLatexDelimiters(text) {
    if (!text) return "";
    
    // Convert \(\) to $$ for inline math
    let result = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    
    // Convert \[\] to $$$$ for display math
    result = result.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
    
    return result;
  }

  // Extract text content from HTML, preserving LaTeX but removing HTML tags
  

  function hide_from_title_slide(element) {
    Reveal.on('slidechanged', event => {
      return;
      if (event.currentSlide.matches('#title-slide')) {
        element.style.visibility = 'hidden';
      } else {
        element.style.visibility = 'visible';
      }
    });
  }

  function get_clean_attrs(elem, attrName) {
    let attrVal = elem.getAttribute(attrName);
    if (attrVal != null) {
      elem.removeAttribute(attrName);
    }
    return attrVal;
  }



  // Create a mapping of each slide to its most recent h1 and h2 in document order
  function buildHeadingContext() {
    let slideHeadingContext = new Map();
    let currentH1 = "";
    let currentH2 = "";
    
    // Get all slides in document order
    const slides = Array.from(document.querySelectorAll('.reveal .slides section'));
    
    // Process each slide to create the heading context
    slides.forEach((slide) => {
      // Check if this slide has an h1
      const h1Element = slide.querySelector('h1');
      if (h1Element) {
        // Get the raw content
        currentH1 = h1Element.innerHTML;
        // Reset h2 when we encounter a new h1
        currentH2 = "";
      }
      
      // Check if this slide has an h2
      const h2Element = slide.querySelector('h2');
      if (h2Element) {
        // Get the raw content
        currentH2 = h2Element.innerHTML;
      }
      
      // Store the current heading context for this slide
      slideHeadingContext.set(slide, {
        h1: currentH1,
        h2: currentH2
      });
    });
    
    return slideHeadingContext;
  }
  
  // Function to update header and footer based on the pre-computed context
  function updateHeadersForSlide(slide, headingContext) {
    return;
    const context = headingContext.get(slide);
    
    if (!context) {
      return;
    }
    
    // Get the subheader element instead of header-text
    const subHeader = document.getElementById("reveal-subheader");
    const subHeaderPara = subHeader ? subHeader.querySelector("p") : null;
    
    // Clear header-text to avoid duplication
    const headerText = document.querySelector("div.header-text p");
    if (headerText) {
     // headerText.textContent = "";
    }
    
    const footerText = document.querySelector("div.reveal-footer p");
    headerText.innerHTML = context.h2;
  
    footerText.innerHTML = context.h1;

  }

  if (Reveal.isReady()) {
    add_header();
    
    /*************** linkifying the header and footer logo ********************/
    const header_logo = document.querySelector('div.header-logo');
    if (header_logo != null) {
      const header_logo_link = get_clean_attrs(header_logo, 'data-header-logo-link');
      const footer_logo_link = get_clean_attrs(header_logo, 'data-footer-logo-link');

      if (header_logo_link != null) {
        const header_logo_img = document.querySelector('div.header-logo img');
        linkify_logo(header_logo_img, header_logo_link);
      }

      if (footer_logo_link != null) {
        const footer_logo_img = document.querySelector('img.slide-logo');
        footer_logo_img.setAttribute('style', "z-index:99;");
        linkify_logo(footer_logo_img, footer_logo_link);
      }
    }
    /****************************** END ***************************************/

    if (document.querySelector('div.reveal.has-logo') != null) {
      var slide_number = document.querySelector('div.slide-number');
      var header = document.querySelector("div.reveal-header");
      header.appendChild(slide_number);
    }

    

    // Get the default header text element
    var header_text = document.querySelector("div.header-text p");
    var header_paras = document.querySelectorAll("div.reveal-header p");
    var dark = Reveal.getCurrentSlide().classList.contains('has-dark-background');
    add_class(dark, header_paras);

    // Build the heading context mapping for all slides
    const headingContext = buildHeadingContext();
    
    // Initialize headers based on current slide
    updateHeadersForSlide(Reveal.getCurrentSlide(), headingContext);

    Reveal.on('slidechanged', event => {
      var has_dark = event.currentSlide.classList.contains('has-dark-background');
      add_class(has_dark, header_paras);
      
      // Update headers based on the pre-computed context for this slide
      updateHeadersForSlide(event.currentSlide, headingContext);
    });

    /************** header text in title slide if title or ***********************/
    /*************  subtitle is used as header text        ***********************/

    var title_text = document.querySelector(' .title-text p');
    if (title_text != null) {
      title_text.style.visibility = 'hidden';
      hide_from_title_slide(title_text);
    }

    /*************** hide header text and logo on title slide ********************/

    var hide_header_text = document.querySelector('.header-text').getAttribute('data-hide-from-titleslide');
    var hide_header_logo = document.querySelector('.header-logo').getAttribute('data-hide-from-titleslide');

    if (hide_header_text == 'true') {
      header_text.style.visibility = 'hidden';
      hide_from_title_slide(header_text);
    }

    if (hide_header_logo == 'true') {
      logo_img.style.visibility = 'hidden';
      hide_from_title_slide(logo_img);
    }
  }
}

window.addEventListener("load", (event) => {
  // Add styling to ensure consistent appearance of MathJax content in header/footer
  const style = document.createElement('style');
  style.textContent = `
    .reveal-header .header-text .MathJax {
      color: inherit !important;
      font-size: inherit !important;
    }
    .reveal-header .header-text {
      width: 100%;
      text-align: center;
      overflow: hidden;
    }
    .reveal-header .header-text p {
      margin: 0;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .reveal-footer .MathJax {
      color: inherit !important;
      font-size: inherit !important;
    }
   
  `;
  document.head.appendChild(style);
  
  // Initialize header
  header();
  

  
});
