import { AppHeader } from '@/components/app-header';
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <AppHeader />
            <main>{children}</main>
            <Toaster richColors position="top-right" />
        </div>
    );
}
