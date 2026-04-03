import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router-dom'

interface Props {
  onNavigate?: () => void
}

const MenuItems = ({ onNavigate }: Props) => {
  return (
    <div className="space-y-1 px-6 text-sm font-medium text-gray-600 dark:text-slate-300">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={() => onNavigate?.()}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2 ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                : 'hover:bg-gray-50 dark:hover:bg-slate-800'
            }`
          }
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </div>
  )
}

export default MenuItems