"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { validateToken } from "../login/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await validateToken();

                if (!data) {
                    router.push("/login");
                }

                setIsAuthenticated(true);
            } catch(err) {
                router.push("/login");
            }
        }

        checkAuth();
    }, [router]);

    return isAuthenticated ? children : null;
}