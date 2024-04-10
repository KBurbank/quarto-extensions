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
    body.insertBefore(header, reveal);
    let footer = document.querySelector("div.reveal-footer");
    body.appendChild(footer)



    let chalkboard = document.querySelectorAll("div.chalkboard-button")

    chalkboard.forEach((button) => {
      footer.prepend(button);
    });

    let palettes = document.querySelectorAll("div.palette")
    palettes.forEach((palette) => {
      footer.append(palette);
    })
 

    let menu = document.querySelector("div.slide-menu-button");
    if (menu != null) {
    footer.prepend(menu)
    }

   



    logo_img = document.querySelector('.header-logo img');
    if (logo_img.getAttribute('src') == null) {
      if (logo_img?.getAttribute('data-src') != null) {
        logo_img.src = logo_img?.getAttribute('data-src') || "";
        logo_img.removeAttribute('data-src');
      };
    };
  };

  function linkify_logo(logo, href) {
    const logo_cloned = logo.cloneNode(true);
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.appendChild(logo_cloned);
    logo.replaceWith(link);
  };


  


  // add the class inverse-header for slide with has-dark-background class
  // otherwise remove it.
  function add_class(has_dark, header_paras) {
    header_paras.forEach(el => {
      el.classList.remove('inverse-header');
      if (has_dark) {
        el.classList.add('inverse-header');
      };
    });
  };


  // dynamically changing the header
  function change_header(dheader, cheader, ctext) {
    // dhead => dynamic header
    // chead => constant header
    // ctext => contstant header_text inner html
    if (dheader !== null) {
      cheader.innerHTML = dheader.innerHTML;
    } else {
      cheader.innerHTML = ctext;
    };

  

  };

  function hide_from_title_slide(element) {
    Reveal.on('slidechanged', event => {
      if (event.currentSlide.matches('#title-slide')) {
        element.style.visibility = 'hidden';
      } else {
        element.style.visibility = 'visible';
      }
    });
  };

  function get_clean_attrs(elem, attrName) {
    let attrVal = elem.getAttribute(attrName);
    if (attrVal != null) {
      elem.removeAttribute(attrName);
    }
    return attrVal;
  };


  if (Reveal.isReady()) {
   // Reveal.initialize({
    //  disableLayout: false
   // });

    add_header();


    
    /*************** linkifying the header and footer logo ********************/
    const header_logo = document.querySelector('div.header-logo');
    if (header_logo != null) {
      const header_logo_link = get_clean_attrs(header_logo, 'data-header-logo-link');
      const footer_logo_link = get_clean_attrs(header_logo, 'data-footer-logo-link');

      if (header_logo_link != null) {
        const header_logo_img = document.querySelector('div.header-logo img');
        linkify_logo(header_logo_img, header_logo_link);
      };

      if (footer_logo_link != null) {
        const footer_logo_img = document.querySelector('img.slide-logo');
        footer_logo_img.setAttribute('style', "z-index:99;");
        linkify_logo(footer_logo_img, footer_logo_link);
      };
    };
    /****************************** END ***************************************/

    if (document.querySelector('div.reveal.has-logo') != null) {
      var slide_number = document.querySelector('div.slide-number');
      var header = document.querySelector("div.reveal-header");
      header.appendChild(slide_number);
    };

    // Get the default header text element and innner HTML (i.e. literal text)
    var header_text = document.querySelector("div.header-text p");
    if (header_text != null){
      const header_inner_html = header_text.innerHTML;
    }
    var header_paras = document.querySelectorAll("div.reveal-header p");
    var dark = Reveal.getCurrentSlide().classList.contains('has-dark-background');
    add_class(dark, header_paras);

    Reveal.on('slidechanged', event => {
      var has_dark = event.currentSlide.classList.contains('has-dark-background');
      add_class(has_dark, header_paras);
    });

    // make the visibility of slide specific header text defined in slide body none
    document.querySelectorAll('div.header').forEach(el => {
      el.style.display = 'none';
    });


    // change the header if currently loaded slide has the header div defined
    // which won't be captured by slidechanged event unless we change slides.
    let dynamic_header = Reveal.getCurrentSlide().querySelector('div.header p');

    //change_header(dynamic_header, header_text, header_inner_html);

    //Reveal.on('slidechanged', event => {
     // let dyn_header = event.currentSlide.querySelector('div.header p');
      //  change_header(dyn_header, header_text, header_inner_html);

      // set the margin-top property of the first div with class "styles" to equal clientHeight

   // });


    /************** header text in title slide if title or ***********************/
    /*************  subtitle is used as header text        ***********************/

    var title_text = document.querySelector('.reveal-header .title-text p');
    if (title_text != null) {
      title_text.style.visibility = 'hidden';
      hide_from_title_slide(title_text);
    };

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

  };
};


window.addEventListener("load", (event) => {
  header();
});
