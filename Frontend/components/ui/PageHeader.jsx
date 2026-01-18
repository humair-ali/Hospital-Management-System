import React, { memo } from 'react';
export const PageHeader = memo(({
    title,
    subtitle,
    actions,
    accentColor = 'primary-600'
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b-2 border-gray-100 mb-2">
            <div className="relative">
                <div className={`absolute -left-5 top-1/2 -translate-y-1/2 w-1.5 h-14 bg-primary-600 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.3)]`}></div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none flex flex-col items-start gap-6">
                    {title}
                    {subtitle && (
                        <div className="flex items-center gap-3 px-0 py-0 group/header">
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse shadow-[0_0_8px_theme(colors.primary.400)]"></div>
                            <span className="text-primary-600/80 text-[11px] font-black uppercase tracking-[0.3em] leading-none">
                                {subtitle}
                            </span>
                        </div>
                    )}
                </h1>
            </div>
            <div className="flex flex-wrap gap-4">
                {actions}
            </div>
        </div>
    );
});
PageHeader.displayName = 'PageHeader';