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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('accessToken');
    });
    const [isLoading, setIsLoading] = useState(false);
    

    const login = async (email: string, password: string) => {
        const response = await api.post<AuthResult>("/auth/login", {email, password});
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setIsAuthenticated(true);
    };
    
    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        const response = await api.post<AuthResult>("/auth/register", {
            email,
            password,
            firstName,
            lastName,
        });
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setIsAuthenticated(true);
    }
    
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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