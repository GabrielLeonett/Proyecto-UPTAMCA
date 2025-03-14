import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
interface NavbarItemProps {
  children: string; // Explicitly define children as a string
}

export default function NavbarTop({ children }: NavbarItemProps) {
  // Ensure the href is URL-friendly (e.g., lowercase and replace spaces with hyphens)
  const href = `/${children.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <a href={href} className="B1">
      <FontAwesomeIcon icon={faHouse} />
      {children}
    </a>
  );
}