import NavbarTop from "./ui/navbarTop"
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faHome, faAngleDown, faProjectDiagram, faCalendarAlt, faNewspaper, faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
    return (
        <div className="flex justify-between items-center">
            <section>
                <h1>UPTAMCA</h1>
            </section>
            <div className="flex justify-center">
                <NavbarTop icon={faAngleDown}>Inicio</NavbarTop>
                <NavbarTop icon={faAngleDown}>Proyectos</NavbarTop>
                <NavbarTop icon={faAngleDown}>Eventos</NavbarTop>
                <NavbarTop icon={faAngleDown}>Noticias</NavbarTop>
                <NavbarTop icon={faAngleDown}>Contáctanos</NavbarTop>
            </div>
        </div>
    )
}