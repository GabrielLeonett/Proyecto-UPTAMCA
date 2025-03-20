import {UXHigh} from '@/types/index';
import LogoTexto from './ui/logoTexto';
import Button from '@mui/material/Button';

export default function Navbar({darkmode} : UXHigh) {
    const modo = darkmode ? 'bg-darkmode' :'bg-primary';
    return (
        <div className={`flex items-center justify-between px-5 ${modo} h-25`}>
            <section>
                <LogoTexto Primary="fill-white" Secundary='bg-secundary' shadow='drop-shadow-xl'/>
            </section>
            <Button variant="text" className='bg-secundary'>Hola</Button>
        </div>
    );
}
