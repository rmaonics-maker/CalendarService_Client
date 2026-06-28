import { useState } from 'react';
import { ApiError } from '../api/httpClient';
import { useAuth } from './useAuth';

type Mode = 'login' | 'register';

/**
 * Экран входа/регистрации. Dev-режим: Resource Owner Password grant
 * (loadtest_client). После регистрации требуется отдельный вход — токен
 * сервером не выдаётся.
 */
export const LoginView = () => {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<Mode>('login');

    // Общие поля
    const [email, setEmail] = useState('admin@calendar.com');
    const [password, setPassword] = useState('Password123!');
    // Только для регистрации
    const [username, setUsername] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register({ username: username || email, email, password });
                // Профиль создаётся асинхронно; логинимся сразу после регистрации.
                await login(email, password);
            }
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Произошла ошибка';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.wrap}>
            <form style={styles.card} onSubmit={handleSubmit}>
                <h1 style={styles.title}>Calendar</h1>
                <p style={styles.subtitle}>
                    {mode === 'login' ? 'Вход в систему' : 'Регистрация'}
                </p>

                {mode === 'register' && (
                    <label style={styles.field}>
                        <span style={styles.label}>Имя пользователя</span>
                        <input
                            style={styles.input}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="ivan"
                            autoComplete="username"
                        />
                    </label>
                )}

                <label style={styles.field}>
                    <span style={styles.label}>Email</span>
                    <input
                        style={styles.input}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </label>

                <label style={styles.field}>
                    <span style={styles.label}>Пароль</span>
                    <input
                        style={styles.input}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                </label>

                {error && <div style={styles.error}>{error}</div>}

                <button style={styles.submit} type="submit" disabled={submitting}>
                    {submitting
                        ? 'Подождите…'
                        : mode === 'login'
                            ? 'Войти'
                            : 'Зарегистрироваться'}
                </button>

                <button
                    type="button"
                    style={styles.switch}
                    onClick={() => {
                        setError(null);
                        setMode((m) => (m === 'login' ? 'register' : 'login'));
                    }}
                >
                    {mode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Вход'}
                </button>

                <p style={styles.hint}>
                    Dev-доступ: <code>admin@calendar.com</code> / <code>Password123!</code>
                </p>
            </form>
        </div>
    );
};

const styles = {
    wrap: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        color: '#eee',
    } as const,
    card: {
        width: 360,
        background: '#2a2a2a',
        padding: 32,
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    } as const,
    title: { margin: 0, color: '#61dafb', textAlign: 'center' as const },
    subtitle: { margin: '0 0 8px', textAlign: 'center' as const, color: '#aaa' },
    field: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
    label: { fontSize: '0.85rem', color: '#bbb' },
    input: {
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid #444',
        background: '#1e1e1e',
        color: '#eee',
        fontSize: 14,
    } as const,
    error: {
        background: '#3a1f1f',
        border: '1px solid #7a2f2f',
        color: '#ffb4b4',
        padding: '8px 10px',
        borderRadius: 6,
        fontSize: '0.85rem',
    } as const,
    submit: {
        marginTop: 4,
        padding: '10px 12px',
        borderRadius: 6,
        border: 'none',
        background: '#4caf50',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    } as const,
    switch: {
        background: 'transparent',
        border: 'none',
        color: '#61dafb',
        cursor: 'pointer',
        fontSize: '0.85rem',
    } as const,
    hint: { margin: '8px 0 0', fontSize: '0.78rem', color: '#777', textAlign: 'center' as const },
};
