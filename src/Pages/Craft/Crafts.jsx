import crafts from "../../data/crafts";
import HeroSlider from "../../components/home/HeroSlider";
export default function Craft() {

  return (
    <div className="bg-[#f8f7f5] min-h-screen">
<HeroSlider/>

      <div className="max-w-7xl mx-auto py-20 px-6">

        <div className="grid md:grid-cols-3 gap-8">

          {crafts.map((craft) => (
            <div
              key={craft}
              className="bg-white p-12 rounded-3xl shadow-sm hover:shadow-xl transition"
            >
              <h2 className="text-3xl font-serif text-[#3b2416]">
                {craft}
              </h2>

              <p className="mt-4 text-gray-600">
                Discover handcrafted excellence.
              </p>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}