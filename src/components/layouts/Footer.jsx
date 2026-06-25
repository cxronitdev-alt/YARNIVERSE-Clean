import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";


export default function Footer() {


  const linkStyle = ({ isActive }) =>
    isActive
      ? "text-[#c9a86a] font-semibold"
      : "text-gray-400 hover:text-[#c9a86a] transition duration-300";


  return (

    <footer className="bg-[#0b0b0b] text-white">


      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14">


        <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-5 
        gap-10
        ">


          {/* BRAND */}
          <div className="lg:col-span-2">

            <h2 className="
            text-3xl 
            sm:text-4xl 
            font-serif 
            tracking-widest
            ">
              ARTISAN LUXE
            </h2>


            <div className="w-16 h-[2px] bg-[#c9a86a] my-5"></div>


            <p className="
            text-gray-400 
            text-sm 
            leading-7 
            max-w-md
            ">
              Discover handcrafted luxury pieces created by
              skilled artisans. Every product represents
              tradition, creativity and timeless elegance.
            </p>



            {/* SOCIAL */}
            <div className="flex gap-4 mt-7">


              {
                [
                  FaFacebookF,
                  FaInstagram,
                  FaPinterestP,
                  FaYoutube

                ].map((Icon,index)=>(

                  <a
                  key={index}
                  href="#"
                  className="
                  w-10 h-10
                  border
                  border-gray-700
                  rounded-full
                  flex
                  items-center
                  justify-center
                  hover:bg-[#c9a86a]
                  hover:text-black
                  transition
                  "
                  >

                    <Icon/>

                  </a>

                ))
              }


            </div>



          </div>





          {/* QUICK LINKS */}
          <div>


            <h3 className="text-lg font-semibold mb-5">
              Quick Links
            </h3>



            <ul className="space-y-3 text-sm">


              <li>
                <NavLink 
                to="/"
                className={linkStyle}
                >
                  Home
                </NavLink>
              </li>



              <li>
                <NavLink
                to="/all-handcraft"
                className={linkStyle}
                >
                  All Handcraft
                </NavLink>
              </li>




              <li>
                <NavLink
                to="/collection"
                className={linkStyle}
                >
                  Collection
                </NavLink>
              </li>



              <li>
                <NavLink
                to="/sale"
                className={linkStyle}
                >
                  Sale
                </NavLink>
              </li>



            </ul>


          </div>






          {/* CATEGORIES */}
          <div>


            <h3 className="text-lg font-semibold mb-5">
              Categories
            </h3>


            <ul className="space-y-3 text-sm">


              <li>
                <NavLink
                to="/all-handcraft"
                className={linkStyle}
                >
                  Crochet
                </NavLink>
              </li>



              <li>
                <NavLink
                to="/all-handcraft"
                className={linkStyle}
                >
                  Knitting
                </NavLink>
              </li>



              <li>
                <NavLink
                to="/craft"
                className={linkStyle}
                >
                  Home Decor
                </NavLink>
              </li>



              <li>
                <NavLink
                to="/design"
                className={linkStyle}
                >
                  Luxury Craft
                </NavLink>
              </li>



            </ul>



          </div>








          {/* CUSTOMER */}
          <div>


            <h3 className="text-lg font-semibold mb-5">
              Customer Care
            </h3>



            <ul className="space-y-3 text-sm">



              <li>
                <NavLink
                to="/profile"
                className={linkStyle}
                >
                  My Account
                </NavLink>
              </li>



              <li>
                <NavLink
                to="/my-orders"
                className={linkStyle}
                >
                  My Orders
                </NavLink>
              </li>




              <li>
                <NavLink
                to="/checkout"
                className={linkStyle}
                >
                  Checkout
                </NavLink>
              </li>



              <li>
                <NavLink
                to="/admin-login"
                className={linkStyle}
                >
                  Admin Login
                </NavLink>
              </li>
              <li>
                <NavLink
                to="/vendor-login"
                className={linkStyle}
                >
                  vendor Login
                </NavLink>
              </li>



            </ul>


          </div>


        </div>





        {/* NEWSLETTER */}


        <div className="
        mt-14
        bg-[#151515]
        border
        border-gray-800
        rounded-3xl
        p-6
        sm:p-10
        flex
        flex-col
        lg:flex-row
        gap-6
        justify-between
        items-center
        ">


          <div>

            <h3 className="
            text-2xl
            font-serif
            mb-2
            ">
              Join Luxury Circle
            </h3>


            <p className="text-gray-400 text-sm">
              Get latest collection updates and offers.
            </p>


          </div>




          <div className="
          flex
          flex-col
          sm:flex-row
          gap-3
          w-full
          lg:w-auto
          ">


            <input

            type="email"

            placeholder="Your email"

            className="
            bg-[#222]
            border
            border-gray-700
            rounded-full
            px-5
            py-3
            outline-none
            w-full
            sm:w-72
            "

            />



            <button

            className="
            bg-[#c9a86a]
            text-black
            px-8
            py-3
            rounded-full
            font-semibold
            hover:scale-105
            transition
            "

            >

              Subscribe

            </button>


          </div>



        </div>



      </div>







      {/* BOTTOM */}


      <div className="
      border-t
      border-gray-800
      ">


        <div className="
        max-w-7xl
        mx-auto
        px-5
        py-6
        flex
        flex-col
        md:flex-row
        justify-between
        items-center
        gap-4
        text-sm
        text-gray-500
        ">


          <p>
            © 2026 Artisan Luxe. All Rights Reserved.
          </p>



          <div className="
          flex
          flex-wrap
          justify-center
          gap-5
          ">


            <NavLink to="/privacy-policy">
              Privacy Policy
            </NavLink>


            <NavLink to="/terms">
              Terms
            </NavLink>


          </div>



        </div>


      </div>




    </footer>

  );
}