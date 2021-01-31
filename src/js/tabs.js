$(document).ready(function () {
    $(".tabs-nav__item").click(function (e) {
        e.preventDefault();

        $(".tabs-nav__item").removeClass("active");
        $(".tabs-content__item").removeClass("active");

        $(this).addClass("active");
        $($(this).attr('href')).addClass('active');
    });

    $(".tabs-nav__item:first").click();
});