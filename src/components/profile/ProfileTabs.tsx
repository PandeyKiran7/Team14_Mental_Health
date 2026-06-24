"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ProfileTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type ProfileTabsProps = {
  tabs: ProfileTab[];
  defaultTab?: string;
};

export default function ProfileTabs({ tabs, defaultTab }: ProfileTabsProps) {
  const [current, setCurrent] = useState(defaultTab ?? tabs[0]?.id ?? "");

  const activeTab = tabs.find((tab) => tab.id === current) ?? tabs[0];

  if (tabs.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="border-b border-teal-100">
        <nav className="-mb-px flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab.id === activeTab?.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrent(tab.id)}
                className={cn(
                  "rounded-t-lg px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "border-b-2 border-teal-600 bg-white text-teal-800"
                    : "text-zinc-600 hover:bg-teal-50 hover:text-teal-800",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          hidden={tab.id !== activeTab?.id}
          aria-hidden={tab.id !== activeTab?.id}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
