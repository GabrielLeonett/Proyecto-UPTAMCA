import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {NavbarItemProps} from '@/types/index';

export default function NavbarTop({ children, icon, url }: NavbarItemProps) {

    // Ensure the href is URL-friendly (e.g., lowercase and replace spaces with hyphens)
    const href =  children ? `/${children.toLowerCase().replace(/\s+/g, '-')}` : url;
    if(href === null || href === undefined) return null;

  return (
    <a href={href} className="B1 text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium gap-2">
      <span className='m-3'>{icon ? <FontAwesomeIcon icon={icon}/> : null }</span>
      <span>{children ? children : null}</span>
    </a>
  );
}