export const setToken = (token: string) => {
    localStorage.setItem('token', token);
}

export const getToken = () => {
    return localStorage.getItem('token');
}

export const removeToken = () => {
    localStorage.removeItem('token');
}

export const validateToken = async () => {
    const token = getToken();
    if (!token) return null;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        return data;
    } catch (err) {
        removeToken();
        return null;
    }
}