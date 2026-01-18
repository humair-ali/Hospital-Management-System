'use client';
import { useNavigation } from '@/context/NavigationContext';
import { ReactNode, MouseEvent } from 'react';
export function SPALink({
    href,
    children,
    className = '',
    ...props
}) {
    const { navigateTo } = useNavigation();
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let view = href;
        
        
        if (view.startsWith('/')) {
            if (view.startsWith('/dashboard/')) {
                view = view.replace('/dashboard/', '');
            } else {
                view = view.substring(1);
            }
        }
        
        
        
        navigateTo(view);
    };
    return (
        <a
            href={href}
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </a>
    );
}