'use client';
import React, { useState, useEffect, memo } from 'react';
import { FaSearch } from 'react-icons/fa';
import { globalSearch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/context/NavigationContext';

export const GlobalSearch = memo(() => {
    const router = useRouter();
    const { navigateTo } = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch();
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    async function performSearch() {
        setIsSearching(true);
        try {
            const res = await globalSearch(searchQuery);
            setSearchResults(res.data || []);
            setShowResults(true);
        } catch (err) {
            console.error('Core search kernel failure:', err);
        } finally {
            setIsSearching(false);
        }
    }

    const handleResultClick = (result) => {
        setSearchQuery('');
        setShowResults(false);
        if (result.type === 'patient') navigateTo(`patients/${result.id}`);
        else if (result.type === 'doctor') navigateTo(`doctors/${result.id}`);
        else if (result.type === 'user') navigateTo(`users/${result.id}/edit`);
        else navigateTo(`dashboard`);
    };

    return (
        <div className="relative max-w-xs w-full group block flex-1 md:flex-none">
            <div className="input-with-icon-wrapper">
                <div className="input-icon-container">
                    <FaSearch className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={14} />
                </div>
                <input
                    type="text"
                    placeholder="Search records..."
                    className="input-field input-field-with-icon h-9 bg-gray-50/50 hover:bg-white focus:bg-white text-xs transition-all shadow-none focus:shadow-sm rounded-xl border-gray-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
            </div>
            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {isSearching ? (
                        <div className="p-8 text-center border-none">
                            <div className="animate-spin h-5 w-5 mx-auto mb-2 border-[3px] border-primary-500/20 border-t-primary-500 rounded-full"></div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Searching records...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="max-h-[400px] overflow-y-auto py-2">
                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Results Found</p>
                            </div>
                            {searchResults.map((result, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full text-left px-4 py-3 hover:bg-primary-50/50 group flex items-center gap-3 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                        {result.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm truncate">{result.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100 uppercase tracking-wider">{result.type}</p>
                                            {result.subtext && <p className="text-[10px] font-medium text-gray-400 truncate tracking-tight">{result.subtext}</p>}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-sm font-medium text-gray-600">No matching records found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

GlobalSearch.displayName = 'GlobalSearch';