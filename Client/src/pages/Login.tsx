// import React from 'react'
import { Star } from "lucide-react";
import { assets } from "../assets/assets" ;

const Login = () => {
  return (
    <div className='min-h-screen  flex flex-col md:flex-row '>
      {/* Background Image */}
      <img src={ assets.bgImage } alt='Bg Image' className='absolute top-0 left-0 -z-1 w-full h-full object-cover' />

      {/* Left side: branding */}
      <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40"/>
      <img src={assets.logo} alt="Logo" className="h-12 object-contain" />
      <div>
        <div className="flex items-center gap-3 mb-4 max-md:mt-10">
          <img src={assets.group_users} alt="grp_users" className="h-8 mf:h-10  " />
          <div>
            {/* 5 stars using lucide */}
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (<Star key={i} 
              className=" size-4 md:size-4.5 text-transparent fill-amber-500" />))}
            </div>
          </div>
          <p >Used by 15k+ developers</p>
        </div>

        {/* Text below stars  */}
        <h1 className="text-3xl md:text-6xl md:pb-2  font-bold text-transparent bg-gradient-to-">Login to your account</h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6">

      


    </div>
  )
}

export default Login