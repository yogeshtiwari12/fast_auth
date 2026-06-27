import { signOut } from "next-auth/react";
import { Session } from "next-auth";

type HTTPMethods = "POST" | "PATCH" | "DELETE" | "GET";
type UpdateSession = (data?: any) => Promise<Session | null>;

export async function AuthClient(
    url: string,
    method: HTTPMethods,
    session: Session,
    updateSession?: UpdateSession,
    body?: any
) {
    const user = session?.user as any;
    
    if (!user?.accessToken) {
        console.error("No access token available");
        await signOut();
        return;
    }

    try {
        // Make the request to the desired URL
        const response = await fetch(url, {
            method: method,
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        
        // If response is okay return the json
        if (response.ok) {
            return await response.json();
        } else {
            // If access token is expired
            if (response.status === 401 && user?.refreshToken) {
                const backendUrl = process.env.BACKEND_SERVER || "http://127.0.0.1:8000";
                // Refresh the accessToken
                const refresh = await fetch(`${backendUrl}/security/refresh`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${user.refreshToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_data: user.id,
                    }),
                });

                // If the refresh works save the tokens and retry response with the new keys
                if (refresh.ok) {
                    const refreshData = await refresh.json();
                    const newAccessToken = refreshData.access_token;

                    if (updateSession) {
                        await updateSession({
                            user: {
                                ...user,
                                accessToken: refreshData.access_token,
                                refreshToken: refreshData.refresh_token,
                            }
                        });
                    }

                    // Retry with the new token
                    const retryResponse = await fetch(url, {
                        method: method,
                        headers: {
                            Authorization: `Bearer ${newAccessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: body ? JSON.stringify(body) : undefined,
                    });

                    // If response is good return the Json
                    if (retryResponse.ok) {
                        return await retryResponse.json();
                    } else {
                        const retryErrorData = await retryResponse.json();
                        throw new Error(retryErrorData.detail);
                    }
                }
            }
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error making API request');
        }
    } catch (error) {
        console.error("API request error:", error);
        throw error;
    }
}

export default AuthClient;
