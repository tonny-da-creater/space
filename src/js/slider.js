$(".slider").slick({
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: false,
    dots: true,
    responsive: [
        {
            breakpoint: 1120,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3
            }
        },
        {
            breakpoint: 860,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            }
        }
    ]
});

$('.prev-slide').click(function (e) {
    $(".slider").slick('slickPrev');
});

$('.next-slide').click(function (e) {
    $(".slider").slick('slickNext');
});