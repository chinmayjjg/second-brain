import { AxiosError, isAxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        const message = extractAxiosMessage(error);
        return message || error.message || 'Something went wrong';
    }

    if (error instanceof Error) {
        return error.message || 'Something went wrong';
    }

    return 'Something went wrong';
};

const extractAxiosMessage = (error: AxiosError): string | undefined => {
    // 1. Check for response.data.error.message first
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'error' in data) {
        const errorObj = data.error;
        if (errorObj && typeof errorObj === 'object' && 'message' in errorObj) {
            const errorMessage = errorObj.message;
            if (typeof errorMessage === 'string') {
                return errorMessage;
            }
        }
    }

    // 2. Return undefined to fallback to error.message
    return undefined;
};