// import { Menu, Search } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'
// import { assets } from '../../assets/assets'

// type Props = {
//   hide: boolean
//   onMenu: () => void
//   onSearch: () => void
// }

// const MobileHeader = ({ hide, onMenu, onSearch }: Props) => {
//   const navigate = useNavigate()

//   return (
//     <header
//       className={`fixed left-0 right-0 top-0 z-[55] border-b border-slate-200/80 bg-white/75 backdrop-blur-md transition-transform duration-300 ease-out dark:border-slate-700/80 dark:bg-slate-900/75 md:hidden ${
//         hide ? 'pointer-events-none -translate-y-full' : 'translate-y-0'
//       }`}
//       style={{ paddingTop: 'env(safe-area-inset-top)' }}
//     >
//       <div className="relative flex h-14 items-center justify-between px-2">
//         <button
//           type="button"
//           onClick={onMenu}
//           className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800"
//           aria-label="Open menu"
//         >
//           <Menu className="h-6 w-6" />
//         </button>

//         <button
//           type="button"
//           onClick={() => navigate('/')}
//           className="absolute left-1/2 top-1/2 flex h-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center px-2"
//           aria-label="Go to feed"
//         >
//           <img
//             src={assets.logo}
//             alt="Loopin"
//             className="h-8 w-auto max-w-[140px] object-contain opacity-90 dark:brightness-110 dark:contrast-95"
//           />
//         </button>

//         <button
//           type="button"
//           onClick={onSearch}
//           className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800"
//           aria-label="Search"
//         >
//           <Search className="h-6 w-6" />
//         </button>
//       </div>
//     </header>
//   )
// }

// export default MobileHeader



import { Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'

type Props = {
  hide: boolean
  onMenu: () => void
  // Removed onSearch prop since search button is removed
}

const MobileHeader = ({ hide, onMenu }: Props) => {
  const navigate = useNavigate()

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[55] border-b border-slate-200/80 bg-white/75 backdrop-blur-md transition-transform duration-300 ease-out dark:border-slate-700/80 dark:bg-slate-900/75 md:hidden ${
        hide ? 'pointer-events-none -translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="relative flex h-14 items-center justify-between px-4">
        {/* Logo on the left - bigger size */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center justify-center"
          aria-label="Go to feed"
        >
          <img
            src={assets.logo}
            alt="Loopin"
            className="h-10 w-auto max-w-[160px] object-contain opacity-90 dark:brightness-110 dark:contrast-95"
          />
        </button>

        {/* Three lines menu button on the right */}
        <button
          type="button"
          onClick={onMenu}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}

export default MobileHeader
