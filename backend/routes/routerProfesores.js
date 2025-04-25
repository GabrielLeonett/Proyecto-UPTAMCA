import { Router } from 'express';

export class RouterProfesores {
    static datosProfesores(req, res) {
        res.render('profesores');
    }
}