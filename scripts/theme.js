const themeOpt = $$('.theme-option');
if (localStorage.getItem('PintarKilattheme')) {
    $('body').setAttribute('data-theme', localStorage.getItem('PintarKilattheme'));
}
if (themeOpt) {
    themeOpt.forEach(option => {
        option.onclick = () => {
            $('body').setAttribute('data-theme', option.getAttribute('data-theme'));
            localStorage.setItem('PintarKilattheme', option.getAttribute('data-theme'));
        }
    })
}
