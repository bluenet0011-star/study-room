"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
    children: ReactNode;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
    const router = useRouter();
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const THRESHOLD = 80;

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !refreshing) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || refreshing) return;
        const y = e.touches[0].clientY;
        const diff = y - startY;

        if (diff > 0 && window.scrollY === 0) {
            // Prevent default only if we are pulling down at the top
            // e.preventDefault(); // Warning: Passive event listener issue if not handled carefully
            setCurrentY(diff < THRESHOLD * 2 ? diff : THRESHOLD * 2 + (diff - THRESHOLD * 2) * 0.2); // Damping
        } else {
            setCurrentY(0);
        }
    };

    const handleTouchEnd = async () => {
        if (currentY > THRESHOLD && !refreshing) {
            setRefreshing(true);
            try {
                router.refresh();
                // Wait a bit to show the spinner (router.refresh is async but returns void immediately usually in older versions, 
                // but in app router it triggers a re-fetch. We simulate a delay or wait for effect?)
                await new Promise(resolve => setTimeout(resolve, 1000));
            } finally {
                setRefreshing(false);
                setCurrentY(0);
                setStartY(0);
            }
        } else {
            setCurrentY(0);
            setStartY(0);
        }
    };

    // Reset if scrolled down
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setStartY(0);
                setCurrentY(0);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="min-h-screen relative"
        >
            <div
                className="fixed top-0 left-0 w-full flex justify-center items-center pointer-events-none z-50 transition-all duration-300"
                style={{
                    height: refreshing ? '60px' : Math.min(currentY, THRESHOLD),
                    opacity: currentY > 0 || refreshing ? 1 : 0,
                    transform: `translateY(${refreshing ? 0 : -20}px)`
                }}
            >
                {refreshing ? (
                    <div className="bg-white rounded-full p-2 shadow-md border animate-in fade-in zoom-in">
                        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                    </div>
                ) : (
                    <div
                        className="bg-white rounded-full p-2 shadow-md border transition-transform"
                        style={{ transform: `rotate(${currentY * 2}deg)` }}
                    >
                        <Loader2 className="w-6 h-6 text-gray-400" />
                    </div>
                )}
            </div>
            <div
                style={{
                    transform: `translateY(${refreshing ? 60 : currentY > 0 ? currentY * 0.4 : 0}px)`,
                    transition: refreshing ? 'transform 0.3s ease' : 'none'
                }}
            >
                {children}
            </div>
        </div>
    );
}
