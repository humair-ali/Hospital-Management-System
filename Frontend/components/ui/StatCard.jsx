import React, { memo } from 'react';

export const StatCard = memo(({
    title,
    value,
    icon: Icon,
    description,
    variant = 'primary',
    trend,
    loading = false
}) => {
    if (loading) {
        return (
            <div className={`bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden animate-pulse`}>
                <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100"></div>
                    <div className="w-16 h-6 bg-gray-100 rounded-full"></div>
                </div>
                <div className="space-y-3">
                    <div className="w-24 h-3 bg-gray-100 rounded"></div>
                    <div className="w-32 h-8 bg-gray-100 rounded"></div>
                    <div className="w-full h-px bg-gray-50 mt-4"></div>
                    <div className="w-48 h-3 bg-gray-50 rounded mt-2"></div>
                </div>
            </div>
        );
    }

    const variants = {
        primary: {
            container: 'bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-primary-500/20',
            icon: 'bg-white/20 text-white border-white/10',
            trend: 'bg-black/20 text-white border-white/10',
            text: 'text-white',
            subtext: 'opacity-80'
        },
        success: {
            container: 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-emerald-500/20',
            icon: 'bg-white/20 text-white border-white/10',
            trend: 'bg-black/20 text-white border-white/10',
            text: 'text-white',
            subtext: 'opacity-80'
        },
        emerald: {
            container: 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-emerald-500/20',
            icon: 'bg-white/20 text-white border-white/10',
            trend: 'bg-black/20 text-white border-white/10',
            text: 'text-white',
            subtext: 'opacity-80'
        },
        warning: {
            container: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-amber-500/10',
            icon: 'bg-white/20 text-white border-white/10',
            trend: 'bg-black/20 text-white border-white/10',
            text: 'text-white',
            subtext: 'opacity-80'
        },
        danger: {
            container: 'bg-gradient-to-br from-rose-600 to-rose-800 text-white shadow-rose-500/20',
            icon: 'bg-white/20 text-white border-white/10',
            trend: 'bg-black/20 text-white border-white/10',
            text: 'text-white',
            subtext: 'opacity-80'
        },
        indigo: {
            container: 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-indigo-500/20',
            icon: 'bg-white/20 text-white border-white/10',
            trend: 'bg-black/20 text-white border-white/10',
            text: 'text-white',
            subtext: 'opacity-80'
        },
        dark: {
            container: 'bg-gradient-to-br from-gray-900 to-black text-white shadow-gray-900/20',
            icon: 'bg-white/10 text-white border-white/10',
            trend: 'bg-white/10 text-white border-white/10',
            text: 'text-white',
            subtext: 'opacity-80'
        },
        light: {
            container: 'bg-white text-gray-900 border border-gray-100 shadow-xl shadow-gray-200/40',
            icon: 'bg-primary-50 text-primary-600 border-primary-100/50',
            trend: 'bg-gray-50 text-gray-500 border-gray-100',
            text: 'text-gray-900',
            subtext: 'text-gray-400'
        }
    };

    const c = variants[variant] || variants.primary;

    return (
        <div className={`${c.container} p-8 rounded-[2.5rem] relative overflow-hidden group transition-all hover:scale-[1.02]`}>
            {variant !== 'light' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"></div>
            )}
            <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center text-2xl shadow-inner border shadow-sm`}>
                    {Icon && <Icon size={24} />}
                </div>
                {trend && (
                    <span className={`text-[11px] font-black uppercase tracking-wider ${c.trend} px-4 py-1.5 rounded-full border shadow-sm`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className={`relative z-10 ${c.text}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${c.subtext}`}>
                    {title}
                </p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black tracking-tighter leading-none">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>
                </div>
                {description && (
                    <div className={`mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-t ${variant === 'light' ? 'border-gray-50' : 'border-white/20'} pt-4 ${c.subtext}`}>
                        <div className={`w-1.5 h-1.5 ${variant === 'light' ? 'bg-primary-500' : 'bg-white'} rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]`}></div>
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
});

StatCard.displayName = 'StatCard';