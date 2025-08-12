'use client';

type MiniContact = { name: string; company: string; country?: string };

export default function ContactCardMini({
  contact: { name, company, country },
}: {
  contact: MiniContact;
}) {
  return (
    <div className="select-none pointer-events-none bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg ring-1 ring-black/5 w-[180px]">
      <div className="text-[13px] font-semibold text-gray-900 truncate">{name}</div>
      <div className="text-[11px] text-gray-600 truncate">{company}</div>
      {country && (
        <div className="text-[10px] text-gray-400 mt-0.5 truncate">• {country}</div>
      )}
    </div>
  );
}