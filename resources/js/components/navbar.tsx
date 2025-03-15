import { faAngleDown, faCircleUser} from '@fortawesome/free-solid-svg-icons';
import {faInstagram,faTelegram,faFacebook} from '@fortawesome/free-brands-svg-icons'
import NavbarTop from './ui/navbarTop';
import {UXHigh} from '@/types/index';
import LogoTexto from './ui/logoTexto';

export default function Navbar({darkmode} : UXHigh) {
    const modo = darkmode ? 'bg-darkmode' :'bg-primary';
    return (
        <div className={`flex items-center justify-between px-5 ${modo} h-25`}>
            <section>
                <LogoTexto Primary="fill-white" Secundary='bg-secundary' shadow='drop-shadow-xl'/>
            </section>
            <section className='flex justify-around items-center'>
                <div className="flex justify-center items-center">
                    <NavbarTop icon={faAngleDown}>Inicio</NavbarTop>
                    <NavbarTop icon={faAngleDown}>Proyectos</NavbarTop>
                    <NavbarTop icon={faAngleDown}>Eventos</NavbarTop>
                    <NavbarTop icon={faAngleDown}>Noticias</NavbarTop>
                    <NavbarTop icon={faAngleDown}>Contáctanos</NavbarTop>
                </div>
                <div>
                    <NavbarTop icon={faInstagram} url='https://www.instagram.com/uptamcaoficial'></NavbarTop>
                    <NavbarTop icon={faTelegram} url='https://t.me/secretariauptamcaoficial'></NavbarTop>
                    <NavbarTop icon={faFacebook} url='https://www.facebook.com/profile.php?id=100008931875314'></NavbarTop>
                </div>
                <div>
                    <NavbarTop icon={faCircleUser} url='https://www.facebook.com/profile.php?id=100008931875314'></NavbarTop>
                </div>
            </section>
        </div>
    );
}
