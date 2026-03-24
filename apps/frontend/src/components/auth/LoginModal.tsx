import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../UI/Button";

interface LoginModalProps {
onClose: () => void;
onLogin: (email: string, password: string) => Promise<void>;
loading?: boolean;
error?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({onClose,
onLogin,
loading = false,
error = null,
}) => {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [touched, setTouched] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email || !password) return;
    await onLogin(email, password);
};

return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                    Login
                </h2>
                <Button onClick={onClose} variant='secondary'>
                    <X/>
                </Button>
                </div>
            <form onSubmit={handleLogin}>
                <div>
                <div className="flex flex-col gap-2">
                    <input
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`border p-2 rounded ${touched && !email ? "border-red-500" : "border-gray-300"}`}
                    />
                    <input
                        placeholder="Heslo"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`border p-2 rounded ${touched && !password ? "border-red-500" : "border-gray-300"}`}
                    />
                    {error && (
                        <p className="text-red-500 text-sm">
                            {error}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between my-6">
                <Button onClick={onClose} variant="secondary" disabled={loading}>
                    Register
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !email || !password}
                >
                    {loading ? "Loading..." : "Login"}
                </Button>
            </div>
        </form>
        </div>
    </div>
);
};
