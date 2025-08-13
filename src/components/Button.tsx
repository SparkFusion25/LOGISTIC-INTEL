import clsx from 'clsx'
import React from 'react'

type Variant = 'primary'|'secondary'|'danger'|'ghost'

export default function Button({
  children, variant='primary', className='', ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base = 'inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  const map: Record<Variant,string> = {
    primary:  'bg-brand-primary text-white hover:bg-brand-primaryHover',
    secondary:'bg-brand-secondary text-white hover:bg-brand-secondaryHover',
    danger:   'bg-brand-danger text-white hover:bg-brand-dangerHover',
    ghost:    'bg-transparent text-brand-primary hover:bg-indigo-50'
  }
  return <button className={clsx(base, map[variant], className)} {...props}>{children}</button>
}