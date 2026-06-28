import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

/**
 * Перехватывает необработанные исключения при рендере поддерева.
 * Покрывает ошибки, которые не поймать в try/catch async-обработчиков
 * (напр. падение самого компонента в render-функции).
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, message: '' };

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            message: error?.message || 'Непредвиденная ошибка интерфейса',
        };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('ErrorBoundary поймал ошибку:', error, info);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, message: '' });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        gap: 16,
                        color: '#eee',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <h2 style={{ margin: 0 }}>Что-то пошло не так</h2>
                    <p style={{ color: '#aaa', maxWidth: 480, textAlign: 'center' }}>
                        {this.state.message}
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 6,
                            border: '1px solid #444',
                            background: '#2a2a2a',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        Попробовать снова
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
