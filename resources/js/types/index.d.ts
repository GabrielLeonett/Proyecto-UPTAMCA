import { IconProp } from '@fortawesome/fontawesome-svg-core';

export type ColorBackgraund = `bg-${string}` | `bg-${string}-${number}` | `fill-${string}-${number}` | `fill-${string}`
export type Shadow = `drop-shadow-${string}`

export type LogoColores ={
    Primary:ColorBackgraund,
    Secundary:ColorBackgraund,
    shadow?: Shadow
}

export interface NavbarItemProps {
  children?: string; // Explicitly define children as a string
  icon?: IconProp; // Optional icon prop
  url?: string;
}

export interface UXHigh{
  darkmode?: boolean
}