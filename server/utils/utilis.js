export function asegurarStringEnMinusculas(variable) {
    if (typeof variable === 'string') {
        return variable.toLowerCase();
    }
}
