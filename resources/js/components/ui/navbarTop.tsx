import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface NavbarItemProps {
  children?: string; // Explicitly define children as a string
  icon?: IconProp; // Optional icon prop
}

export default function NavbarTop({ children, icon }: NavbarItemProps) {
  if(!children) return null;
  // Ensure the href is URL-friendly (e.g., lowercase and replace spaces with hyphens)
  const href = `/${children.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <a href={href} className="B1 hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium gap-2">
      <span className='m-3'>{icon ? <FontAwesomeIcon icon={icon}/> : null }</span>
      {children ? <span>{children}</span> : null}
    </a>
  );
}