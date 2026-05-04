'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthResult } from '@/types'
import api from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsAuthenticated(!!token);
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post<AuthResult>('/auth/login', { email, password });
        const { accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        document.cookie = `accessToken=${accessToken}; path=/; max-age=3600`;

        setIsAuthenticated(true);
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        const response = await api.post<AuthResult>('/auth/register', {
            email,
            password,
            firstName,
            lastName,
        });
        const { accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        document.cookie = `accessToken=${accessToken}; path=/; max-age=3600`;

        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        document.cookie = 'accessToken=; path=/; max-age=0';
        setIsAuthenticated(false);
    };
    
    return (
        <AuthContext.Provider value={ {isAuthenticated, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}