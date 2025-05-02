import React from 'react';

interface Props {
    // Define any props if needed
    name?: string;
}

export default function Profesores ({name}: Props) {
    return (
        <div>
            <h1> {name? 'or'+name : 'profesores'} </h1>
            <p>Bienvenido a la página de profesores.</p>
        </div>
    );
};

