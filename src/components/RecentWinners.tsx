"use client";
import { useEffect } from "react";

// keep the original hardcoded winners
const defaultWinners = [
    { name: "Brad", country: "canada", amount: 4500 },
    { name: "John", country: "USA", amount: 7500 },
    { name: "Maria", country: "UK", amount: 2500 },
    { name: "Liam", country: "Germany", amount: 6200 },
    { name: "Aisha", country: "Brazil", amount: 8000 },
];

// allow optional users prop
type Winner = {
  name: string;
  country: string;
  amount: number;
};

type Props = {
  users?: Winner[];
};

export default function RecentWinners({ users }: Props) {
    // use prop if passed, else fallback to hardcoded winners
    const winners = users && users.length > 0 ? users : defaultWinners;

    useEffect(() => {
        const container = document.createElement("div");
        container.className = "fixed left-4 bottom-4 flex flex-col gap-4 z-50";
        document.body.appendChild(container);

        const showToast = (winner: Winner) => {
            const el = document.createElement("div");
            el.className =
                "bg-green-600/95 text-white px-6 py-4 rounded-2xl shadow-xl border-2 border-green-400 animate-fadeIn max-w-xs md:max-w-sm font-semibold text-sm md:text-base";
            el.innerHTML = `🎉 <b>${winner.name}</b> from ${winner.country} just received <b>$${winner.amount.toLocaleString()}</b>`;
            container.appendChild(el);

            // fade out animation before removal
            setTimeout(() => {
                el.classList.add("animate-fadeOut");
                setTimeout(() => el.remove(), 800);
            }, 7000);
        };

        const randomToast = () => {
            const winner = winners[Math.floor(Math.random() * winners.length)];
            showToast(winner);
            setTimeout(randomToast, 10000 + Math.random() * 10000);
        };

        randomToast();

        return () => container.remove();
    }, [winners]);

    return null;
}
