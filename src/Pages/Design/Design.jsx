import designs from "../../data/designs";
import HeroSlider from "../../components/home/HeroSlider";
export default function Design() {
  return (
    <div className="bg-[#f8f7f5] min-h-screen">

      
<HeroSlider/>
        {/* Designs Grid */}

       <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-5xl font-serif text-center text-[#3b2416]">
          Curated Luxury Designs
        </h2>

        <p className="text-center text-gray-600 m-4 max-w-3xl mx-auto">
          Handpicked designs inspired by traditional craftsmanship and modern elegance.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {designs.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-3xl cursor-pointer"
            >

              <img
                src={item.image}
                alt={item.title}
                className="h-[450px] w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/25"></div>

              <div className="absolute bottom-8 left-8 text-white">
                <h2 className="text-3xl font-serif">
                  {item.title}
                </h2>

                <button className="mt-3 border border-white px-5 py-2 rounded-full hover:bg-white hover:text-black transition">
                  Explore
                </button>
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}