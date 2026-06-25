import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSlider() {
  const navigate = useNavigate();

  const slides = [
    {
      image: "/images/1.webp",
      title: "ALL HANDICRAFT",
      subtitle: "Beautiful Handmade Collection",
      link: "/all-handcraft",
    },
    {
      image: "/images/2.webp",
      title: "COLLECTION",
      subtitle: "Spring & Summer Collection",
      link: "/collection",
    },
    {
      image: "/images/3.webp",
      title: "DESIGN",
      subtitle: "Modern & Luxury Designs",
      link: "/design",
    },
    {
      image: "/images/4.webp",
      title: "CRAFT",
      subtitle: "Home Decor & Wall Art",
      link: "/craft",
    },
    {
      image: "/images/5.webp",
      title: "SALE",
      subtitle: "Flash Sale & Special Discounts",
      link: "/sale",
    },
    {
      image: "/images/6.webp",


      
      title: "STATE",
      subtitle: "Traditional Handicrafts From India",
      link: "/state",
    },
  ];

  return (
    <section className="bg-black pb-6 md:pb-8">
      <div className="max-w-[1800px] mx-auto px-2 sm:px-4">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          pagination={{ clickable: true }}
          navigation={true}
          className="rounded-xl md:rounded-[30px] overflow-hidden"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative cursor-pointer"
                onClick={() => navigate(slide.link)}
              >
                {/* Background Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-[250px] sm:h-[400px] md:h-[550px] lg:h-[750px] object-cover"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/30"></div>

                {/* Content */}
                <div className="absolute left-4 sm:left-8 md:left-12 lg:left-16 bottom-6 sm:bottom-10 md:bottom-16 text-white z-10">
                  <div className="bg-black/80 px-2 py-1 sm:px-4 sm:py-2 inline-block mb-2 sm:mb-4 text-[10px] sm:text-xs md:text-sm font-medium">
                    EXCLUSIVE HANDMADE COLLECTION
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4">
                    {slide.title}
                  </h1>

                  <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-6 max-w-xl">
                    {slide.subtitle}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(slide.link);
                    }}
                    className="border border-white px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-3 text-sm sm:text-base hover:bg-white hover:text-black transition-all duration-300"
                  >
                    DISCOVER
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}